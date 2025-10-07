import { NextResponse } from "next/server";
import { connectToDatabase, isDbConnected } from "@/lib/db";

export async function GET() {
    try {
        await connectToDatabase();
        const ok = await isDbConnected();
        return NextResponse.json({ status: "ok", db: ok ? "connected" : "disconnected" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}


