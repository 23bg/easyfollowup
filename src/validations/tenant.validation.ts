import { z } from "zod";

export const tenantLeadListQuerySchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    visibilityStatus: z.enum(["AVAILABLE", "CLAIMED", "LOCKED"]).optional(),
    minFitScore: z.coerce.number().int().min(0).max(100).optional(),
});

export const claimLeadSchema = z.object({
    leadId: z.string().min(1),
    lockMode: z.enum(["MULTI_TENANT_SHARED", "FIRST_CLAIM_EXCLUSIVE", "REGION_EXCLUSIVE"]).optional(),
});

export const tenantSettingsPatchSchema = z.object({
    targetCities: z.array(z.string().min(1)).max(100).optional(),
    targetCategories: z.array(z.string().min(1)).max(100).optional(),
    minimumScore: z.number().int().min(0).max(100).optional(),
    claimMode: z.enum(["MULTI_TENANT_SHARED", "FIRST_CLAIM_EXCLUSIVE", "REGION_EXCLUSIVE"]).optional(),
});

export const automationLeadSchema = z.object({
    leadId: z.string().min(1),
});
