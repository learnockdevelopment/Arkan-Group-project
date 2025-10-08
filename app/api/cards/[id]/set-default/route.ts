import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Card } from "@/models/Card";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { isValidObjectId } from "mongoose";

interface RouteParams {
    params: {
        id: string;
    };
}

// Set card as default
export async function POST(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Invalid card ID" },
                { status: 400 }
            );
        }

        // Verify card belongs to user and is active
        const card = await Card.findOne({ _id: id, userId, isActive: true });
        if (!card) {
            return NextResponse.json(
                { success: false, message: "Card not found" },
                { status: 404 }
            );
        }

        // Check if already default
        if (card.isDefault) {
            return NextResponse.json(
                { success: false, message: "Card is already set as default" },
                { status: 400 }
            );
        }

        // Set as default card (this will unset other default cards via pre-save middleware)
        card.isDefault = true;
        await card.save();

        return NextResponse.json({
            success: true,
            message: "Card set as default successfully",
            data: {
                id: card._id,
                maskedCardNumber: card.maskedCardNumber,
                isDefault: card.isDefault
            }
        });

    } catch (error) {
        console.error("Error setting default card:", error);
        return NextResponse.json(
            { success: false, message: "Failed to set default card" },
            { status: 500 }
        );
    }
}
