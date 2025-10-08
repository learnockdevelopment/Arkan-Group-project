import { NextRequest, NextResponse } from "next/server";
import { seedProperties } from "@/lib/seedProperties";
import { requireRole } from "@/middleware/authorize";
import { withAuth } from "@/app/api/_utils/withAuth";

export async function POST(request: NextRequest) {
    // Only allow admin to run seed
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        console.log("🌱 Starting property seeding...");
        
        const summary = await seedProperties();
        
        return NextResponse.json({
            success: true,
            message: "Properties seeded successfully!",
            data: summary
        });

    } catch (error) {
        console.error("Error seeding properties:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to seed properties", 
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check if seeding is needed
export async function GET(request: NextRequest) {
    const authResult = await withAuth(request);
    if (authResult.error) {
        return NextResponse.json(authResult.error, { status: authResult.status });
    }

    const roleCheck = requireRole(request, ["admin"]);
    if (roleCheck) return roleCheck;

    try {
        const { connectToDatabase } = await import("@/lib/db");
        const { Property } = await import("@/models/Property");
        
        await connectToDatabase();
        
        const propertyCount = await Property.countDocuments({ isActive: true });
        
        return NextResponse.json({
            success: true,
            data: {
                currentPropertyCount: propertyCount,
                seedingRecommended: propertyCount === 0,
                message: propertyCount === 0 
                    ? "No properties found. Seeding is recommended."
                    : `Found ${propertyCount} properties in database.`
            }
        });

    } catch (error) {
        console.error("Error checking seed status:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to check seed status" 
            },
            { status: 500 }
        );
    }
}
