import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { tenantLeadService } from "@/features/tenant/services/tenant-lead.service";
import { claimLeadSchema } from "@/validations/tenant.validation";

const CLAIM_ALLOWED_ROLES = new Set(["OWNER", "EDITOR", "MANAGER"]);

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!CLAIM_ALLOWED_ROLES.has(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = claimLeadSchema.parse(await req.json());
        const data = await tenantLeadService.claimLead(session.instituteId, body);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
