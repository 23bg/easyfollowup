import { NextResponse } from "next/server";
import { createSessionToken, readSessionFromCookie, setSessionCookie } from "@/lib/auth/auth";
import { subscriptionService } from "@/features/subscription/services/subscription.service";

export async function GET() {
    const session = await readSessionFromCookie();

    if (!session) {
        return NextResponse.json(
            { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
            { status: 401 }
        );
    }

    const isOnboarded = Boolean(session.isOnboarded);
    const subscription = await subscriptionService.getSubscription(session.instituteId);
    const liveStatus = subscription.status;

    if (liveStatus !== session.subscriptionStatus) {
        const refreshedToken = createSessionToken({
            ...session,
            subscriptionStatus: liveStatus,
        });
        await setSessionCookie(refreshedToken);
    }

    return NextResponse.json({
        success: true,
        data: {
            user: {
                id: session.userId,
                email: session.email,
                role: session.role,
                emailVerified: true,
            },
            business: {
                exists: isOnboarded,
                status: isOnboarded ? ("ACTIVE" as const) : ("DRAFT" as const),
            },
            institute: {
                id: session.instituteId,
                subscriptionStatus: liveStatus,
            },
            gbp: {
                status: "NOT_CONNECTED" as const,
            },
        },
    });
}
