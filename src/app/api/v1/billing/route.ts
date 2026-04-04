import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { subscriptionService } from "@/features/subscription/services/subscription.service";
import { toAppError } from "@/lib/utils/error";
import { isPlanType } from "@/config/plans";

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await subscriptionService.getBillingSummary(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as { action?: string; planType?: string };
        if (body.action !== "create-subscription") {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_ACTION", message: "Unsupported action" } },
                { status: 400 }
            );
        }

        if (body.planType && !isPlanType(body.planType)) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_PLAN", message: "Unsupported plan type" } },
                { status: 400 }
            );
        }

        const data = await subscriptionService.createRazorpaySubscription(session.instituteId, body.planType);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
