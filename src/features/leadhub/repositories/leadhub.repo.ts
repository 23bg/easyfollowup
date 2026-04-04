import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const activeLeadWhere = (instituteId?: string): Prisma.LeadWhereInput => ({
    // In Mongo, optional fields can be missing instead of null.
    // Treat both cases as "not deleted" for backward compatibility.
    OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    ...(instituteId ? { instituteId } : {}),
});

export const leadhubRepository = {
    async listLeads(input: {
        instituteId?: string;
        page: number;
        pageSize: number;
        search?: string;
        category?: string;
        city?: string;
        status?: "NEW" | "CONTACTED" | "INTERESTED" | "TRIAL" | "CUSTOMER" | "REJECTED" | "ADMITTED";
        productId?: string;
    }) {
        const skip = (input.page - 1) * input.pageSize;
        const where: Prisma.LeadWhereInput = {
            ...activeLeadWhere(input.instituteId),
            ...(input.search
                ? {
                    OR: [
                        { name: { contains: input.search, mode: "insensitive" } },
                        { primaryPhone: { contains: input.search, mode: "insensitive" } },
                        { email: { contains: input.search, mode: "insensitive" } },
                    ],
                }
                : {}),
            ...(input.category ? { category: { equals: input.category, mode: "insensitive" } } : {}),
            ...(input.city ? { city: { equals: input.city, mode: "insensitive" } } : {}),
            ...(input.status ? { status: input.status } : {}),
            ...(input.productId ? { leadProducts: { some: { productId: input.productId } } } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: {
                    leadProducts: {
                        include: { product: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: input.pageSize,
            }),
            prisma.lead.count({ where }),
        ]);

        return {
            items,
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
        };
    },

    createLead: (data: Prisma.LeadUncheckedCreateInput) => prisma.lead.create({ data }),

    updateLead: (id: string, data: Prisma.LeadUncheckedUpdateInput) =>
        prisma.lead.update({ where: { id }, data }),

    softDeleteLead: (id: string) =>
        prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } }),

    findLeadById: (id: string, instituteId?: string) =>
        prisma.lead.findFirst({
            where: {
                id,
                ...activeLeadWhere(instituteId),
            },
            include: {
                leadProducts: { include: { product: true } },
                contactLogs: {
                    include: { product: true },
                    orderBy: { createdAt: "desc" },
                },
            },
        }),

    listProducts: () => prisma.product.findMany({ orderBy: { createdAt: "desc" } }),

    createProduct: (data: Prisma.ProductUncheckedCreateInput) => prisma.product.create({ data }),

    updateProduct: (id: string, data: Prisma.ProductUncheckedUpdateInput) =>
        prisma.product.update({ where: { id }, data }),

    deleteProduct: (id: string) => prisma.product.delete({ where: { id } }),

    createLeadProduct: (data: Prisma.LeadProductUncheckedCreateInput) =>
        prisma.leadProduct.create({ data, include: { product: true, lead: true } }),

    listLeadProducts: (leadId?: string) =>
        prisma.leadProduct.findMany({
            where: leadId ? { leadId } : {},
            include: { product: true, lead: true },
            orderBy: { createdAt: "desc" },
        }),

    updateLeadProduct: (id: string, data: Prisma.LeadProductUncheckedUpdateInput) =>
        prisma.leadProduct.update({ where: { id }, data, include: { product: true, lead: true } }),

    deleteLeadProduct: (id: string) => prisma.leadProduct.delete({ where: { id } }),

    createContactLog: (data: Prisma.ContactLogUncheckedCreateInput) =>
        prisma.contactLog.create({ data, include: { product: true, lead: true } }),

    listContactLogs: (leadId: string) =>
        prisma.contactLog.findMany({
            where: { leadId },
            include: { product: true, lead: true },
            orderBy: { createdAt: "desc" },
        }),
};
