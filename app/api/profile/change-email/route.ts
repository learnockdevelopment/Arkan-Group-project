import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { withAuth } from "@/app/api/_utils/withAuth";
import { requireRole } from "@/middleware/authorize";
import { createOtp, verifyOtp } from "@/app/api/_utils/otp";
import { User } from "@/models/User";

export const POST = withAuth(async (req: NextRequest) => {
    const auth = requireRole(req, ["admin", "user", "owner"]);
    if (auth) return auth;
    await connectToDatabase();
    const userId = (req as any).userId as string;
    const body = await req.json();
    const { action, newEmail, code } = body || {};
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (action === "send") {
        if (!newEmail) return NextResponse.json({ message: "Missing newEmail" }, { status: 400 });
        const { code: otp } = await createOtp(newEmail, "email", "email_change");
        return NextResponse.json({ sent: true, devCode: otp });
    }
    if (action === "verify") {
        if (!newEmail || !code) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        const ok = await verifyOtp(newEmail, "email", "email_change", code);
        if (!ok.ok) return NextResponse.json({ message: "Invalid code", reason: ok.reason }, { status: 400 });
        user.email = newEmail;
        user.emailVerifiedAt = new Date();
        await user.save();
        return NextResponse.json({ updated: true });
    }
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
});


