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
} from "@/validations/EasyFollowUp.validation";
import { EasyFollowUpRepository } from "@/features/EasyFollowUp/repositories/EasyFollowUp.repo";

export const EasyFollowUpService = {
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
        return EasyFollowUpRepository.listLeads({ ...parsed, instituteId });
    },

    async getLeadById(id: string, instituteId?: string) {
        const lead = await EasyFollowUpRepository.findLeadById(id, instituteId);
        if (!lead) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }
        return lead;
    },

    createLead(payload: unknown, instituteId?: string) {
        const parsed = createLeadSchema.parse(payload);
        return EasyFollowUpRepository.createLead({
            ...parsed,
            instituteId,
            phone: parsed.primaryPhone,
            tags: parsed.tags ?? [],
        });
    },

    updateLead(id: string, payload: unknown) {
        const parsed = updateLeadSchema.parse(payload);
        return EasyFollowUpRepository.updateLead(id, {
            ...parsed,
            ...(parsed.primaryPhone !== undefined ? { phone: parsed.primaryPhone } : {}),
        });
    },

    deleteLead(id: string) {
        return EasyFollowUpRepository.softDeleteLead(id);
    },

    listProducts() {
        return EasyFollowUpRepository.listProducts();
    },

    createProduct(payload: unknown) {
        const parsed = createProductSchema.parse(payload);
        return EasyFollowUpRepository.createProduct(parsed);
    },

    updateProduct(id: string, payload: unknown) {
        const parsed = updateProductSchema.parse(payload);
        return EasyFollowUpRepository.updateProduct(id, parsed);
    },

    deleteProduct(id: string) {
        return EasyFollowUpRepository.deleteProduct(id);
    },

    createLeadProduct(payload: unknown) {
        const parsed = createLeadProductSchema.parse(payload);
        return EasyFollowUpRepository.createLeadProduct(parsed);
    },

    listLeadProducts(leadId?: string) {
        return EasyFollowUpRepository.listLeadProducts(leadId);
    },

    updateLeadProduct(id: string, payload: unknown) {
        const parsed = updateLeadProductSchema.parse(payload);
        return EasyFollowUpRepository.updateLeadProduct(id, parsed);
    },

    deleteLeadProduct(id: string) {
        return EasyFollowUpRepository.deleteLeadProduct(id);
    },

    createContactLog(payload: unknown) {
        const parsed = createContactLogSchema.parse(payload);
        return EasyFollowUpRepository.createContactLog(parsed);
    },

    listContactLogs(leadId: string) {
        if (!leadId) {
            throw new AppError("leadId is required", 400, "LEAD_ID_REQUIRED");
        }
        return EasyFollowUpRepository.listContactLogs(leadId);
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
