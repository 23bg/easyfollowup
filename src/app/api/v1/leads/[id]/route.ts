import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { EasyFollowUpService } from "@/features/EasyFollowUp/services/EasyFollowUp.service";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const patchLeadSchema = z
    .object({
        status: z.enum(["NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED", "ADMITTED"]).optional(),
        message: z.string().nullable().optional(),
        followUpAt: z.string().nullable().optional(),
    })
    .refine((payload) => payload.status !== undefined || payload.message !== undefined || payload.followUpAt !== undefined, {
        message: "status, message, or followUpAt is required",
    });

export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const { id } = await context.params;
        const data = await EasyFollowUpService.getLeadById(id, session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        await EasyFollowUpService.getLeadById(id, session.instituteId);
        const data = await EasyFollowUpService.updateLead(id, body);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const { id } = await context.params;
        await EasyFollowUpService.getLeadById(id, session.instituteId);
        await EasyFollowUpService.deleteLead(id);
        return NextResponse.json({ success: true, data: { deleted: true } });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const { id } = await context.params;
        const parsed = patchLeadSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_PAYLOAD", message: "status, message, or followUpAt is required" } },
                { status: 400 }
            );
        }

        const body = parsed.data;
        const data = await EasyFollowUpService.updateLead(id, {
            status: body.status,
            notes: body.message ?? undefined,
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
