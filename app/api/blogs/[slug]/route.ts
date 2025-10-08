import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog, BlogStatus } from "@/models/Blog";
import { withApiKey } from "@/middleware/apiKey";

interface RouteParams {
    params: {
        slug: string;
    };
}

// Get blog by slug (Public)
export async function GET(request: NextRequest, { params }: RouteParams) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { slug } = params;

        // Find blog by slug
        const blog = await Blog.findOne({
            slug,
            status: BlogStatus.PUBLISHED,
            publishedAt: { $lte: new Date() }
        }).populate('authorId', 'firstName lastName avatarUrl')
          .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt');

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog post not found" },
                { status: 404 }
            );
        }

        // Increment view count (async, don't wait)
        blog.incrementView().catch(console.error);

        // Get related posts if not set
        let relatedPosts = blog.relatedPosts;
        if (!relatedPosts || relatedPosts.length === 0) {
            relatedPosts = await Blog.find({
                _id: { $ne: blog._id },
                category: blog.category,
                status: BlogStatus.PUBLISHED,
                publishedAt: { $lte: new Date() }
            }).select('title slug excerpt featuredImage publishedAt')
              .sort({ publishedAt: -1 })
              .limit(3)
              .lean();
        }

        return NextResponse.json({
            success: true,
            data: {
                ...blog.toObject(),
                relatedPosts
            }
        });

    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}
