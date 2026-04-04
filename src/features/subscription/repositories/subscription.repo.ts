import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PLAN_TYPE, PLAN_CONFIG, PlanType } from "@/config/plans";

export const subscriptionRepository = {
    createTrial: async (instituteId: string, planType: PlanType = DEFAULT_PLAN_TYPE) =>
        prisma.subscription.upsert({
            where: { instituteId },
            create: {
                instituteId,
                planType,
                userLimit: PLAN_CONFIG[planType].userLimit,
                status: "TRIAL",
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
            update: {},
        }),

    findByInstituteId: async (instituteId: string) =>
        prisma.subscription.findUnique({
            where: { instituteId },
        }),

    findByRazorpaySubId: async (razorpaySubId: string) =>
        prisma.subscription.findFirst({
            where: { razorpaySubId },
        }),

    updateByInstituteId: async (
        instituteId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            razorpaySubId?: string | null;
            trialEndsAt?: Date | null;
            planType?: PlanType;
            userLimit?: number;
        }
    ) =>
        prisma.subscription.update({
            where: { instituteId },
            data: payload,
        }),

    upsertByRazorpaySubId: async (
        razorpaySubId: string,
        instituteId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            trialEndsAt?: Date | null;
            planType?: PlanType;
            userLimit?: number;
        }
    ) =>
        prisma.subscription.upsert({
            where: { instituteId },
            create: {
                instituteId,
                razorpaySubId,
                planType: payload.planType ?? DEFAULT_PLAN_TYPE,
                userLimit: payload.userLimit ?? PLAN_CONFIG[payload.planType ?? DEFAULT_PLAN_TYPE].userLimit,
                status: payload.status ?? "TRIAL",
                currentPeriodEnd: payload.currentPeriodEnd,
                trialEndsAt: payload.trialEndsAt,
            },
            update: {
                razorpaySubId,
                status: payload.status,
                currentPeriodEnd: payload.currentPeriodEnd,
                trialEndsAt: payload.trialEndsAt,
                planType: payload.planType,
                userLimit: payload.userLimit,
            },
        }),

    updateByRazorpaySubId: async (
        razorpaySubId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            trialEndsAt?: Date | null;
        }
    ) =>
        prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: payload,
        }),
};
