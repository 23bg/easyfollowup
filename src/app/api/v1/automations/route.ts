import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const updateSchema = z.object({
    key: z.enum(["autoReplyEnabled", "leadWhatsappEnabled"]),
    enabled: z.boolean(),
});

const toAutomationData = (settings: { autoReplyEnabled: boolean; leadWhatsappEnabled: boolean }) => [
    {
        key: "autoReplyEnabled",
        title: "Auto Reply",
        description: "Automatically send acknowledgment after new lead capture.",
        enabled: settings.autoReplyEnabled,
    },
    {
        key: "leadWhatsappEnabled",
        title: "WhatsApp Follow-up",
        description: "Enable WhatsApp follow-up nudges for newly captured leads.",
        enabled: settings.leadWhatsappEnabled,
    },
];

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const settings = await prisma.instituteSettings.upsert({
            where: { instituteId: session.instituteId },
            update: {},
            create: { instituteId: session.instituteId },
            select: { autoReplyEnabled: true, leadWhatsappEnabled: true },
        });

        return NextResponse.json({ success: true, data: toAutomationData(settings) });
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

        const parsed = updateSchema.parse(await req.json());

        const settings = await prisma.instituteSettings.upsert({
            where: { instituteId: session.instituteId },
            update: {
                [parsed.key]: parsed.enabled,
            },
            create: {
                instituteId: session.instituteId,
                [parsed.key]: parsed.enabled,
            },
            select: { autoReplyEnabled: true, leadWhatsappEnabled: true },
        });

        return NextResponse.json({ success: true, data: toAutomationData(settings) });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
