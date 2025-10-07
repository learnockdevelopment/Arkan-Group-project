import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { withAuth } from "@/app/api/_utils/withAuth";
import { requireRole } from "@/middleware/authorize";
import { ensureDefaultRoles, getRoleByName } from "@/lib/roles";
import { User } from "@/models/User";

export const POST = withAuth(async (req: NextRequest) => {
    const auth = requireRole(req, ["admin"]);
    if (auth) return auth;
    await connectToDatabase();

    await ensureDefaultRoles();
    const adminRole = await getRoleByName("admin");
    if (!adminRole) return NextResponse.json({ message: "Admin role missing" }, { status: 500 });

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const phone = process.env.ADMIN_PHONE || "+15550000000";
    const firstName = process.env.ADMIN_FIRST_NAME || "Super";
    const lastName = process.env.ADMIN_LAST_NAME || "Admin";
    const pin = process.env.ADMIN_PIN || "173942"; // must satisfy PIN policy

    let user = await User.findOne({ $or: [{ email }, { phone }] }).select("+pinHash");
    if (!user) {
        user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            roleId: adminRole._id,
            emailVerifiedAt: new Date(),
            phoneVerifiedAt: new Date(),
            status: "active",
        } as any);
    } else {
        user.roleId = adminRole._id as any;
        user.emailVerifiedAt = user.emailVerifiedAt || new Date();
        user.phoneVerifiedAt = user.phoneVerifiedAt || new Date();
        user.status = "active" as any;
    }

    if (!(user as any).pinHash) {
        await (user as any).setPin(pin);
    }
    await user.save();

    return NextResponse.json({
        seeded: true,
        admin: {
            id: String(user._id),
            email: user.email,
            phone: user.phone,
        },
        note: "Use identifier (email or phone) with the PIN to login at /api/auth/login",
    });
});


