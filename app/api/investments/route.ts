import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Investment, InvestmentStatus } from "@/models/Investment";
import { Property, PropertyType } from "@/models/Property";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const createInvestmentSchema = z.object({
    propertyId: z.string().min(1, "Property ID is required"),
    sharesInvested: z.number().min(1, "Must invest at least 1 share"),
});

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    status: z.enum(Object.values(InvestmentStatus) as [string, ...string[]]).optional(),
    propertyType: z.enum([PropertyType.SINGLE, PropertyType.PROJECT, PropertyType.BUNDLE]).optional(),
    sortBy: z.enum(['createdAt', 'totalInvestment', 'paymentProgress']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// GET - Get user's investments
export async function GET(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const {
            page,
            limit,
            status,
            propertyType,
            sortBy,
            sortOrder
        } = querySchema.parse(queryParams);

        // Build filter
        const filter: any = { 
            userId,
            isActive: true 
        };
        
        if (status) filter.status = status;

        // Build aggregation pipeline
        const pipeline: any[] = [
            { $match: filter },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property"
                }
            },
            { $unwind: "$property" },
        ];

        // Add property type filter if specified
        if (propertyType) {
            pipeline.push({
                $match: { "property.type": propertyType }
            });
        }

        // Add sorting
        const sortObj: any = {};
        if (sortBy === 'paymentProgress') {
            // Calculate payment progress for sorting
            pipeline.push({
                $addFields: {
                    paymentProgress: {
                        $cond: {
                            if: { $gt: ["$totalInvestment", 0] },
                            then: {
                                $multiply: [
                                    { $divide: ["$totalPaid", "$totalInvestment"] },
                                    100
                                ]
                            },
                            else: 0
                        }
                    }
                }
            });
            sortObj.paymentProgress = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        pipeline.push({ $sort: sortObj });

        // Add pagination
        const skip = (page - 1) * limit;
        pipeline.push({ $skip: skip }, { $limit: limit });

        // Execute aggregation
        const [investments, totalCount] = await Promise.all([
            Investment.aggregate(pipeline),
            Investment.countDocuments(filter)
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                investments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching investments:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch investments" },
            { status: 500 }
        );
    }
}

// POST - Create new investment
export async function POST(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const body = await request.json();
        const { propertyId, sharesInvested } = createInvestmentSchema.parse(body);

        // Find and validate property
        const property = await Property.findOne({
            _id: propertyId,
            isActive: true
        });

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            );
        }

        // Check if user can invest in this property
        const canInvestResult = property.canInvest(sharesInvested, userId);
        if (!canInvestResult.canInvest) {
            return NextResponse.json(
                { success: false, message: canInvestResult.reason },
                { status: 400 }
            );
        }

        // For single properties, check if user already has investment and max shares limit
        if (property.type === PropertyType.SINGLE && property.maxSharesPerUser) {
            const existingInvestment = await Investment.findOne({
                userId,
                propertyId,
                isActive: true
            });

            if (existingInvestment) {
                const totalShares = existingInvestment.sharesInvested + sharesInvested;
                if (totalShares > property.maxSharesPerUser) {
                    return NextResponse.json(
                        { 
                            success: false, 
                            message: `Maximum ${property.maxSharesPerUser} shares per user. You already have ${existingInvestment.sharesInvested} shares.` 
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Calculate investment amounts
        const sharePrice = property.sharePrice;
        const totalInvestment = sharesInvested * sharePrice;
        const downPayment = sharesInvested * property.shareDownPayment;
        const installmentAmount = sharesInvested * property.shareInstallment;

        // Calculate first installment date based on property type
        let firstInstallmentDate = new Date();
        
        if (property.type === PropertyType.PROJECT) {
            // For projects, installments start immediately after down payment
            firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
        } else {
            // For single properties and bundles, check if this is the last share
            const remainingAfterInvestment = property.availableShares - sharesInvested;
            if (remainingAfterInvestment === 0) {
                // This completes the funding, start installments next month
                firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
            } else {
                // Wait until property is fully funded
                firstInstallmentDate = null as any; // Will be set when property is fully funded
            }
        }

        // Create investment record
        const investment = new Investment({
            userId,
            propertyId,
            sharesInvested,
            sharePrice,
            totalInvestment,
            downPayment,
            installmentAmount,
            numberOfInstallments: property.numberOfInstallments,
            firstInstallmentDate,
            status: InvestmentStatus.PENDING
        });

        // Generate installment schedule if first installment date is set
        if (firstInstallmentDate) {
            investment.generateInstallments();
        }

        await investment.save();

        // Reserve shares in property
        await property.reserveShares(sharesInvested);

        // If this is a project or the property is now fully funded, update all investments to start installments
        if (property.type === PropertyType.PROJECT || property.availableShares === 0) {
            await updateInstallmentSchedules(propertyId);
        }

        // Populate property details for response
        await investment.populate('propertyId', 'name type location image deliveryDate');

        return NextResponse.json({
            success: true,
            message: "Investment created successfully",
            data: investment
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating investment:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create investment" },
            { status: 500 }
        );
    }
}

// Helper function to update installment schedules for all investments in a property
async function updateInstallmentSchedules(propertyId: string) {
    const property = await Property.findById(propertyId);
    if (!property) return;

    const investments = await Investment.find({
        propertyId,
        isActive: true,
        firstInstallmentDate: null
    });

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1);

    for (const investment of investments) {
        investment.firstInstallmentDate = startDate;
        investment.generateInstallments();
        await investment.save();
    }
}
