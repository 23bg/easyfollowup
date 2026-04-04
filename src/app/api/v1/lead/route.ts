import { NextRequest, NextResponse } from "next/server";
import { LeadStatus, LeadSource } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie, readSessionOrgId } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
});

const createSchema = z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        const orgId = await readSessionOrgId();
        if (!session || !orgId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const parsed = querySchema.parse({
            page: req.nextUrl.searchParams.get("page") ?? undefined,
            pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
            search: req.nextUrl.searchParams.get("search") ?? undefined,
            status: req.nextUrl.searchParams.get("status") ?? undefined,
        });

        const where = {
            deletedAt: null,
            OR: [{ orgId }, { instituteId: session.instituteId }],
            ...(parsed.status ? { status: parsed.status } : {}),
            ...(parsed.search
                ? {
                    OR: [
                        { name: { contains: parsed.search, mode: "insensitive" as const } },
                        { email: { contains: parsed.search, mode: "insensitive" as const } },
                        { primaryPhone: { contains: parsed.search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };

        const skip = (parsed.page - 1) * parsed.pageSize;
        const [items, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: {
                    followUps: {
                        orderBy: { createdAt: "desc" },
                        take: 3,
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: parsed.pageSize,
            }),
            prisma.lead.count({ where }),
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
        const data = await prisma.lead.create({
            data: {
                orgId,
                instituteId: session.instituteId,
                name: parsed.name,
                primaryPhone: parsed.phone,
                phone: parsed.phone,
                email: parsed.email,
                status: parsed.status ?? "NEW",
                source: parsed.source ?? "MANUAL",
                notes: parsed.notes,
                createdBy: session.userId,
            },
        });

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
