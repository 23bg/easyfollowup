import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/auth";
import { toAppError } from "@/lib/utils/error";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("session_token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Missing session" } },
                { status: 401 }
            );
        }

        const session = verifySessionToken(token);
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
                { status: 401 }
            );
        }

        const [totalLeads, newLeads, contactedLeads, customers] = await Promise.all([
            prisma.lead.count({ where: { instituteId: session.instituteId } }),
            prisma.lead.count({ where: { instituteId: session.instituteId, status: "NEW" } }),
            prisma.lead.count({ where: { instituteId: session.instituteId, status: "CONTACTED" } }),
            prisma.lead.count({ where: { instituteId: session.instituteId, status: "CUSTOMER" } }),
        ]);

        const data = {
            totalLeads,
            newLeads,
            contactedLeads,
            customers,
        };
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
