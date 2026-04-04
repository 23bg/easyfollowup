import { prisma } from "@/lib/db/prisma";

type UpdateOrganizationInput = {
    name?: string;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    city?: string | null;
    state?: string | null;
    address?: string | null;
    timings?: string | null;
    logo?: string | null;
    banner?: string | null;
    websiteUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    linkedinUrl?: string | null;
    isOnboarded?: boolean;
    slug?: string;
};

export const organizationRepository = {
    findById: async (id: string) => prisma.institute.findUnique({ where: { id } }),

    findBySlug: async (slug: string) =>
        prisma.institute.findUnique({
            where: { slug },
            include: {
                subscription: true,
            },
        }),

    isSlugTaken: async (slug: string, excludeOrganizationId?: string) => {
        const existing = await prisma.institute.findUnique({ where: { slug } });
        if (!existing) return false;
        if (!excludeOrganizationId) return true;
        return existing.id !== excludeOrganizationId;
    },

    create: async (input: { name?: string | null; slug?: string | null; isOnboarded?: boolean }) =>
        prisma.institute.create({
            data: {
                name: input.name ?? null,
                slug: input.slug ?? null,
                isOnboarded: input.isOnboarded ?? false,
            },
        }),

    updateById: async (id: string, input: UpdateOrganizationInput) =>
        prisma.institute.update({
            where: { id },
            data: input,
        }),
};
