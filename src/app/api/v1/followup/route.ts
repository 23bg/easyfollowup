import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie, readSessionOrgId } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const querySchema = z.object({
    leadId: z.string().optional(),
    upcoming: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
    leadId: z.string().min(1),
    note: z.string().min(1),
    nextDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        const orgId = await readSessionOrgId();
        if (!session || !orgId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const parsed = querySchema.parse({
            leadId: req.nextUrl.searchParams.get("leadId") ?? undefined,
            upcoming: req.nextUrl.searchParams.get("upcoming") ?? undefined,
            page: req.nextUrl.searchParams.get("page") ?? undefined,
            pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
        });

        const where = {
            ...(parsed.leadId ? { leadId: parsed.leadId } : {}),
            ...(parsed.upcoming ? { completed: false, nextDate: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } } : {}),
            lead: {
                deletedAt: null,
                OR: [{ orgId }, { instituteId: session.instituteId }],
            },
        };

        const skip = (parsed.page - 1) * parsed.pageSize;
        const [items, total] = await Promise.all([
            prisma.followUp.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            primaryPhone: true,
                        },
                    },
                },
                orderBy: [{ nextDate: "asc" }, { createdAt: "desc" }],
                skip,
                take: parsed.pageSize,
            }),
            prisma.followUp.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                items,
                total,
                page: parsed.page,
                pageSize: parsed.pageSize,
                totalPages: Math.ceil(total / parsed.pageSize),
            },
        });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        const orgId = await readSessionOrgId();
        if (!session || !orgId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const parsed = createSchema.parse(await req.json());
        const lead = await prisma.lead.findFirst({
            where: {
                id: parsed.leadId,
                deletedAt: null,
                OR: [{ orgId }, { instituteId: session.instituteId }],
            },
            select: { id: true },
        });

        if (!lead) {
            return NextResponse.json({ success: false, error: { code: "LEAD_NOT_FOUND", message: "Lead not found" } }, { status: 404 });
        }

        const data = await prisma.followUp.create({
            data: {
                leadId: parsed.leadId,
                note: parsed.note,
                nextDate: parsed.nextDate ? new Date(parsed.nextDate) : null,
                createdById: session.userId,
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
