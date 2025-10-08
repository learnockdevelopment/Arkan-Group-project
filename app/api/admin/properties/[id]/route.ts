import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { Investment } from "@/models/Investment";
import { User } from "@/models/User";
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
    type: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]).optional(),
    developerId: z.string().optional(),
    location: z.string().optional(),
    image: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    landSize: z.string().optional(),
    license: z.string().optional(),
    about: z.string().min(10).optional(),
    offers: z.array(z.string()).optional(),
    status: z.enum(Object.values(PropertyStatus) as [string, ...string[]]).optional(),
    keyHighlights: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1)
    })).max(5).optional(),
    reasonsToInvest: z.array(z.object({
        title: z.string().min(1),
        desc: z.string().min(1)
    })).max(3).optional(),
    price: z.number().min(0).optional(),
    priceType: z.string().optional(),
    roi: z.number().min(0).max(100).optional(),
    advancement: z.number().min(0).max(100).optional(),
    totalShares: z.number().min(1).optional(),
    maxSharesPerUser: z.number().min(1).optional(),
    numberOfInstallments: z.number().min(1).optional(),
    installmentsFrequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']).optional(),
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
    bundleProperties: z.array(z.string()).optional(),
    projectValue: z.number().min(0).optional(),
    expectedReturns: z.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

// GET - Get property details (Admin view with full details)
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Get property with all details
        const property = await Property.findById(id)
            .populate('developerId', 'firstName lastName email phone avatarUrl')
            .populate('bundleProperties', 'name location price image');

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            );
        }

        // Get investment statistics
        const [
            totalInvestments,
            totalInvestors,
            totalInvested,
            activeInvestments,
            completedInvestments,
            recentInvestments
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
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const responseData = {
            ...property.toObject(),
            statistics: {
                totalInvestments,
                totalInvestors,
                totalInvested,
                activeInvestments,
                completedInvestments,
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

// PUT - Update property
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updatePropertySchema.parse(body);

        // Check if property exists
        const existingProperty = await Property.findById(id);
        if (!existingProperty) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            );
        }

        // Check if property has active investments before allowing certain changes
        const hasActiveInvestments = await Investment.exists({ 
            propertyId: id, 
            status: { $in: ['active', 'pending'] },
            isActive: true 
        });

        // Restrict changes if there are active investments
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

        // Validate developer if being changed
        if (validatedData.developerId) {
            const developer = await User.findById(validatedData.developerId)
                .populate('roleId');
            
            if (!developer) {
                return NextResponse.json(
                    { success: false, message: "Developer not found" },
                    { status: 404 }
                );
            }

            const roleName = (developer.roleId as any)?.name;
            if (!['admin', 'owner'].includes(roleName)) {
                return NextResponse.json(
                    { success: false, message: "Developer must have admin or owner role" },
                    { status: 400 }
                );
            }
        }

        // Validate bundle properties if being changed
        if (validatedData.bundleProperties && validatedData.type === PropertyType.BUNDLE) {
            const bundleProps = await Property.find({
                _id: { $in: validatedData.bundleProperties },
                type: PropertyType.SINGLE,
                isActive: true
            });
            
            if (bundleProps.length !== validatedData.bundleProperties.length) {
                return NextResponse.json(
                    { success: false, message: "Some bundle properties not found or invalid" },
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
        ).populate('developerId', 'firstName lastName email phone avatarUrl');

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

// DELETE - Delete property (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Check if property exists
        const property = await Property.findById(id);
        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
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
