import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const idVerificationSchema = z.object({
    frontImageUrl: z.string().url("Invalid front image URL"),
    backImageUrl: z.string().url("Invalid back image URL"),
    idType: z.enum(['national_id', 'passport', 'driving_license']).optional().default('national_id'),
    idNumber: z.string().min(1, "ID number is required").optional(),
});

const adminActionSchema = z.object({
    action: z.enum(['approve', 'reject']),
    userId: z.string().min(1, "User ID is required"),
    rejectionReason: z.string().optional(),
});

// Submit ID verification (User)
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
        
        const { frontImageUrl, backImageUrl, idType, idNumber } = idVerificationSchema.parse(body);

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Check if user is already verified
        if (user.isVerified) {
            return NextResponse.json(
                { success: false, message: "User is already verified" },
                { status: 400 }
            );
        }

        // Store verification data (you might want to create a separate IDVerification model)
        // For now, we'll store it in user document or create a simple verification record
        const verificationData = {
            userId,
            frontImageUrl,
            backImageUrl,
            idType,
            idNumber,
            status: 'pending',
            submittedAt: new Date(),
        };

        // You could create a separate IDVerification collection, but for simplicity:
        // We'll create a simple verification record in a separate collection
        const { default: mongoose } = await import('mongoose');
        
        const verificationSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            frontImageUrl: { type: String, required: true },
            backImageUrl: { type: String, required: true },
            idType: { type: String, enum: ['national_id', 'passport', 'driving_license'], default: 'national_id' },
            idNumber: { type: String },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            submittedAt: { type: Date, default: Date.now },
            reviewedAt: { type: Date },
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rejectionReason: { type: String },
        });

        const IDVerification = mongoose.models.IDVerification || 
                              mongoose.model('IDVerification', verificationSchema);

        // Check if user already has a pending verification
        const existingVerification = await IDVerification.findOne({ 
            userId, 
            status: 'pending' 
        });

        if (existingVerification) {
            return NextResponse.json(
                { success: false, message: "You already have a pending verification request" },
                { status: 400 }
            );
        }

        // Create new verification request
        const verification = new IDVerification(verificationData);
        await verification.save();

        return NextResponse.json({
            success: true,
            message: "ID verification submitted successfully. Please wait for admin review.",
            data: {
                verificationId: verification._id,
                status: verification.status,
                submittedAt: verification.submittedAt
            }
        });

    } catch (error) {
        console.error("Error submitting ID verification:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to submit ID verification" },
            { status: 500 }
        );
    }
}

// Get user's verification status
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

        // Get user verification status
        const user = await User.findById(userId).select('isVerified');
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Get latest verification request
        const { default: mongoose } = await import('mongoose');
        const IDVerification = mongoose.models.IDVerification;
        
        let latestVerification = null;
        if (IDVerification) {
            latestVerification = await IDVerification.findOne({ userId })
                .sort({ submittedAt: -1 })
                .select('status submittedAt reviewedAt rejectionReason');
        }

        return NextResponse.json({
            success: true,
            data: {
                isVerified: user.isVerified,
                latestVerification
            }
        });

    } catch (error) {
        console.error("Error getting verification status:", error);
        return NextResponse.json(
            { success: false, message: "Failed to get verification status" },
            { status: 500 }
        );
    }
}
