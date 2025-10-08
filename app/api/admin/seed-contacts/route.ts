import { NextRequest, NextResponse } from "next/server";
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
        console.log("🌱 Starting contact seeding...");
        
        const summary = await seedContacts();
        
        return NextResponse.json({
            success: true,
            message: "Contacts seeded successfully!",
            data: summary
        });

    } catch (error) {
        console.error("Error seeding contacts:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to seed contacts", 
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check contact seeding status
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
        const { Contact, ContactStatus } = await import("@/models/Contact");
        
        await connectToDatabase();
        
        const [
            totalContacts,
            newContacts,
            inProgressContacts,
            resolvedContacts,
            closedContacts
        ] = await Promise.all([
            Contact.countDocuments({}),
            Contact.countDocuments({ status: ContactStatus.NEW }),
            Contact.countDocuments({ status: ContactStatus.IN_PROGRESS }),
            Contact.countDocuments({ status: ContactStatus.RESOLVED }),
            Contact.countDocuments({ status: ContactStatus.CLOSED })
        ]);
        
        return NextResponse.json({
            success: true,
            data: {
                totalContacts,
                statusBreakdown: {
                    new: newContacts,
                    inProgress: inProgressContacts,
                    resolved: resolvedContacts,
                    closed: closedContacts
                },
                seedingRecommended: totalContacts === 0,
                message: totalContacts === 0 
                    ? "No contacts found. Seeding is recommended."
                    : `Found ${totalContacts} contacts (${newContacts} new, ${inProgressContacts} in progress).`
            }
        });

    } catch (error) {
        console.error("Error checking contact status:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to check contact status" 
            },
            { status: 500 }
        );
    }
}
