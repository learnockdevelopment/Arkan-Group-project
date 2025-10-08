import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const withdrawSchema = z.object({
    amount: z.number().min(1, "Amount must be at least 1"),
    cardId: z.string().min(1, "Card ID is required"),
    description: z.string().optional(),
});

// Create withdrawal transaction model
async function getTransactionModel() {
    const { default: mongoose } = await import('mongoose');
    
    if (mongoose.models.Transaction) {
        return mongoose.models.Transaction;
    }

    const transactionSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
        type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
        amount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
        cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
        transactionId: { type: String, unique: true }, // External transaction ID
        description: { type: String },
        processedAt: { type: Date },
        failureReason: { type: String },
    }, { timestamps: true });

    return mongoose.model('Transaction', transactionSchema);
}

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
        
        const { amount, cardId, description } = withdrawSchema.parse(body);

        // Find user and wallet
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Check if user is verified (required for withdrawals)
        if (!user.isVerified) {
            return NextResponse.json(
                { success: false, message: "ID verification required for withdrawals" },
                { status: 403 }
            );
        }

        // Get or create wallet
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return NextResponse.json(
                { success: false, message: "Wallet not found" },
                { status: 404 }
            );
        }

        // Check if user has sufficient balance
        if (wallet.balance < amount) {
            return NextResponse.json(
                { success: false, message: "Insufficient balance" },
                { status: 400 }
            );
        }

        // Verify card belongs to user
        const { default: mongoose } = await import('mongoose');
        const Card = mongoose.models.Card;
        
        if (Card) {
            const card = await Card.findOne({ _id: cardId, userId, isActive: true });
            if (!card) {
                return NextResponse.json(
                    { success: false, message: "Card not found or not accessible" },
                    { status: 404 }
                );
            }
        }

        // Create transaction record
        const Transaction = await getTransactionModel();
        
        const transaction = new Transaction({
            userId,
            walletId: wallet._id,
            type: 'withdrawal',
            amount,
            cardId,
            description: description || `Withdrawal of ${amount} ${wallet.currency}`,
            transactionId: `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending'
        });

        await transaction.save();

        // Deduct amount from wallet (you might want to do this after payment processing)
        wallet.balance -= amount;
        await wallet.save();

        // Update transaction status to completed (in real app, this would be done by payment processor)
        transaction.status = 'completed';
        transaction.processedAt = new Date();
        await transaction.save();

        return NextResponse.json({
            success: true,
            message: "Withdrawal request processed successfully",
            data: {
                transactionId: transaction.transactionId,
                amount,
                newBalance: wallet.balance,
                status: transaction.status,
                processedAt: transaction.processedAt
            }
        });

    } catch (error) {
        console.error("Error processing withdrawal:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to process withdrawal" },
            { status: 500 }
        );
    }
}
