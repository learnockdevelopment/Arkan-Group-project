import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { createOtp, verifyOtp } from "@/app/api/_utils/otp";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { userId, action, code } = body || {};
    if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (action === "send") {
        const { code: otp } = await createOtp(user.email, "email", "register_email");
        // TODO: integrate email provider. For now, return code for dev.
        return NextResponse.json({ sent: true, devCode: otp });
    }
    if (action === "verify") {
        if (!code) return NextResponse.json({ message: "Missing code" }, { status: 400 });
        const result = await verifyOtp(user.email, "email", "register_email", code);
        if (!result.ok) return NextResponse.json({ message: "Invalid code", reason: result.reason }, { status: 400 });
        user.emailVerifiedAt = new Date();
        await user.save();
        return NextResponse.json({ verified: true });
    }
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
});


