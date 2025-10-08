import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { Investment } from "@/models/Investment";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

interface RouteParams {
    params: {
        id: string;
    };
}

const updatePropertySchema = z.object({
    name: z.string().min(1).max(200).optional(),
    location: z.string().optional(),
    image: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    landSize: z.string().optional(),
    license: z.string().optional(),
    about: z.string().min(10).optional(),
    offers: z.array(z.string()).optional(),
    keyHighlights: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1)
    })).max(5).optional(),
    reasonsToInvest: z.array(z.object({
        title: z.string().min(1),
        desc: z.string().min(1)
    })).max(3).optional(),
    roi: z.number().min(0).max(100).optional(),
    rooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional(),
    deliveryDate: z.string().transform(str => new Date(str)).optional(),
    deliveryStatus: z.enum(Object.values(PropertyStatus) as [string, ...string[]]).optional(),
    documents: z.array(z.object({
        title: z.string().min(1),
        url: z.string().url()
    })).optional(),
    projectValue: z.number().min(0).optional(),
    expectedReturns: z.number().min(0).optional(),
});

// GET - Get owner's property details
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["owner", "admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Find property and ensure it belongs to the owner
        const property = await Property.findOne({
            _id: id,
            developerId: userId,
            isActive: true
        }).populate('bundleProperties', 'name location price image');

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found or access denied" },
                { status: 404 }
            );
        }

        // Get investment statistics for this property
        const [
            totalInvestments,
            totalInvestors,
            totalInvested,
            activeInvestments,
            completedInvestments,
            recentInvestments,
            monthlyRevenue
        ] = await Promise.all([
            Investment.countDocuments({ propertyId: id, isActive: true }),
            Investment.distinct('userId', { propertyId: id, isActive: true }).then(users => users.length),
            Investment.aggregate([
                { $match: { propertyId: property._id, isActive: true } },
                { $group: { _id: null, total: { $sum: "$totalInvestment" } } }
            ]).then(result => result[0]?.total || 0),
            Investment.countDocuments({ propertyId: id, status: 'active', isActive: true }),
            Investment.countDocuments({ propertyId: id, status: 'completed', isActive: true }),
            Investment.find({ propertyId: id, isActive: true })
                .populate('userId', 'firstName lastName email phone')
                .sort({ createdAt: -1 })
                .limit(10),
            // Calculate monthly revenue from installments
            Investment.aggregate([
                { $match: { propertyId: property._id, isActive: true } },
                { $unwind: "$installments" },
                { 
                    $match: { 
                        "installments.status": "paid",
                        "installments.paidDate": {
                            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: "$installments.amount" } } }
            ]).then(result => result[0]?.total || 0)
        ]);

        const responseData = {
            ...property.toObject(),
            statistics: {
                totalInvestments,
                totalInvestors,
                totalInvested,
                activeInvestments,
                completedInvestments,
                monthlyRevenue,
                fundingPercentage: property.fundingPercentage,
                remainingShares: property.remainingShares
            },
            recentInvestments
        };

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch property" },
            { status: 500 }
        );
    }
}

// PUT - Update owner's property
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["owner", "admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updatePropertySchema.parse(body);

        // Check if property exists and belongs to owner
        const existingProperty = await Property.findOne({
            _id: id,
            developerId: userId,
            isActive: true
        });

        if (!existingProperty) {
            return NextResponse.json(
                { success: false, message: "Property not found or access denied" },
                { status: 404 }
            );
        }

        // Check if property has active investments - restrict certain changes
        const hasActiveInvestments = await Investment.exists({ 
            propertyId: id, 
            status: { $in: ['active', 'pending'] },
            isActive: true 
        });

        // Owners cannot change financial terms if there are active investments
        if (hasActiveInvestments) {
            const restrictedFields = ['price', 'totalShares', 'advancement', 'numberOfInstallments'];
            const hasRestrictedChanges = restrictedFields.some(field => 
                validatedData[field as keyof typeof validatedData] !== undefined
            );
            
            if (hasRestrictedChanges) {
                return NextResponse.json(
                    { 
                        success: false, 
                        message: "Cannot modify financial terms for properties with active investments" 
                    },
                    { status: 400 }
                );
            }
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { 
                ...validatedData,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        return NextResponse.json({
            success: true,
            message: "Property updated successfully",
            data: updatedProperty
        });

    } catch (error) {
        console.error('Error updating property:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update property" },
            { status: 500 }
        );
    }
}

// DELETE - Delete owner's property (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["owner", "admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Check if property exists and belongs to owner
        const property = await Property.findOne({
            _id: id,
            developerId: userId,
            isActive: true
        });

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found or access denied" },
                { status: 404 }
            );
        }

        // Check for active investments
        const hasActiveInvestments = await Investment.exists({ 
            propertyId: id, 
            status: { $in: ['active', 'pending'] },
            isActive: true 
        });

        if (hasActiveInvestments) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Cannot delete property with active investments" 
                },
                { status: 400 }
            );
        }

        // Soft delete
        await Property.findByIdAndUpdate(id, { 
            isActive: false,
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: "Property deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
            { success: false, message: "Failed to delete property" },
            { status: 500 }
        );
    }
}
