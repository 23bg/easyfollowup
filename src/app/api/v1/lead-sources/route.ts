import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const sourceSchema = z.object({
    source: z.enum(["MANUAL", "IMPORT", "GOOGLE_MAPS", "WEBSITE", "DIRECTORY", "EXTENSION", "FORM"]),
    name: z.string().min(2).max(80).optional(),
});

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const leads = await prisma.lead.findMany({
            where: { instituteId: session.instituteId, deletedAt: null },
            select: { source: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        const stats = new Map<string, { source: string; totalLeads: number; lastCapturedAt: Date | null }>();
        for (const item of leads) {
            const current = stats.get(item.source) ?? { source: item.source, totalLeads: 0, lastCapturedAt: null };
            current.totalLeads += 1;
            if (!current.lastCapturedAt || item.createdAt > current.lastCapturedAt) {
                current.lastCapturedAt = item.createdAt;
            }
            stats.set(item.source, current);
        }

        const data = ["MANUAL", "IMPORT", "GOOGLE_MAPS", "WEBSITE", "DIRECTORY", "EXTENSION", "FORM"].map((source) => {
            const row = stats.get(source);
            return {
                source,
                totalLeads: row?.totalLeads ?? 0,
                lastCapturedAt: row?.lastCapturedAt ?? null,
                status: row?.totalLeads ? "ACTIVE" : "NOT_USED",
            };
        });

        return NextResponse.json({ success: true, data });
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

        const parsed = sourceSchema.parse(await req.json());
        const org = await prisma.institute.findUnique({ where: { id: session.instituteId }, select: { slug: true } });
        const slug = org?.slug ?? "organization";
        const endpoint = `/api/v1/public/${slug}/lead`;

        const embedCode = `<form method="post" action="${endpoint}">\n  <input name="name" placeholder="Name" required />\n  <input name="phone" placeholder="Phone" required />\n  <input name="email" placeholder="Email" />\n  <input type="hidden" name="source" value="${parsed.source}" />\n  <button type="submit">Submit</button>\n</form>`;

        const data = {
            id: `${parsed.source}-${Date.now()}`,
            name: parsed.name ?? parsed.source,
            source: parsed.source,
            endpoint,
            embedCode,
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
