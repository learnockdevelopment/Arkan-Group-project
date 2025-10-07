import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { requireRole } from "@/middleware/authorize";

export const GET = withAuth(async (req: NextRequest) => {
    const auth = requireRole(req, ["admin", "user", "owner"]);
    if (auth) return auth;
    await connectToDatabase();
    const userId = (req as any).userId as string;
    const user = await User.findById(userId).select("firstName lastName email phone avatarUrl roleId");
    return NextResponse.json({ user });
});

export const PATCH = withAuth(async (req: NextRequest) => {
    const auth = requireRole(req, ["admin", "user", "owner"]);
    if (auth) return auth;
    await connectToDatabase();
    const userId = (req as any).userId as string;
    const body = await req.json();
    const updates: any = {};
    if (body.firstName) updates.firstName = body.firstName;
    if (body.lastName) updates.lastName = body.lastName;
    if (body.avatarUrl) updates.avatarUrl = body.avatarUrl;
    // email/phone updates should trigger re-verification via separate endpoints; not handled here directly
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    return NextResponse.json({ user });
});


