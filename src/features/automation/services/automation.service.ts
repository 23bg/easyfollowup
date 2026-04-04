import { LeadStatus } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { prisma } from "@/lib/db/prisma";
import { leadScoringService } from "@/features/lead/services/leadScoring.service";

type RuleCondition = {
    field: "category" | "city" | "status";
    equals: string;
};

type RuleAction =
    | { type: "ASSIGN_TAG"; value: string }
    | { type: "CHANGE_SCORE"; value: number }
    | { type: "SEND_NOTIFICATION"; value: string };

type AutomationRule = {
    trigger: "LEAD_CREATED" | "LEAD_UPDATED";
    condition: RuleCondition;
    action: RuleAction;
    active: boolean;
};

const matchesCondition = (
    lead: {
        category: string | null;
        city: string | null;
        status: LeadStatus;
    },
    condition: RuleCondition
) => {
    const value = lead[condition.field];
    if (!value) return false;
    return String(value).toLowerCase() === condition.equals.toLowerCase();
};

const scoreLead = (lead: {
    phone: string | null;
    website: string | null;
    email: string | null;
    address: string | null;
}): number => {
    return leadScoringService.calculate({
        phone: lead.phone,
        website: lead.website,
        email: lead.email,
        address: lead.address,
    });
};

export const automationService = {
    async recalculateScore(leadId: string) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                phone: true,
                website: true,
                email: true,
                address: true,
            },
        });

        if (!lead) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        const score = scoreLead(lead);
        const updated = await prisma.lead.update({
            where: { id: lead.id },
            data: { rating: score },
        });

        return updated;
    },

    async executeRules(leadId: string, rules: AutomationRule[]) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                category: true,
                city: true,
                status: true,
                tags: true,
                rating: true,
            },
        });

        if (!lead) {
            throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
        }

        const nextTags = [...lead.tags];
        let nextScore = lead.rating ?? 0;
        const notifications: string[] = [];

        rules.filter((rule) => rule.active).forEach((rule) => {
            if (!matchesCondition(lead, rule.condition)) return;

            if (rule.action.type === "ASSIGN_TAG" && !nextTags.includes(rule.action.value)) {
                nextTags.push(rule.action.value);
            }

            if (rule.action.type === "CHANGE_SCORE") {
                nextScore = Math.max(0, Math.min(100, rule.action.value));
            }

            if (rule.action.type === "SEND_NOTIFICATION") {
                notifications.push(rule.action.value);
            }
        });

        const updated = await prisma.lead.update({
            where: { id: lead.id },
            data: {
                tags: nextTags,
                rating: nextScore,
            },
        });

        return {
            updated,
            notifications,
            appliedRules: rules.length,
        };
    },

    async distributeLead(leadId: string) {
        const defaultRules: AutomationRule[] = [
            {
                trigger: "LEAD_CREATED",
                condition: { field: "category", equals: "coaching" },
                action: { type: "ASSIGN_TAG", value: "education" },
                active: true,
            },
        ];

        const data = await this.executeRules(leadId, defaultRules);
        return {
            distributed: data.appliedRules,
        }
    },
};
