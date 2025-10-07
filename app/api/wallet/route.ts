import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { withAuth } from "@/app/api/_utils/withAuth";
import { requireRole } from "@/middleware/authorize";
import { Wallet } from "@/models/Wallet";

export const GET = withAuth(async (req: NextRequest) => {
    const auth = requireRole(req, ["admin", "user", "owner"]);
    if (auth) return auth;
    await connectToDatabase();
    const userId = (req as any).userId as string;
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId });
    }
    return NextResponse.json({ wallet });
});


