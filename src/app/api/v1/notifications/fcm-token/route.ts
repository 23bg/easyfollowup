import { NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { adminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const bodySchema = z.object({
    token: z.string().min(20),
});

export async function POST(request: Request) {
    const session = await readSessionFromCookie();
    if (!session) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
            { status: 401 }
        );
    }

    if (!isFirebaseAdminConfigured || !adminFirestore) {
        return NextResponse.json({ success: true, data: { stored: false, reason: "firebase-admin-not-configured" } });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: { code: "BAD_REQUEST", message: "Invalid token payload" } },
            { status: 400 }
        );
    }

    const { token } = parsed.data;

    await adminFirestore
        .collection("notificationTokens")
        .doc(`${session.userId}:${token.slice(0, 16)}`)
        .set(
            {
                token,
                userId: session.userId,
                instituteId: session.instituteId,
                updatedAt: new Date().toISOString(),
                platform: "web",
            },
            { merge: true }
        );

    return NextResponse.json({ success: true, data: { stored: true } });
}
