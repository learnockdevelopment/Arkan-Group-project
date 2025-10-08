import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Property } from "@/models/Property";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const querySchema = z.object({
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 20) : 6),
    type: z.string().optional(),
});

export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const { limit, type } = querySchema.parse(queryParams);

        // Build filter
        const filter: any = { 
            isFeatured: true, 
            isActive: true 
        };

        if (type && ['single', 'project', 'bundle'].includes(type)) {
            filter.type = type;
        }

        // Get featured properties
        const properties = await Property.find(filter)
            .populate('developerId', 'firstName lastName avatarUrl')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: properties
        });

    } catch (error) {
        console.error('Error fetching featured properties:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch featured properties" },
            { status: 500 }
        );
    }
}
