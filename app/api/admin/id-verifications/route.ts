import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { requireRole } from "@/middleware/authorize";
import { z } from "zod";

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('all'),
    sortBy: z.enum(['submittedAt', 'reviewedAt']).optional().default('submittedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get all ID verification requests (Admin)
export async function GET(request: NextRequest) {
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
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const { page, limit, status, sortBy, sortOrder } = querySchema.parse(queryParams);

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

        // Build filter
        const filter: any = {};
        if (status !== 'all') {
            filter.status = status;
        }

        // Build sort
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [verifications, totalCount] = await Promise.all([
            IDVerification.find(filter)
                .populate('userId', 'firstName lastName email phone')
                .populate('reviewedBy', 'firstName lastName')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            IDVerification.countDocuments(filter)
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                verifications,
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
        console.error("Error fetching ID verifications:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch ID verifications" },
            { status: 500 }
        );
    }
}
