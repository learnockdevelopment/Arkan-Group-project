import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { verifyOtp } from "@/app/api/_utils/otp";
import bcrypt from "bcryptjs";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { identifier, code, newPassword } = body || {};
    if (!identifier || !code || !newPassword) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    const query = identifier.includes("@") ? { email: identifier } : { phone: identifier };
    const channel = identifier.includes("@") ? "email" : "phone";
    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    const ok = await verifyOtp(identifier, channel as any, "password_reset", code);
    if (!ok.ok) return NextResponse.json({ message: "Invalid code", reason: ok.reason }, { status: 400 });
    const salt = await bcrypt.genSalt(12);
    (user as any).passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    return NextResponse.json({ reset: true });
});


