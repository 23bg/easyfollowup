import { LeadClaimMode, LeadVisibilityStatus, PlanType, TenantStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const monthKey = (value: Date = new Date()): string => {
    const year = value.getUTCFullYear();
    const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
};

const parseObjectIdTime = (id: string): number => {
    if (!id || id.length < 8) return 0;
    const seconds = Number.parseInt(id.slice(0, 8), 16);
    if (Number.isNaN(seconds)) return 0;
    return seconds * 1000;
};

const normalizeCursor = (cursor?: string): string | undefined => {
    if (!cursor) return undefined;
    const trimmed = cursor.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const tenantRepository = {
    async ensureByInstitute(instituteId: string) {
        const institute = await prisma.institute.findUnique({
            where: { id: instituteId },
            select: { id: true, name: true },
        });

        if (!institute) return null;

        return prisma.tenant.upsert({
            where: { instituteId },
            update: {
                name: institute.name ?? "Unnamed Tenant",
            },
            create: {
                instituteId,
                name: institute.name ?? "Unnamed Tenant",
                plan: PlanType.SOLO,
                status: TenantStatus.ACTIVE,
                claimMode: LeadClaimMode.FIRST_CLAIM_EXCLUSIVE,
                targetCities: [],
                targetCategories: [],
                minimumScore: 0,
            },
        });
    },

    getByInstitute(instituteId: string) {
        return prisma.tenant.findUnique({
            where: { instituteId },
        });
    },

    async updateSettings(
        instituteId: string,
        input: {
            targetCities?: string[];
            targetCategories?: string[];
            minimumScore?: number;
            claimMode?: LeadClaimMode;
        }
    ) {
        const tenant = await this.ensureByInstitute(instituteId);
        if (!tenant) return null;

        return prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                ...(input.targetCities !== undefined ? { targetCities: input.targetCities } : {}),
                ...(input.targetCategories !== undefined ? { targetCategories: input.targetCategories } : {}),
                ...(input.minimumScore !== undefined ? { minimumScore: input.minimumScore } : {}),
                ...(input.claimMode !== undefined ? { claimMode: input.claimMode } : {}),
            },
        });
    },

    async listAccessibleLeads(
        instituteId: string,
        input: {
            cursor?: string;
            limit: number;
            visibilityStatus?: LeadVisibilityStatus;
            minFitScore?: number;
        }
    ) {
        const tenant = await this.ensureByInstitute(instituteId);
        if (!tenant) return { items: [], nextCursor: null as string | null };

        const cursor = normalizeCursor(input.cursor);
        const items = await prisma.tenantLeadAccess.findMany({
            where: {
                tenantId: tenant.id,
                ...(input.visibilityStatus ? { visibilityStatus: input.visibilityStatus } : {}),
                ...(input.minFitScore !== undefined ? { fitScore: { gte: input.minFitScore } } : {}),
            },
            orderBy: { id: "desc" },
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            take: input.limit + 1,
            include: {
                lead: true,
            },
        });

        const hasMore = items.length > input.limit;
        const sliced = hasMore ? items.slice(0, input.limit) : items;
        const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

        return {
            items: sliced,
            nextCursor,
        };
    },

    async countClaimedLeads(tenantId: string) {
        return prisma.tenantLeadAccess.count({
            where: {
                tenantId,
                visibilityStatus: LeadVisibilityStatus.CLAIMED,
            },
        });
    },

    async claimLead(
        instituteId: string,
        leadId: string,
        lockMode?: LeadClaimMode
    ) {
        const tenant = await this.ensureByInstitute(instituteId);
        if (!tenant) return null;

        return prisma.$transaction(async (tx) => {
            const access = await tx.tenantLeadAccess.findUnique({
                where: {
                    tenantId_leadId: {
                        tenantId: tenant.id,
                        leadId,
                    },
                },
            });

            if (!access) {
                return { type: "MISSING_ACCESS" as const, tenant };
            }

            if (access.visibilityStatus === LeadVisibilityStatus.LOCKED) {
                return { type: "LOCKED" as const, tenant };
            }

            if (access.visibilityStatus === LeadVisibilityStatus.CLAIMED) {
                return { type: "ALREADY_CLAIMED" as const, tenant, access };
            }

            const claimed = await tx.tenantLeadAccess.update({
                where: { id: access.id },
                data: {
                    visibilityStatus: LeadVisibilityStatus.CLAIMED,
                    claimedAt: new Date(),
                },
                include: { lead: true },
            });

            const mode = lockMode ?? tenant.claimMode;
            if (mode !== LeadClaimMode.MULTI_TENANT_SHARED) {
                await tx.tenantLeadAccess.updateMany({
                    where: {
                        leadId,
                        tenantId: { not: tenant.id },
                        visibilityStatus: LeadVisibilityStatus.AVAILABLE,
                    },
                    data: {
                        visibilityStatus: LeadVisibilityStatus.LOCKED,
                    },
                });
            }

            await tx.leadClaim.create({
                data: {
                    tenantId: tenant.id,
                    leadId,
                    tenantLeadAccessId: claimed.id,
                    claimMode: mode,
                },
            });

            const usageMonth = monthKey();
            await tx.tenantUsage.upsert({
                where: { tenantId_month: { tenantId: tenant.id, month: usageMonth } },
                update: {
                    leadsClaimed: { increment: 1 },
                },
                create: {
                    tenantId: tenant.id,
                    month: usageMonth,
                    leadsClaimed: 1,
                },
            });

            await tx.auditLog.create({
                data: {
                    tenantId: tenant.id,
                    actorType: "USER",
                    action: "LEAD_CLAIMED",
                    resourceId: leadId,
                    metadata: {
                        claimMode: mode,
                    },
                },
            });

            return { type: "CLAIMED" as const, tenant, access: claimed, mode };
        });
    },

    inferCreatedAtFromObjectId(id: string): Date {
        const time = parseObjectIdTime(id);
        return new Date(time || Date.now());
    },
};
