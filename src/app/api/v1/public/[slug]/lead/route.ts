import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { organizationRepository } from "@/features/organization/repositories/organization.repo";
import { leadService } from "@/features/lead/services/lead.service";
import { enforceRateLimit } from "@/lib/utils/rateLimit";
import { env } from "@/lib/config/env";
import { toAppError } from "@/lib/utils/error";

const leadSchema = z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional(),
    course: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
});

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    try {
        const { slug } = await context.params;
        const organization = await organizationRepository.findBySlug(slug);

        if (!organization) {
            return NextResponse.json(
                { success: false, error: { code: "ORGANIZATION_NOT_FOUND", message: "Organization not found" } },
                { status: 404 }
            );
        }

        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const rate = enforceRateLimit(`lead:${ip}:${slug}`, env.LEAD_RATE_LIMIT_PER_MIN, 60_000);
        if (!rate.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "RATE_LIMITED",
                        message: `Too many submissions. Retry in ${rate.retryAfter}s`,
                    },
                },
                { status: 429 }
            );
        }

        const contentType = req.headers.get("content-type") ?? "";
        let payload: Record<string, string | undefined> = {};

        if (contentType.includes("application/json")) {
            payload = (await req.json()) as Record<string, string | undefined>;
        } else {
            const formData = await req.formData();
            payload = {
                name: formData.get("name")?.toString(),
                phone: formData.get("phone")?.toString(),
                email: formData.get("email")?.toString(),
                course: formData.get("course")?.toString(),
                message: formData.get("message")?.toString(),
                source: formData.get("source")?.toString(),
            };
        }

        const input = leadSchema.parse(payload);

        const lead = await leadService.createLead({
            instituteId: organization.id,
            ...input,
        });

        if (contentType.includes("application/json")) {
            return NextResponse.json({ success: true, data: lead });
        }

        return NextResponse.redirect(new URL(`/${slug}/lead?success=1`, req.url));
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