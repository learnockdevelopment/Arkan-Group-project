import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { signToken } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { identifier, pin } = body || {};
    if (!identifier || !pin) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    const query = identifier.includes("@") ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query).select("+pinHash roleId status");
    if (!user || !(await (user as any).comparePin(pin))) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    if (user.status === "banned") {
        return NextResponse.json({ message: "User is banned" }, { status: 403 });
    }
    const token = signToken({ userId: String(user._id) });
    return NextResponse.json({ token });
});


