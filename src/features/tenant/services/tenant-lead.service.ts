import { LeadClaimMode, LeadVisibilityStatus, PlanType } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { PLAN_CONFIG } from "@/config/plans";
import { tenantRepository } from "@/features/tenant/repositories/tenant.repo";

const getPlanUserLimit = (plan: PlanType): number => PLAN_CONFIG[plan].userLimit;

export const tenantLeadService = {
    async listTenantLeads(
        instituteId: string,
        query: {
            cursor?: string;
            limit: number;
            visibilityStatus?: LeadVisibilityStatus;
            minFitScore?: number;
        }
    ) {
        const result = await tenantRepository.listAccessibleLeads(instituteId, query);
        return {
            items: result.items,
            nextCursor: result.nextCursor,
            limit: query.limit,
        };
    },

    async claimLead(instituteId: string, input: { leadId: string; lockMode?: LeadClaimMode }) {
        const tenant = await tenantRepository.ensureByInstitute(instituteId);
        if (!tenant) {
            throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");
        }

        if (tenant.status !== "ACTIVE") {
            throw new AppError("Tenant is not active", 403, "TENANT_INACTIVE");
        }

        const claimedCount = await tenantRepository.countClaimedLeads(tenant.id);
        const activeClaimLimit = getPlanUserLimit(tenant.plan) * 200;
        if (claimedCount >= activeClaimLimit) {
            throw new AppError("Claim limit exceeded for current plan", 409, "CLAIM_LIMIT_EXCEEDED");
        }

        const claimed = await tenantRepository.claimLead(instituteId, input.leadId, input.lockMode);
        if (!claimed) {
            throw new AppError("Tenant not found", 404, "TENANT_NOT_FOUND");
        }

        if (claimed.type === "MISSING_ACCESS") {
            throw new AppError("Lead is not available for this tenant", 404, "LEAD_NOT_ASSIGNED");
        }

        if (claimed.type === "LOCKED") {
            throw new AppError("Lead is locked for this tenant", 409, "LEAD_LOCKED");
        }

        if (claimed.type === "ALREADY_CLAIMED") {
            return {
                claimed: true,
                alreadyClaimed: true,
                mode: input.lockMode ?? claimed.tenant.claimMode,
                access: claimed.access,
            };
        }

        return {
            claimed: true,
            alreadyClaimed: false,
            mode: claimed.mode,
            access: claimed.access,
        };
    },
};
