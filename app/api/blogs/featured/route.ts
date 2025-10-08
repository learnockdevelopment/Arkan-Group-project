import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const querySchema = z.object({
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 10) : 5),
});

// Get featured blogs (Public)
export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const { limit } = querySchema.parse(queryParams);

        // Get featured blogs
        const blogs = await Blog.findFeatured(limit);

        return NextResponse.json({
            success: true,
            data: blogs
        });

    } catch (error) {
        console.error("Error fetching featured blogs:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch featured blogs" },
            { status: 500 }
        );
    }
}
