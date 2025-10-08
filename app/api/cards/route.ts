import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Card } from "@/models/Card";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const addCardSchema = z.object({
    cardNumber: z.string().min(13).max(19).regex(/^\d+$/, "Card number must contain only digits"),
    cardHolderName: z.string().min(1, "Card holder name is required").max(100),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number().min(new Date().getFullYear()),
    cvv: z.string().min(3).max(4).regex(/^\d+$/, "CVV must contain only digits"),
    nickname: z.string().optional(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional().default('EG')
    }).optional(),
});

// Helper function to detect card type
function detectCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    
    return 'visa'; // default
}

// Helper function to encrypt/tokenize card number (simplified for demo)
function tokenizeCardNumber(cardNumber: string): string {
    // In real implementation, use proper encryption/tokenization service
    // This is just for demo purposes
    return Buffer.from(cardNumber).toString('base64');
}

// Get user's cards
export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;

        // Get user's cards
        const cards = await Card.findUserCards(userId);

        return NextResponse.json({
            success: true,
            data: cards
        });

    } catch (error) {
        console.error("Error fetching cards:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch cards" },
            { status: 500 }
        );
    }
}

// Add new card
export async function POST(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    try {
        await connectToDatabase();
        
        const userId = (request as any).userId;
        const body = await request.json();
        
        const validatedData = addCardSchema.parse(body);

        // Check if card already exists (by last 4 digits and expiry)
        const lastFourDigits = validatedData.cardNumber.slice(-4);
        const existingCard = await Card.findOne({
            userId,
            lastFourDigits,
            expiryMonth: validatedData.expiryMonth,
            expiryYear: validatedData.expiryYear,
            isActive: true
        });

        if (existingCard) {
            return NextResponse.json(
                { success: false, message: "This card is already added" },
                { status: 400 }
            );
        }

        // Detect card type
        const cardType = detectCardType(validatedData.cardNumber);
        
        // Check if this is user's first card (make it default)
        const userCardCount = await Card.countDocuments({ userId, isActive: true });
        const isFirstCard = userCardCount === 0;

        // Create new card
        const card = new Card({
            userId,
            cardNumber: tokenizeCardNumber(validatedData.cardNumber), // Store encrypted/tokenized
            cardHolderName: validatedData.cardHolderName,
            expiryMonth: validatedData.expiryMonth,
            expiryYear: validatedData.expiryYear,
            cardType,
            lastFourDigits,
            cardBrand: cardType.charAt(0).toUpperCase() + cardType.slice(1),
            nickname: validatedData.nickname,
            billingAddress: validatedData.billingAddress,
            isDefault: isFirstCard, // First card becomes default
        });

        await card.save();

        return NextResponse.json({
            success: true,
            message: "Card added successfully",
            data: {
                id: card._id,
                maskedCardNumber: card.maskedCardNumber,
                cardHolderName: card.cardHolderName,
                expiryDate: card.expiryDate,
                cardType: card.cardType,
                cardBrand: card.cardBrand,
                nickname: card.nickname,
                isDefault: card.isDefault
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Error adding card:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to add card" },
            { status: 500 }
        );
    }
}
