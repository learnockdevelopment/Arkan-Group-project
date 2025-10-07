import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { isValidPin } from "@/app/api/_utils/validators";
import { signToken } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { userId, pin } = body || {};
    if (!userId || !pin) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    if (!isValidPin(pin)) return NextResponse.json({ message: "Invalid PIN policy" }, { status: 400 });
    const user = await User.findById(userId).select("+pinHash roleId emailVerifiedAt phoneVerifiedAt status");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    await (user as any).setPin(pin);
    if (user.emailVerifiedAt && user.phoneVerifiedAt) {
        user.status = "active" as any;
    }
    await user.save();
    const token = signToken({ userId: String(user._id) });
    return NextResponse.json({ token });
});


