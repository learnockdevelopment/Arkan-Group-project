import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { withAuth } from "@/app/api/_utils/withAuth";
import { isValidEmail, isValidPhone } from "@/app/api/_utils/validators";

export const POST = withAuth(async (req: NextRequest) => {
    await connectToDatabase();
    const body = await req.json();
    const { firstName, lastName, email, phone } = body || {};
    if (!firstName || !lastName || !email || !phone) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    if (!isValidEmail(email)) return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    if (!isValidPhone(phone)) return NextResponse.json({ message: "Invalid phone" }, { status: 400 });
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return NextResponse.json({ message: "Email or phone already in use" }, { status: 409 });
    const user = await User.create({ firstName, lastName, email, phone });
    return NextResponse.json({ userId: String(user._id) }, { status: 201 });
});


