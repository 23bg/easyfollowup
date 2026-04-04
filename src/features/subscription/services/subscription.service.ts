import { AppError } from "@/lib/utils/error";
import { subscriptionRepository } from "@/features/subscription/repositories/subscription.repo";
import { assertRazorpayReady, razorpay } from "@/lib/billing/razorpay";
import { env } from "@/lib/config/env";
import { DEFAULT_PLAN_TYPE, isPlanType, PLAN_CONFIG, PlanType } from "@/config/plans";
import { userRepository } from "@/features/auth/repositories/user.repo";

export type SubscriptionState = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
type SubscriptionRecord = NonNullable<Awaited<ReturnType<typeof subscriptionRepository.findByInstituteId>>>;

const DASHBOARD_ALLOWED: SubscriptionState[] = ["TRIAL", "ACTIVE"];

export const subscriptionService = {
    canAccessDashboard(status: SubscriptionState): boolean {
        return DASHBOARD_ALLOWED.includes(status);
    },

    resolvePlanType(input?: string | null): PlanType {
        if (input && isPlanType(input)) {
            return input;
        }
        return DEFAULT_PLAN_TYPE;
    },

    getRazorpayPlanId(planType: PlanType): string {
        const planId = planType === "TEAM" ? env.RAZORPAY_PLAN_ID_TEAM : env.RAZORPAY_PLAN_ID_SOLO;
        if (!planId) {
            throw new AppError(`Missing Razorpay plan id for ${planType}`, 500, "RAZORPAY_PLAN_ID_MISSING");
        }
        return planId;
    },

    async createSubscription(instituteId: string, planType: PlanType = DEFAULT_PLAN_TYPE) {
        return subscriptionRepository.createTrial(instituteId, planType);
    },

    async syncTrialStatus(subscription: SubscriptionRecord): Promise<SubscriptionRecord> {
        if (
            subscription.status === "TRIAL" &&
            subscription.trialEndsAt &&
            subscription.trialEndsAt.getTime() < Date.now()
        ) {
            return subscriptionRepository.updateByInstituteId(subscription.instituteId, {
                status: "INACTIVE",
            });
        }

        return subscription;
    },

    async getSubscription(instituteId: string) {
        const existing = await subscriptionRepository.findByInstituteId(instituteId);
        if (!existing) {
            const created = await subscriptionRepository.createTrial(instituteId);
            return this.syncTrialStatus(created);
        }

        return this.syncTrialStatus(existing);
    },

    async getBillingSummary(instituteId: string) {
        const subscription = await this.getSubscription(instituteId);
        const planType = this.resolvePlanType(subscription.planType);
        const plan = PLAN_CONFIG[planType];
        const usersUsed = await userRepository.countByInstitute(instituteId);
        const userLimit = subscription.userLimit ?? plan.userLimit;
        const hasAnySubscriptionActivity = Boolean(subscription.razorpaySubId || subscription.currentPeriodEnd || subscription.status === "ACTIVE");

        return {
            planType,
            planName: plan.name,
            planAmount: plan.priceMonthly,
            currency: "INR",
            userLimit,
            usersUsed,
            status: subscription.status,
            nextBillingDate: subscription.currentPeriodEnd ?? subscription.trialEndsAt,
            razorpaySubId: subscription.razorpaySubId,
            lastPaymentAmount: hasAnySubscriptionActivity ? plan.priceMonthly : null,
            lastPaymentDate: hasAnySubscriptionActivity ? subscription.updatedAt : null,
        };
    },

    async createRazorpaySubscription(instituteId: string, requestedPlanType?: string) {
        assertRazorpayReady();
        const planType = this.resolvePlanType(requestedPlanType);
        const plan = PLAN_CONFIG[planType];
        const planId = this.getRazorpayPlanId(planType);

        const subscription = await this.getSubscription(instituteId);
        if (subscription.razorpaySubId && subscription.planType === planType) {
            return {
                razorpaySubId: subscription.razorpaySubId,
                planType,
                reused: true,
            };
        }

        const created = await razorpay!.subscriptions.create({
            plan_id: planId,
            quantity: 1,
            total_count: 12,
            customer_notify: 1,
            notes: {
                instituteId,
                planType,
            },
        });

        await subscriptionRepository.updateByInstituteId(instituteId, {
            razorpaySubId: created.id,
            status: "TRIAL",
            planType,
            userLimit: plan.userLimit,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });

        return {
            razorpaySubId: created.id,
            planType,
            status: "TRIAL" as const,
            reused: false,
        };
    },

    async isActive(instituteId: string): Promise<boolean> {
        const subscription = await this.getSubscription(instituteId);
        return DASHBOARD_ALLOWED.includes(subscription.status as SubscriptionState);
    },

    mapWebhookEventToStatus(event: string): SubscriptionState | null {
        switch (event) {
            case "subscription.activated":
                return "ACTIVE";
            case "subscription.charged":
                return "ACTIVE";
            case "subscription.cancelled":
                return "CANCELLED";
            case "payment.failed":
                return "INACTIVE";
            default:
                return null;
        }
    },

    assertKnownEvent(event: string): void {
        const supported = ["subscription.activated", "subscription.charged", "subscription.cancelled", "payment.failed"];
        if (!supported.includes(event)) {
            throw new AppError(`Unsupported Razorpay event: ${event}`, 400, "UNSUPPORTED_WEBHOOK_EVENT");
        }
    },

    async handleWebhookEvent(input: {
        event: string;
        instituteId?: string;
        razorpaySubId?: string;
        currentPeriodEnd?: Date | null;
    }) {
        this.assertKnownEvent(input.event);
        const status = this.mapWebhookEventToStatus(input.event);

        if (!status) {
            throw new AppError("Unable to map webhook event status", 400, "INVALID_SUBSCRIPTION_EVENT");
        }

        if (input.razorpaySubId && input.instituteId) {
            return subscriptionRepository.upsertByRazorpaySubId(input.razorpaySubId, input.instituteId, {
                status,
                currentPeriodEnd: input.currentPeriodEnd,
            });
        }

        if (input.razorpaySubId) {
            return subscriptionRepository.updateByRazorpaySubId(input.razorpaySubId, {
                status,
                currentPeriodEnd: input.currentPeriodEnd,
            });
        }

        if (!input.instituteId) {
            throw new AppError("instituteId or razorpaySubId is required", 400, "SUBSCRIPTION_TARGET_MISSING");
        }

        return subscriptionRepository.updateByInstituteId(input.instituteId, {
            status,
            currentPeriodEnd: input.currentPeriodEnd,
        });
    },
};
