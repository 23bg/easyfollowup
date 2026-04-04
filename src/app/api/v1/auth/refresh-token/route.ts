import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, verifySessionToken } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("session_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Missing session" } },
            { status: 401 }
        );
    }

    const session = verifySessionToken(token);
    if (!session) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
            { status: 401 }
        );
    }

    const nextToken = createSessionToken(session);
    await setSessionCookie(nextToken);

    return NextResponse.json({
        success: true,
        data: { refreshed: true },
    });
}
