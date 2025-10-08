import { NextRequest, NextResponse } from "next/server";
import { seedProperties } from "@/lib/seedProperties";
import { seedInvestments } from "@/lib/seedInvestments";
import { seedBlogs } from "@/lib/seedBlogs";
import { seedContacts } from "@/lib/seedContacts";
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
        console.log("🌱 Starting comprehensive seeding...");
        
        // Seed properties first
        console.log("📍 Seeding properties...");
        const propertySummary = await seedProperties();
        
        // Then seed investments
        console.log("💰 Seeding investments...");
        const investmentSummary = await seedInvestments();
        
        // Seed blogs
        console.log("📝 Seeding blogs...");
        const blogSummary = await seedBlogs();
        
        // Seed contacts
        console.log("📞 Seeding contacts...");
        const contactSummary = await seedContacts();
        
        const totalSummary = {
            properties: propertySummary,
            investments: investmentSummary,
            blogs: blogSummary,
            contacts: contactSummary,
            message: "Complete database seeding successful!"
        };
        
        console.log("✅ Complete seeding finished!");
        
        return NextResponse.json({
            success: true,
            message: "Database seeded successfully with all data!",
            data: totalSummary
        });

    } catch (error) {
        console.error("Error in comprehensive seeding:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to seed database", 
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check current database status
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
        const { Property, PropertyType } = await import("@/models/Property");
        const { Investment } = await import("@/models/Investment");
        const { User } = await import("@/models/User");
        const { Blog, BlogStatus } = await import("@/models/Blog");
        const { Contact, ContactStatus } = await import("@/models/Contact");
        
        await connectToDatabase();
        
        const [
            totalProperties,
            singleProperties,
            projects,
            bundles,
            totalInvestments,
            totalUsers,
            activeInvestments,
            totalBlogs,
            publishedBlogs,
            totalContacts,
            newContacts
        ] = await Promise.all([
            Property.countDocuments({ isActive: true }),
            Property.countDocuments({ type: PropertyType.SINGLE, isActive: true }),
            Property.countDocuments({ type: PropertyType.PROJECT, isActive: true }),
            Property.countDocuments({ type: PropertyType.BUNDLE, isActive: true }),
            Investment.countDocuments({ isActive: true }),
            User.countDocuments({ status: "active" }),
            Investment.countDocuments({ status: "active", isActive: true }),
            Blog.countDocuments({}),
            Blog.countDocuments({ status: BlogStatus.PUBLISHED }),
            Contact.countDocuments({}),
            Contact.countDocuments({ status: ContactStatus.NEW })
        ]);
        
        const isEmpty = totalProperties === 0 && totalBlogs === 0 && totalContacts === 0;
        
        return NextResponse.json({
            success: true,
            data: {
                properties: {
                    total: totalProperties,
                    single: singleProperties,
                    projects: projects,
                    bundles: bundles
                },
                investments: {
                    total: totalInvestments,
                    active: activeInvestments
                },
                blogs: {
                    total: totalBlogs,
                    published: publishedBlogs
                },
                contacts: {
                    total: totalContacts,
                    new: newContacts
                },
                users: {
                    total: totalUsers
                },
                seedingRecommended: isEmpty,
                message: isEmpty 
                    ? "Database is empty. Seeding is recommended."
                    : `Database contains ${totalProperties} properties, ${totalInvestments} investments, ${totalBlogs} blogs, and ${totalContacts} contacts.`
            }
        });

    } catch (error) {
        console.error("Error checking database status:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to check database status" 
            },
            { status: 500 }
        );
    }
}
