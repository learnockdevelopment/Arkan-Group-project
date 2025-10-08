import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog, BlogCategory, BlogStatus } from "@/models/Blog";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";
import { requireRole } from "@/middleware/authorize";
import { z } from "zod";

const blogSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    excerpt: z.string().min(1, "Excerpt is required").max(500),
    content: z.string().min(1, "Content is required"),
    featuredImage: z.string().url("Invalid featured image URL"),
    images: z.array(z.string().url()).optional().default([]),
    category: z.enum(Object.values(BlogCategory) as [string, ...string[]]).optional().default(BlogCategory.GENERAL),
    tags: z.array(z.string()).optional().default([]),
    status: z.enum(Object.values(BlogStatus) as [string, ...string[]]).optional().default(BlogStatus.DRAFT),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
    commentsEnabled: z.boolean().optional().default(true),
    relatedPosts: z.array(z.string()).optional().default([]),
    slug: z.string().optional(),
});

const querySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
    status: z.enum([...Object.values(BlogStatus), 'all'] as [string, ...string[]]).optional().default('all'),
    category: z.enum(Object.values(BlogCategory) as [string, ...string[]]).optional(),
    authorId: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'publishedAt', 'title', 'viewCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get all blogs (Admin)
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
        
        const {
            page,
            limit,
            status,
            category,
            authorId,
            search,
            sortBy,
            sortOrder
        } = querySchema.parse(queryParams);

        // Build filter
        const filter: any = {};
        
        if (status !== 'all') filter.status = status;
        if (category) filter.category = category;
        if (authorId) filter.authorId = authorId;
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Build sort
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [blogs, totalCount] = await Promise.all([
            Blog.find(filter)
                .populate('authorId', 'firstName lastName email avatarUrl')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select('-content') // Exclude content for listing
                .lean(),
            Blog.countDocuments(filter)
        ]);

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

// Create new blog (Admin)
export async function POST(request: NextRequest) {
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
        
        const authorId = (request as any).userId;
        const body = await request.json();
        
        const validatedData = blogSchema.parse(body);

        // Create blog
        const blog = new Blog({
            ...validatedData,
            authorId
        });

        await blog.save();

        // Populate author for response
        await blog.populate('authorId', 'firstName lastName email avatarUrl');

        return NextResponse.json({
            success: true,
            message: "Blog created successfully",
            data: blog
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating blog:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to create blog" },
            { status: 500 }
        );
    }
}
