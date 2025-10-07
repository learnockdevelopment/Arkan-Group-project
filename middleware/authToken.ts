import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/auth";

export function withAuthToken(req: NextRequest): NextResponse | null {
    const token = extractBearerToken(req.headers.get("authorization") || undefined);
    if (!token) return null; // allow anonymous by default
    const payload = verifyToken(token);
    if (!payload) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    (req as any).userId = payload.userId;
    (req as any).userRole = payload.roleName;
    return null;
}


