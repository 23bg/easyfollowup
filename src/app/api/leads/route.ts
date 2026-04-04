import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { leadhubService } from "@/features/leadhub/services/leadhub.service";

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const params = Object.fromEntries(req.nextUrl.searchParams.entries());
        const data = await leadhubService.listLeads(params, session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const body = await req.json();

        if (Array.isArray(body)) {
            const rows = body.filter((item) => item && typeof item === "object");
            if (!rows.length) {
                return NextResponse.json(
                    { success: false, error: { code: "INVALID_BULK_PAYLOAD", message: "Bulk payload must be a non-empty array of lead objects." } },
                    { status: 400 }
                );
            }

            const results = await Promise.allSettled(
                rows.map((item) => leadhubService.createLead(item, session.instituteId))
            );

            const imported = results.filter((result) => result.status === "fulfilled").length;
            const failed = results.length - imported;
            const errors = results
                .map((result, index) => ({ result, index }))
                .filter((entry): entry is { result: PromiseRejectedResult; index: number } => entry.result.status === "rejected")
                .slice(0, 20)
                .map(({ result, index }) => ({
                    row: index + 1,
                    message: toAppError(result.reason).message,
                }));

            return NextResponse.json(
                {
                    success: imported > 0,
                    data: {
                        imported,
                        failed,
                        total: results.length,
                        errors,
                    },
                },
                { status: imported > 0 ? 201 : 422 }
            );
        }

        const data = await leadhubService.createLead(body, session.instituteId);
        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
