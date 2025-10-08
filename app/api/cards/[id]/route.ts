import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Card } from "@/models/Card";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

interface RouteParams {
    params: {
        id: string;
    };
}

const updateCardSchema = z.object({
    nickname: z.string().optional(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional()
    }).optional(),
});

// Get specific card details
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
                { success: false, message: "Invalid card ID" },
                { status: 400 }
            );
        }

        // Find card and ensure it belongs to user
        const card = await Card.findOne({ _id: id, userId, isActive: true });
        if (!card) {
            return NextResponse.json(
                { success: false, message: "Card not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: card
        });

    } catch (error) {
        console.error("Error fetching card:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch card" },
            { status: 500 }
        );
    }
}

// Update card details
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
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid card ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateCardSchema.parse(body);

        // Find and update card
        const card = await Card.findOneAndUpdate(
            { _id: id, userId, isActive: true },
            validatedData,
            { new: true }
        );

        if (!card) {
            return NextResponse.json(
                { success: false, message: "Card not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Card updated successfully",
            data: card
        });

    } catch (error) {
        console.error("Error updating card:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update card" },
            { status: 500 }
        );
    }
}

// Delete card
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
                { success: false, message: "Invalid card ID" },
                { status: 400 }
            );
        }

        // Find card and ensure it belongs to user
        const card = await Card.findOne({ _id: id, userId, isActive: true });
        if (!card) {
            return NextResponse.json(
                { success: false, message: "Card not found" },
                { status: 404 }
            );
        }

        // Check if this is the only card
        const userCardCount = await Card.countDocuments({ userId, isActive: true });
        if (userCardCount === 1) {
            return NextResponse.json(
                { success: false, message: "Cannot delete the only card. Add another card first." },
                { status: 400 }
            );
        }

        // Deactivate card
        await card.deactivate();

        // If this was the default card, set another card as default
        if (card.isDefault) {
            const nextCard = await Card.findOne({ 
                userId, 
                isActive: true, 
                _id: { $ne: id } 
            });
            
            if (nextCard) {
                nextCard.isDefault = true;
                await nextCard.save();
            }
        }

        return NextResponse.json({
            success: true,
            message: "Card deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting card:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete card" },
            { status: 500 }
        );
    }
}
