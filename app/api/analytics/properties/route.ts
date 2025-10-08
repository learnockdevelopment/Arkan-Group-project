import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property, PropertyType, PropertyStatus } from "@/models/Property";
import { Investment, InvestmentStatus } from "@/models/Investment";
import { PropertyView } from "@/models/PropertyView";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";

// GET - Property analytics (Admin only)
export async function GET(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Property statistics
        const [
            totalProperties,
            propertiesByType,
            propertiesByStatus,
            recentProperties,
            topViewedProperties,
            totalInvestments,
            totalInvestmentValue,
            activeInvestors,
            recentInvestments,
            monthlyInvestmentTrend
        ] = await Promise.all([
            // Total properties
            Property.countDocuments({ isActive: true }),
            
            // Properties by type
            Property.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ]),
            
            // Properties by status
            Property.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            
            // Recent properties
            Property.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name type location createdAt')
                .populate('developerId', 'firstName lastName'),
            
            // Top viewed properties
            PropertyView.getTopViewedProperties(10, days),
            
            // Total investments
            Investment.countDocuments({ isActive: true }),
            
            // Total investment value
            Investment.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: null, total: { $sum: "$totalInvestment" } } }
            ]).then(result => result[0]?.total || 0),
            
            // Active investors
            Investment.distinct('userId', { 
                isActive: true, 
                status: { $in: [InvestmentStatus.ACTIVE, InvestmentStatus.PENDING] }
            }).then(users => users.length),
            
            // Recent investments
            Investment.find({ isActive: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('userId', 'firstName lastName')
                .populate('propertyId', 'name type'),
            
            // Monthly investment trend (last 12 months)
            Investment.aggregate([
                {
                    $match: {
                        isActive: true,
                        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        totalValue: { $sum: "$totalInvestment" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        // Calculate funding statistics
        const fundingStats = await Property.aggregate([
            { $match: { isActive: true } },
            {
                $addFields: {
                    fundingPercentage: {
                        $cond: {
                            if: { $gt: ["$totalShares", 0] },
                            then: {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $subtract: ["$totalShares", "$availableShares"] },
                                            "$totalShares"
                                        ]
                                    },
                                    100
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageFunding: { $avg: "$fundingPercentage" },
                    fullyFunded: {
                        $sum: {
                            $cond: [{ $eq: ["$availableShares", 0] }, 1, 0]
                        }
                    },
                    partiallyFunded: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: ["$fundingPercentage", 0] },
                                        { $lt: ["$fundingPercentage", 100] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalProperties,
                    totalInvestments,
                    totalInvestmentValue,
                    activeInvestors,
                    averageFundingPercentage: fundingStats[0]?.averageFunding || 0,
                    fullyFundedProperties: fundingStats[0]?.fullyFunded || 0,
                    partiallyFundedProperties: fundingStats[0]?.partiallyFunded || 0
                },
                distributions: {
                    propertiesByType: propertiesByType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    propertiesByStatus: propertiesByStatus.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {})
                },
                trends: {
                    monthlyInvestments: monthlyInvestmentTrend
                },
                recent: {
                    properties: recentProperties,
                    investments: recentInvestments
                },
                topPerforming: {
                    viewedProperties: topViewedProperties
                }
            }
        });

    } catch (error) {
        console.error('Error fetching property analytics:', error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
