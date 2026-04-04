import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSessionFromCookie, readSessionOrgId } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";

const createSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["OWNER", "MEMBER", "EDITOR", "VIEWER"]).default("MEMBER"),
});

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        const orgId = await readSessionOrgId();
        if (!session || !orgId) {
            return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [{ orgId }, { instituteId: session.instituteId }],
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: users });
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

        if (session.role !== "OWNER") {
            return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Only owner can add members" } }, { status: 403 });
        }

        const parsed = createSchema.parse(await req.json());
        const data = await prisma.user.create({
            data: {
                name: parsed.name,
                email: parsed.email,
                role: parsed.role,
                orgId,
                instituteId: session.instituteId,
                emailVerified: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json({ success: false, error: { code: appError.code, message: appError.message } }, { status: appError.statusCode });
    }
}
