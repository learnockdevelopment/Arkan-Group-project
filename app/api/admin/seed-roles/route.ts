import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { withAuth } from "@/app/api/_utils/withAuth";
import { requireRole } from "@/middleware/authorize";
import { ensureDefaultRoles } from "@/lib/roles";

export const POST = withAuth(async (req: NextRequest) => {
    //const auth = requireRole(req, ["admin"]);
    //if (auth) return auth;
    await connectToDatabase();
    await ensureDefaultRoles();
    return NextResponse.json({ seeded: true });
});


