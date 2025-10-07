import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function ensureNotBanned(req: NextRequest): Promise<NextResponse | null> {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return null; // allow anonymous routes; other middlewares enforce auth when needed
    await connectToDatabase();
    const user = await User.findById(userId).select("status");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (user.status === "banned") {
        return NextResponse.json({ message: "User is banned" }, { status: 403 });
    }
    return null;
}


