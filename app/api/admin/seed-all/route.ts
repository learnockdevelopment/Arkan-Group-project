import { NextRequest, NextResponse } from "next/server";
import { seedProperties } from "@/lib/seedProperties";
import { seedInvestments } from "@/lib/seedInvestments";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";

export async function POST(request: NextRequest) {
    // Only allow admin to run seed
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

   // const roleCheck = requireRole(request, ["admin"]);
   // if (roleCheck) return roleCheck;

    try {
        console.log("🌱 Starting comprehensive seeding...");
        
        // Seed properties first
        console.log("📍 Seeding properties...");
        const propertySummary = await seedProperties();
        
        // Then seed investments
        console.log("💰 Seeding investments...");
        const investmentSummary = await seedInvestments();
        
        const totalSummary = {
            properties: propertySummary,
            investments: investmentSummary,
            message: "Complete database seeding successful!"
        };
        
        console.log("✅ Complete seeding finished!");
        
        return NextResponse.json({
            success: true,
            message: "Database seeded successfully with properties and investments!",
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
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

   // const roleCheck = requireRole(request, ["admin"]);
    //if (roleCheck) return roleCheck;

    try {
        const { connectToDatabase } = await import("@/lib/db");
        const { Property, PropertyType } = await import("@/models/Property");
        const { Investment } = await import("@/models/Investment");
        const { User } = await import("@/models/User");
        
        await connectToDatabase();
        
        const [
            totalProperties,
            singleProperties,
            projects,
            bundles,
            totalInvestments,
            totalUsers,
            activeInvestments
        ] = await Promise.all([
            Property.countDocuments({ isActive: true }),
            Property.countDocuments({ type: PropertyType.SINGLE, isActive: true }),
            Property.countDocuments({ type: PropertyType.PROJECT, isActive: true }),
            Property.countDocuments({ type: PropertyType.BUNDLE, isActive: true }),
            Investment.countDocuments({ isActive: true }),
            User.countDocuments({ status: "active" }),
            Investment.countDocuments({ status: "active", isActive: true })
        ]);
        
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
                users: {
                    total: totalUsers
                },
                seedingRecommended: totalProperties === 0,
                message: totalProperties === 0 
                    ? "Database is empty. Seeding is recommended."
                    : `Database contains ${totalProperties} properties and ${totalInvestments} investments.`
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
