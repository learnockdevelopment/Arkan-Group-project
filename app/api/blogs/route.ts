import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog, BlogCategory, BlogStatus } from "@/models/Blog";
import { withApiKey } from "@/middleware/apiKey";
import { z } from "zod";

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 20) : 10),
    category: z.enum(Object.values(BlogCategory) as [string, ...string[]]).optional(),
    featured: z.string().optional().transform(val => val === 'true'),
    search: z.string().optional(),
    sortBy: z.enum(['publishedAt', 'viewCount', 'likeCount']).optional().default('publishedAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get published blogs (Public)
export async function GET(request: NextRequest) {
    // Check API key
    const apiKeyResult = await withApiKey(request);
    if (apiKeyResult) return apiKeyResult;

    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const {
            page,
            limit,
            category,
            featured,
            search,
            sortBy,
            sortOrder
        } = querySchema.parse(queryParams);

        let blogs;
        let totalCount;

        if (search) {
            // Text search
            blogs = await Blog.searchPosts(search, { limit: limit * page });
            blogs = blogs.slice((page - 1) * limit, page * limit);
            totalCount = await Blog.countDocuments({
                $text: { $search: search },
                status: BlogStatus.PUBLISHED,
                publishedAt: { $lte: new Date() }
            });
        } else {
            // Regular filtering
            const filter: any = {
                status: BlogStatus.PUBLISHED,
                publishedAt: { $lte: new Date() }
            };

            if (category) filter.category = category;
            if (featured) filter.isFeatured = true;

            // Build sort
            const sort: any = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            // Execute query with pagination
            const skip = (page - 1) * limit;
            
            [blogs, totalCount] = await Promise.all([
                Blog.find(filter)
                    .populate('authorId', 'firstName lastName avatarUrl')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .select('-content') // Exclude full content for listing
                    .lean(),
                Blog.countDocuments(filter)
            ]);
        }

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: {
                blogs,
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
        console.error("Error fetching blogs:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid query parameters", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}
