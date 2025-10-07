import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/middleware/apiKey";

type Handler = (req: NextRequest) => Promise<NextResponse>;

export function withMiddlewares(handler: Handler) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const apiKeyResult = await withApiKey(req);
        if (apiKeyResult) return apiKeyResult;
        return handler(req);
    };
}

export function jsonOk(data: any, init?: number) {
    return NextResponse.json(data, { status: init ?? 200 });
}

export function jsonError(message: string, status = 400) {
    return NextResponse.json({ message }, { status });
}


