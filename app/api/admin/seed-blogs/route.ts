import { NextRequest, NextResponse } from "next/server";
import { seedBlogs } from "@/lib/seedBlogs";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";
import { withApiKey } from "@/middleware/apiKey";

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
        console.log("🌱 Starting blog seeding...");
        
        const summary = await seedBlogs();
        
        return NextResponse.json({
            success: true,
            message: "Blogs seeded successfully!",
            data: summary
        });

    } catch (error) {
        console.error("Error seeding blogs:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to seed blogs", 
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check blog seeding status
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
        const { connectToDatabase } = await import("@/lib/db");
        const { Blog, BlogStatus } = await import("@/models/Blog");
        
        await connectToDatabase();
        
        const [
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            featuredBlogs
        ] = await Promise.all([
            Blog.countDocuments({}),
            Blog.countDocuments({ status: BlogStatus.PUBLISHED }),
            Blog.countDocuments({ status: BlogStatus.DRAFT }),
            Blog.countDocuments({ isFeatured: true })
        ]);
        
        return NextResponse.json({
            success: true,
            data: {
                totalBlogs,
                publishedBlogs,
                draftBlogs,
                featuredBlogs,
                seedingRecommended: totalBlogs === 0,
                message: totalBlogs === 0 
                    ? "No blogs found. Seeding is recommended."
                    : `Found ${totalBlogs} blogs (${publishedBlogs} published, ${draftBlogs} drafts).`
            }
        });

    } catch (error) {
        console.error("Error checking blog status:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to check blog status" 
            },
            { status: 500 }
        );
    }
}
