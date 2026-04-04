import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie, readSessionOrgId } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { z } from "zod";

const createSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).max(80).optional(),
});

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        const orgId = await readSessionOrgId();

        if (!session || !orgId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
        });

        if (organization) {
            return NextResponse.json({ success: true, data: organization });
        }

        const institute = await prisma.institute.findUnique({
            where: { id: session.instituteId },
            select: {
                id: true,
                name: true,
                slug: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!institute) {
            return NextResponse.json({ success: false, error: { code: "ORG_NOT_FOUND", message: "Organization not found" } }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: institute.id,
                name: institute.name ?? "Organization",
                slug: institute.slug,
                createdAt: institute.createdAt,
                updatedAt: institute.updatedAt,
                source: "institute-fallback",
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
        if (!session) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const parsed = createSchema.parse(await req.json());
        const org = await prisma.organization.create({
            data: {
                name: parsed.name,
                slug: parsed.slug,
                users: {
                    connect: { id: session.userId },
                },
            },
        });

        await prisma.user.update({
            where: { id: session.userId },
            data: { orgId: org.id, role: "OWNER" },
        });

        return NextResponse.json({ success: true, data: org }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
