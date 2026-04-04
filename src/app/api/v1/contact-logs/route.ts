import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const querySchema = z.object({
    leadId: z.string().optional(),
    type: z.enum(["CALL", "WHATSAPP", "EMAIL", "DEMO", "MEETING"]).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

const createSchema = z.object({
    leadId: z.string().min(1),
    productId: z.string().optional(),
    type: z.enum(["CALL", "WHATSAPP", "EMAIL", "DEMO", "MEETING"]),
    notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const parsed = querySchema.parse({
            leadId: req.nextUrl.searchParams.get("leadId") ?? undefined,
            type: req.nextUrl.searchParams.get("type") ?? undefined,
            search: req.nextUrl.searchParams.get("search") ?? undefined,
            page: req.nextUrl.searchParams.get("page") ?? undefined,
            pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
        });

        const where = {
            ...(parsed.leadId ? { leadId: parsed.leadId } : {}),
            ...(parsed.type ? { type: parsed.type } : {}),
            ...(parsed.search
                ? {
                    OR: [
                        { notes: { contains: parsed.search, mode: "insensitive" as const } },
                        { lead: { name: { contains: parsed.search, mode: "insensitive" as const } } },
                    ],
                }
                : {}),
            lead: {
                instituteId: session.instituteId,
                deletedAt: null,
            },
        };

        const skip = (parsed.page - 1) * parsed.pageSize;
        const [items, total] = await Promise.all([
            prisma.contactLog.findMany({
                where,
                include: {
                    lead: {
                        select: {
                            id: true,
                            name: true,
                            primaryPhone: true,
                            city: true,
                            status: true,
                            source: true,
                        },
                    },
                    product: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: parsed.pageSize,
            }),
            prisma.contactLog.count({ where }),
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

        const parsed = createSchema.parse(await req.json());
        const lead = await prisma.lead.findFirst({
            where: {
                id: parsed.leadId,
                instituteId: session.instituteId,
                deletedAt: null,
            },
            select: { id: true },
        });

        if (!lead) {
            return NextResponse.json(
                { success: false, error: { code: "LEAD_NOT_FOUND", message: "Lead not found" } },
                { status: 404 }
            );
        }

        const data = await prisma.contactLog.create({
            data: {
                leadId: parsed.leadId,
                productId: parsed.productId,
                type: parsed.type,
                notes: parsed.notes,
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
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
