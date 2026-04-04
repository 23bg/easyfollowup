import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { tenantRepository } from "@/features/tenant/repositories/tenant.repo";
import { tenantSettingsPatchSchema } from "@/validations/tenant.validation";

const SETTINGS_ALLOWED_ROLES = new Set(["OWNER", "EDITOR"]);

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const tenant = await tenantRepository.ensureByInstitute(session.instituteId);
        if (!tenant) {
            return NextResponse.json(
                { success: false, error: { code: "TENANT_NOT_FOUND", message: "Tenant not found" } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: tenant });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!SETTINGS_ALLOWED_ROLES.has(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = tenantSettingsPatchSchema.parse(await req.json());
        const updated = await tenantRepository.updateSettings(session.instituteId, body);
        if (!updated) {
            return NextResponse.json(
                { success: false, error: { code: "TENANT_NOT_FOUND", message: "Tenant not found" } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
