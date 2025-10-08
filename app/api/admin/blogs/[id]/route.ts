import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Blog, BlogCategory, BlogStatus } from "@/models/Blog";
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

const updateBlogSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    excerpt: z.string().min(1).max(500).optional(),
    content: z.string().min(1).optional(),
    featuredImage: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    category: z.enum(Object.values(BlogCategory) as [string, ...string[]]).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(Object.values(BlogStatus) as [string, ...string[]]).optional(),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    commentsEnabled: z.boolean().optional(),
    relatedPosts: z.array(z.string()).optional(),
    slug: z.string().optional(),
});

// Get blog details (Admin)
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
                { success: false, message: "Invalid blog ID" },
                { status: 400 }
            );
        }

        // Find blog with full details
        const blog = await Blog.findById(id)
            .populate('authorId', 'firstName lastName email avatarUrl')
            .populate('relatedPosts', 'title slug excerpt featuredImage');

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: blog
        });

    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}

// Update blog (Admin)
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
        
        if (!isValidObjectId(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid blog ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateBlogSchema.parse(body);

        // Update blog
        const blog = await Blog.findByIdAndUpdate(
            id,
            { 
                ...validatedData,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('authorId', 'firstName lastName email avatarUrl');

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Blog updated successfully",
            data: blog
        });

    } catch (error) {
        console.error("Error updating blog:", error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, message: "Validation failed", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to update blog" },
            { status: 500 }
        );
    }
}

// Delete blog (Admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
                { success: false, message: "Invalid blog ID" },
                { status: 400 }
            );
        }

        // Delete blog
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return NextResponse.json(
                { success: false, message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting blog:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete blog" },
            { status: 500 }
        );
    }
}
