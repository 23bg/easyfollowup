import { AppError } from "@/lib/utils/error";
import {
    createContactLogSchema,
    createLeadProductSchema,
    createLeadSchema,
    createProductSchema,
    listLeadsQuerySchema,
    updateLeadProductSchema,
    updateLeadSchema,
    updateProductSchema,
} from "@/validations/leadhub.validation";
import { leadhubRepository } from "@/features/leadhub/repositories/leadhub.repo";

export const leadhubService = {
    listLeads(input: unknown, instituteId?: string) {
        // Coerce and clamp pageSize to avoid validation errors from overly large values.
        const safeInput: unknown = (() => {
            if (input && typeof input === "object") {
                const obj = { ...(input as Record<string, any>) };
                const raw = obj.pageSize ?? obj.page_size;
                if (raw !== undefined) {
                    const n = Number(raw);
                    if (!Number.isNaN(n)) {
                        obj.pageSize = Math.max(1, Math.min(100, Math.trunc(n)));
                    }
                }
                return obj;
            }
            return input;
        })();

        const parsed = listLeadsQuerySchema.parse(safeInput);
        return leadhubRepository.listLeads({ ...parsed, instituteId });
    },

    async getLeadById(id: string, instituteId?: string) {
        const lead = await leadhubRepository.findLeadById(id, instituteId);
        if (!lead) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }
        return lead;
    },

    createLead(payload: unknown, instituteId?: string) {
        const parsed = createLeadSchema.parse(payload);
        return leadhubRepository.createLead({
            ...parsed,
            instituteId,
            phone: parsed.primaryPhone,
            tags: parsed.tags ?? [],
        });
    },

    updateLead(id: string, payload: unknown) {
        const parsed = updateLeadSchema.parse(payload);
        return leadhubRepository.updateLead(id, {
            ...parsed,
            ...(parsed.primaryPhone !== undefined ? { phone: parsed.primaryPhone } : {}),
        });
    },

    deleteLead(id: string) {
        return leadhubRepository.softDeleteLead(id);
    },

    listProducts() {
        return leadhubRepository.listProducts();
    },

    createProduct(payload: unknown) {
        const parsed = createProductSchema.parse(payload);
        return leadhubRepository.createProduct(parsed);
    },

    updateProduct(id: string, payload: unknown) {
        const parsed = updateProductSchema.parse(payload);
        return leadhubRepository.updateProduct(id, parsed);
    },

    deleteProduct(id: string) {
        return leadhubRepository.deleteProduct(id);
    },

    createLeadProduct(payload: unknown) {
        const parsed = createLeadProductSchema.parse(payload);
        return leadhubRepository.createLeadProduct(parsed);
    },

    listLeadProducts(leadId?: string) {
        return leadhubRepository.listLeadProducts(leadId);
    },

    updateLeadProduct(id: string, payload: unknown) {
        const parsed = updateLeadProductSchema.parse(payload);
        return leadhubRepository.updateLeadProduct(id, parsed);
    },

    deleteLeadProduct(id: string) {
        return leadhubRepository.deleteLeadProduct(id);
    },

    createContactLog(payload: unknown) {
        const parsed = createContactLogSchema.parse(payload);
        return leadhubRepository.createContactLog(parsed);
    },

    listContactLogs(leadId: string) {
        if (!leadId) {
            throw new AppError("leadId is required", 400, "LEAD_ID_REQUIRED");
        }
        return leadhubRepository.listContactLogs(leadId);
    },

    async importFromMaps(payload: unknown, instituteId?: string) {
        const schema = createLeadSchema.pick({ category: true, city: true }).extend({
            query: createLeadSchema.shape.name,
        });

        const parsed = schema.parse(payload);
        return {
            imported: 0,
            skipped: 0,
            message: `Maps import queued for ${parsed.query} in ${parsed.city ?? "any city"}${parsed.category ? ` (${parsed.category})` : ""}.`,
            instituteId: instituteId ?? null,
        };
    },
};
