import { prisma } from "@/lib/db/prisma";
import { LeadSource, LeadStatus } from "@prisma/client";

type CreateLeadInput = {
    instituteId: string;
    name: string;
    phone: string;
    email?: string;
    source?: LeadSource;
    course?: string;
    message?: string;
    followUpAt?: Date;
    status?: LeadStatus;
    score?: number;
};

type UpdateLeadStatusInput = {
    instituteId: string;
    leadId: string;
    status: LeadStatus;
};

type ListLeadInput = {
    instituteId: string;
    status?: LeadStatus;
    query?: string;
    from?: Date;
    to?: Date;
};

export const leadRepository = {
    create: async (payload: CreateLeadInput) =>
        prisma.lead.create({
            data: {
                instituteId: payload.instituteId,
                name: payload.name,
                phone: payload.phone,
                email: payload.email,
                source: payload.source,
                course: payload.course,
                message: payload.message,
                followUpAt: payload.followUpAt,
                status: payload.status ?? "NEW",
                rating: payload.score,
            },
        }),

    findByPhoneInInstitute: async (instituteId: string, phone: string) =>
        prisma.lead.findFirst({
            where: { instituteId, phone },
        }),

    findByEmailInInstitute: async (instituteId: string, email: string) =>
        prisma.lead.findFirst({
            where: { instituteId, email: email.trim().toLowerCase() },
        }),

    findByNameAndCityInInstitute: async (instituteId: string, name: string, city: string) =>
        prisma.lead.findFirst({
            where: {
                instituteId,
                name: { equals: name.trim(), mode: "insensitive" },
                city: { equals: city.trim(), mode: "insensitive" },
            },
        }),

    updateStatus: async (input: UpdateLeadStatusInput) =>
        prisma.lead.updateMany({
            where: { id: input.leadId, instituteId: input.instituteId },
            data: { status: input.status },
        }),

    findByIdInInstitute: async (instituteId: string, leadId: string) =>
        prisma.lead.findFirst({
            where: { id: leadId, instituteId },
        }),

    updateByIdInInstitute: async (
        instituteId: string,
        leadId: string,
        payload: { message?: string | null; followUpAt?: Date | null; status?: LeadStatus }
    ) =>
        prisma.lead.updateMany({
            where: { id: leadId, instituteId },
            data: {
                ...(payload.message !== undefined ? { message: payload.message } : {}),
                ...(payload.followUpAt !== undefined ? { followUpAt: payload.followUpAt } : {}),
                ...(payload.status !== undefined ? { status: payload.status } : {}),
            },
        }),

    list: async (input: ListLeadInput) =>
        prisma.lead.findMany({
            where: {
                instituteId: input.instituteId,
                ...(input.status ? { status: input.status } : {}),
                ...(input.query
                    ? {
                        OR: [
                            { name: { contains: input.query, mode: "insensitive" } },
                            { phone: { contains: input.query, mode: "insensitive" } },
                            { email: { contains: input.query, mode: "insensitive" } },
                        ],
                    }
                    : {}),
                ...(input.from || input.to
                    ? {
                        createdAt: {
                            ...(input.from ? { gte: input.from } : {}),
                            ...(input.to ? { lte: input.to } : {}),
                        },
                    }
                    : {}),
            },
            orderBy: { createdAt: "desc" },
        }),
};
