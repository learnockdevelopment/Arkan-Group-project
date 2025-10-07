import { NextRequest, NextResponse } from "next/server";

export async function withApiKey(req: NextRequest): Promise<NextResponse | null> {
    const headerKey = req.headers.get("x-api-key");
    if (!headerKey) {
        return NextResponse.json({ message: "Missing API key" }, { status: 401 });
    }
    const envKey = process.env.API_KEY;
    if (!envKey || headerKey !== envKey) {
        return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }
    // API key grants admin-level access to admin endpoints
    (req as any).apiRoleName = "admin";
    return null;
}


