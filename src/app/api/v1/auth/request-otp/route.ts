import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/features/auth/services/auth.service";
import { toAppError } from "@/lib/utils/error";

const schema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input = schema.parse(body);
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        const result = await authService.requestOtp({ email: input.email, ip });

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: appError.code,
                    message: appError.message,
                },
            },
            { status: appError.statusCode }
        );
    }
}

