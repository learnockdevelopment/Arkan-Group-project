import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property } from "@/models/Property";
import { PropertyView } from "@/models/PropertyView";
import { Investment } from "@/models/Investment";
import { withApiKey } from "@/middleware/apiKey";
import { isValidObjectId } from "mongoose";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { id } = params;
        
        // Validate ObjectId
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        // Find property with developer details
        const property = await Property.findOne({ 
            _id: id, 
            isActive: true 
        }).populate('developerId', 'firstName lastName email phone avatarUrl website founded');

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            );
        }

        // Get additional analytics data
        const [
            totalInvestments,
            uniqueInvestors,
            recentViews,
            bundleProperties
        ] = await Promise.all([
            // Total number of investments
            Investment.countDocuments({ propertyId: id, isActive: true }),
            
            // Number of unique investors
            Investment.distinct('userId', { propertyId: id, isActive: true }).then(users => users.length),
            
            // Recent views count (last 30 days)
            PropertyView.getPropertyViews(id, 30),
            
            // If it's a bundle, get the properties in the bundle
            property.type === 'bundle' && property.bundleProperties?.length > 0
                ? Property.find({ 
                    _id: { $in: property.bundleProperties }, 
                    isActive: true 
                }).select('name location price image rooms bathrooms')
                : null
        ]);

        // Track this view (get user info from headers if available)
        const userAgent = request.headers.get('user-agent') || '';
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        const referrer = request.headers.get('referer') || '';

        // Create view record (async, don't wait for it)
        PropertyView.create({
            propertyId: id,
            userId: null, // Will be set if user is authenticated
            ipAddress,
            userAgent,
            referrer,
            sessionId: request.headers.get('x-session-id') || `${Date.now()}-${Math.random()}`
        }).catch(console.error);

        // Increment view count
        Property.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(console.error);

        // Prepare response data
        const responseData = {
            ...property.toObject(),
            analytics: {
                totalInvestments,
                uniqueInvestors,
                recentViews,
                fundingPercentage: property.fundingPercentage,
                remainingShares: property.remainingShares
            },
            bundleProperties: bundleProperties || undefined
        };

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch property details" },
            { status: 500 }
        );
    }
}

// Get property investment opportunities (for investment page)
export async function POST(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { id } = params;
        const body = await request.json();
        const { shares, userId } = body;

        // Validate inputs
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid property ID" },
                { status: 400 }
            );
        }

        if (!shares || shares < 1) {
            return NextResponse.json(
                { success: false, message: "Invalid number of shares" },
                { status: 400 }
            );
        }

        // Find property
        const property = await Property.findOne({ 
            _id: id, 
            isActive: true 
        });

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            );
        }

        // Check if investment is possible
        const canInvestResult = property.canInvest(shares, userId);
        
        if (!canInvestResult.canInvest) {
            return NextResponse.json(
                { success: false, message: canInvestResult.reason },
                { status: 400 }
            );
        }

        // Calculate investment details
        const totalInvestment = shares * property.sharePrice;
        const downPayment = shares * property.shareDownPayment;
        const installmentAmount = shares * property.shareInstallment;
        const totalInstallments = property.numberOfInstallments;

        // Calculate installment schedule
        const installmentSchedule = [];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1); // Start next month

        for (let i = 1; i <= totalInstallments; i++) {
            const dueDate = new Date(startDate);
            
            // Calculate due date based on frequency
            switch (property.installmentsFrequency) {
                case 'monthly':
                    dueDate.setMonth(dueDate.getMonth() + (i - 1));
                    break;
                case 'quarterly':
                    dueDate.setMonth(dueDate.getMonth() + ((i - 1) * 3));
                    break;
                case 'semi_annual':
                    dueDate.setMonth(dueDate.getMonth() + ((i - 1) * 6));
                    break;
                case 'annual':
                    dueDate.setFullYear(dueDate.getFullYear() + (i - 1));
                    break;
            }

            installmentSchedule.push({
                installmentNumber: i,
                amount: installmentAmount,
                dueDate: dueDate.toISOString().split('T')[0] // YYYY-MM-DD format
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                propertyId: id,
                propertyName: property.name,
                sharesRequested: shares,
                availableShares: property.availableShares,
                sharePrice: property.sharePrice,
                totalInvestment,
                paymentStructure: {
                    downPayment,
                    installmentAmount,
                    numberOfInstallments: totalInstallments,
                    frequency: property.installmentsFrequency,
                    installmentSchedule
                },
                expectedDelivery: property.deliveryDate,
                expectedROI: property.roi
            }
        });

    } catch (error) {
        console.error('Error calculating investment:', error);
        return NextResponse.json(
            { success: false, message: "Failed to calculate investment details" },
            { status: 500 }
        );
    }
}
