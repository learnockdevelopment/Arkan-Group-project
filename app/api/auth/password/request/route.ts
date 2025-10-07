import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { createOtp } from "@/app/api/_utils/otp";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { identifier } = body || {};
    if (!identifier) return NextResponse.json({ message: "Missing identifier" }, { status: 400 });
    const query = identifier.includes("@") ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    const channel = identifier.includes("@") ? "email" : "phone";
    const purpose = "password_reset";
    const { code } = await createOtp(identifier, channel as any, purpose);
    return NextResponse.json({ sent: true, devCode: code });
});


