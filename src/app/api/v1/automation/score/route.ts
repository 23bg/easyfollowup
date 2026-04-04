import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { automationLeadSchema } from "@/validations/tenant.validation";
import { automationService } from "@/features/automation/services/automation.service";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId || session.role !== "OWNER") {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Owner access required" } },
                { status: 403 }
            );
        }

        const input = automationLeadSchema.parse(await req.json());
        const data = await automationService.recalculateScore(input.leadId);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
