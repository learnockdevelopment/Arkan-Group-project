import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/middleware/apiKey";
import { withAuthToken } from "@/middleware/authToken";
import { ensureNotBanned } from "@/middleware/notBanned";

type Handler = (req: NextRequest) => Promise<NextResponse>;

export function withAuth(handler: Handler) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const apiKeyResult = await withApiKey(req);
        if (apiKeyResult) return apiKeyResult;
        const tokenResult = withAuthToken(req);
        if (tokenResult) return tokenResult;
        const banResult = await ensureNotBanned(req);
        if (banResult) return banResult;
        return handler(req);
    };
}


