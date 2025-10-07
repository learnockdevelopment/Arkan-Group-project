import { NextRequest, NextResponse } from "next/server";

type RoleName = "admin" | "user" | "owner";

export function requireRole(req: NextRequest, allowed: RoleName[]): NextResponse | null {
    const roleFromApiKey = (req as any).apiRoleName as RoleName | undefined;
    const userRole = (req as any).userRole as RoleName | undefined;
    const effective = roleFromApiKey || userRole;
    if (!effective || !allowed.includes(effective)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return null;
}


