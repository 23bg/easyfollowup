import { z } from "zod";

export const leadTypeSchema = z.enum(["PERSON", "BUSINESS", "INSTITUTE", "SOCIETY", "DEVELOPER"]);
export const leadSourceSchema = z.enum(["MANUAL", "IMPORT", "GOOGLE_MAPS", "WEBSITE", "DIRECTORY", "EXTENSION", "FORM"]);
export const leadStatusSchema = z.enum(["NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED", "ADMITTED"]);
export const contactTypeSchema = z.enum(["CALL", "WHATSAPP", "EMAIL", "DEMO", "MEETING"]);

export const listLeadsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    city: z.string().optional(),
    status: leadStatusSchema.optional(),
    productId: z.string().optional(),
});

export const createLeadSchema = z.object({
    name: z.string().min(2),
    primaryPhone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    email: z.string().email().optional(),
    type: leadTypeSchema.default("PERSON"),
    category: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional(),
    googleMapsLink: z.string().url().optional(),
    source: leadSourceSchema.default("MANUAL"),
    status: leadStatusSchema.default("NEW"),
    rating: z.number().min(0).max(5).optional(),
    employeeSize: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([]),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createProductSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/),
    market: z.string().min(2),
    description: z.string().optional(),
    active: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createLeadProductSchema = z.object({
    leadId: z.string().min(1),
    productId: z.string().min(1),
    status: leadStatusSchema.default("NEW"),
    priority: z.number().int().min(1).max(5).optional(),
    notes: z.string().optional(),
});

export const updateLeadProductSchema = createLeadProductSchema.partial().omit({ leadId: true, productId: true });

export const createContactLogSchema = z.object({
    leadId: z.string().min(1),
    productId: z.string().optional(),
    type: contactTypeSchema,
    notes: z.string().optional(),
});
