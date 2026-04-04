import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { leadhubService } from "@/features/leadhub/services/leadhub.service";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const body = await req.json();
        const data = await leadhubService.importFromMaps(body, session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
