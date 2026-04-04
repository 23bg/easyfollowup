import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/features/auth/services/auth.service";
import { toAppError } from "@/lib/utils/error";
import { verifyOtpValidation } from "@/validations/auth.validation";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input = verifyOtpValidation.parse(body);

        const result = await authService.verifyOtp(input);

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

