import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { requireRole } from "@/middleware/authorize";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

interface RouteParams {
    params: {
        id: string;
    };
}

const actionSchema = z.object({
    action: z.enum(['approve', 'reject']),
    rejectionReason: z.string().optional(),
});

// Review ID verification (Admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        await connectToDatabase();
        
        const { id } = params;
        const adminUserId = (request as any).userId;
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid verification ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { action, rejectionReason } = actionSchema.parse(body);

        // Validate rejection reason for reject action
        if (action === 'reject' && !rejectionReason) {
            return NextResponse.json(
                { success: false, message: "Rejection reason is required when rejecting" },
                { status: 400 }
            );
        }

        // Get IDVerification model
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

        // Find verification request
        const verification = await IDVerification.findById(id).populate('userId');
        if (!verification) {
            return NextResponse.json(
                { success: false, message: "Verification request not found" },
                { status: 404 }
            );
        }

        // Check if already reviewed
        if (verification.status !== 'pending') {
            return NextResponse.json(
                { success: false, message: "This verification request has already been reviewed" },
                { status: 400 }
            );
        }

        // Update verification status
        verification.status = action === 'approve' ? 'approved' : 'rejected';
        verification.reviewedAt = new Date();
        verification.reviewedBy = adminUserId;
        
        if (action === 'reject') {
            verification.rejectionReason = rejectionReason;
        }

        await verification.save();

        // If approved, update user's verification status
        if (action === 'approve') {
            await User.findByIdAndUpdate(verification.userId._id, {
                isVerified: true
            });
        }

        return NextResponse.json({
            success: true,
            message: `ID verification ${action}d successfully`,
            data: {
                verificationId: verification._id,
                status: verification.status,
                reviewedAt: verification.reviewedAt,
                rejectionReason: verification.rejectionReason
            }
        });

    } catch (error) {
        console.error("Error reviewing ID verification:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to review ID verification" },
            { status: 500 }
        );
    }
}

// Get specific ID verification details (Admin)
export async function GET(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

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
                { success: false, message: "Invalid verification ID" },
                { status: 400 }
            );
        }

        // Get IDVerification model
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

        // Find verification with user details
        const verification = await IDVerification.findById(id)
            .populate('userId', 'firstName lastName email phone isVerified')
            .populate('reviewedBy', 'firstName lastName');

        if (!verification) {
            return NextResponse.json(
                { success: false, message: "Verification request not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: verification
        });

    } catch (error) {
        console.error("Error fetching ID verification:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch ID verification" },
            { status: 500 }
        );
    }
}
