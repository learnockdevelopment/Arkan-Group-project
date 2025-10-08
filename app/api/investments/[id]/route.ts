import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Investment, InvestmentStatus } from "@/models/Investment";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { isValidObjectId } from "mongoose";

interface RouteParams {
    params: {
        id: string;
    };
}

// GET - Get investment details
export async function GET(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid investment ID" },
                { status: 400 }
            );
        }

        // Find investment and ensure it belongs to the user
        const investment = await Investment.findOne({
            _id: id,
            userId,
            isActive: true
        }).populate('propertyId', 'name type location image deliveryDate developerId')
          .populate('propertyId.developerId', 'firstName lastName email phone');

        if (!investment) {
            return NextResponse.json(
                { success: false, message: "Investment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: investment
        });

    } catch (error) {
        console.error('Error fetching investment:', error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch investment" },
            { status: 500 }
        );
    }
}

// PUT - Update investment (mainly for payment status)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        const body = await request.json();
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid investment ID" },
                { status: 400 }
            );
        }

        // Find investment and ensure it belongs to the user
        const investment = await Investment.findOne({
            _id: id,
            userId,
            isActive: true
        });

        if (!investment) {
            return NextResponse.json(
                { success: false, message: "Investment not found" },
                { status: 404 }
            );
        }

        const { action, installmentId, transactionId } = body;

        if (action === 'pay_down_payment') {
            if (investment.downPaymentPaid) {
                return NextResponse.json(
                    { success: false, message: "Down payment already paid" },
                    { status: 400 }
                );
            }

            await investment.payDownPayment(transactionId);

            return NextResponse.json({
                success: true,
                message: "Down payment recorded successfully",
                data: investment
            });

        } else if (action === 'pay_installment') {
            if (!installmentId) {
                return NextResponse.json(
                    { success: false, message: "Installment ID is required" },
                    { status: 400 }
                );
            }

            await investment.payInstallment(installmentId, transactionId);

            return NextResponse.json({
                success: true,
                message: "Installment payment recorded successfully",
                data: investment
            });

        } else {
            return NextResponse.json(
                { success: false, message: "Invalid action" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error updating investment:', error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to update investment" },
            { status: 500 }
        );
    }
}

// DELETE - Cancel investment (only if no payments made)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const { id } = params;
        const userId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid investment ID" },
                { status: 400 }
            );
        }

        // Find investment and ensure it belongs to the user
        const investment = await Investment.findOne({
            _id: id,
            userId,
            isActive: true
        });

        if (!investment) {
            return NextResponse.json(
                { success: false, message: "Investment not found" },
                { status: 404 }
            );
        }

        // Check if any payments have been made
        if (investment.downPaymentPaid || investment.totalPaid > 0) {
            return NextResponse.json(
                { success: false, message: "Cannot cancel investment with payments made" },
                { status: 400 }
            );
        }

        // Check if investment is still pending
        if (investment.status !== InvestmentStatus.PENDING) {
            return NextResponse.json(
                { success: false, message: "Can only cancel pending investments" },
                { status: 400 }
            );
        }

        // Cancel investment (soft delete)
        investment.status = InvestmentStatus.CANCELLED;
        investment.isActive = false;
        await investment.save();

        // Return shares to property
        const Property = require('@/models/Property').Property;
        await Property.findByIdAndUpdate(
            investment.propertyId,
            { 
                $inc: { 
                    availableShares: investment.sharesInvested,
                    totalInvested: -investment.totalInvestment
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: "Investment cancelled successfully"
        });

    } catch (error) {
        console.error('Error cancelling investment:', error);
        return NextResponse.json(
            { success: false, message: "Failed to cancel investment" },
            { status: 500 }
        );
    }
}
