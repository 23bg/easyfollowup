import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";

const {
    mockSubscriptionRepo,
    mockUserRepo,
    mockAssertRazorpayReady,
    mockRazorpayCreate,
} = vi.hoisted(() => ({
    mockSubscriptionRepo: {
        createTrial: vi.fn(),
        findByInstituteId: vi.fn(),
        updateByInstituteId: vi.fn(),
        upsertByRazorpaySubId: vi.fn(),
        updateByRazorpaySubId: vi.fn(),
    },
    mockUserRepo: {
        countByInstitute: vi.fn(),
    },
    mockAssertRazorpayReady: vi.fn(),
    mockRazorpayCreate: vi.fn(),
}));

vi.mock("@/features/subscription/repositories/subscription.repo", () => ({
    subscriptionRepository: mockSubscriptionRepo,
}));

vi.mock("@/features/auth/repositories/user.repo", () => ({
    userRepository: mockUserRepo,
}));

vi.mock("@/lib/config/env", () => ({
    env: {
        RAZORPAY_PLAN_ID_SOLO: "plan_solo",
        RAZORPAY_PLAN_ID_TEAM: "plan_team",
    },
}));

vi.mock("@/lib/billing/razorpay", () => ({
    assertRazorpayReady: mockAssertRazorpayReady,
    razorpay: {
        subscriptions: {
            create: mockRazorpayCreate,
        },
    },
}));

import { subscriptionService } from "@/features/subscription/services/subscription.service";

describe("subscriptionService", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const future = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const activeSub = {
        id: "sub1",
        instituteId: "inst1",
        planType: "TEAM" as const,
        userLimit: 5,
        razorpaySubId: "rzp_sub_1",
        status: "ACTIVE" as const,
        trialEndsAt: future,
        currentPeriodEnd: new Date("2026-02-15T00:00:00.000Z"),
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("resolves plan type with fallback", () => {
        expect(subscriptionService.resolvePlanType("TEAM")).toBe("TEAM");
        expect(subscriptionService.resolvePlanType("BAD")).toBe("SOLO");
        expect(subscriptionService.resolvePlanType()).toBe("SOLO");
    });

    it("returns plan id based on plan type", () => {
        expect(subscriptionService.getRazorpayPlanId("SOLO")).toBe("plan_solo");
        expect(subscriptionService.getRazorpayPlanId("TEAM")).toBe("plan_team");
    });

    it("expires trial when trial date is in past", async () => {
        mockSubscriptionRepo.updateByInstituteId.mockResolvedValue({ ...activeSub, status: "INACTIVE" });
        const result = await subscriptionService.syncTrialStatus({
            ...activeSub,
            status: "TRIAL",
            trialEndsAt: new Date("2025-12-01T00:00:00.000Z"),
        });

        expect(mockSubscriptionRepo.updateByInstituteId).toHaveBeenCalledWith("inst1", { status: "INACTIVE" });
        expect(result.status).toBe("INACTIVE");
    });

    it("returns existing subscription when active", async () => {
        mockSubscriptionRepo.findByInstituteId.mockResolvedValue(activeSub);
        const result = await subscriptionService.getSubscription("inst1");
        expect(result).toEqual(activeSub);
        expect(mockSubscriptionRepo.createTrial).not.toHaveBeenCalled();
    });

    it("creates trial when missing", async () => {
        mockSubscriptionRepo.findByInstituteId.mockResolvedValue(null);
        mockSubscriptionRepo.createTrial.mockResolvedValue({
            ...activeSub,
            status: "TRIAL",
            razorpaySubId: null,
            planType: "SOLO",
            userLimit: 1,
            trialEndsAt: future,
        });
        const result = await subscriptionService.getSubscription("inst1");
        expect(mockSubscriptionRepo.createTrial).toHaveBeenCalledWith("inst1");
        expect(result.status).toBe("TRIAL");
    });

    it("builds billing summary", async () => {
        mockSubscriptionRepo.findByInstituteId.mockResolvedValue(activeSub);
        mockUserRepo.countByInstitute.mockResolvedValue(3);
        const summary = await subscriptionService.getBillingSummary("inst1");
        expect(summary.planType).toBe("TEAM");
        expect(summary.planAmount).toBe(999);
        expect(summary.usersUsed).toBe(3);
        expect(summary.userLimit).toBe(5);
    });

    it("reuses existing razorpay subscription for same plan", async () => {
        mockSubscriptionRepo.findByInstituteId.mockResolvedValue(activeSub);
        const result = await subscriptionService.createRazorpaySubscription("inst1", "TEAM");
        expect(result.reused).toBe(true);
        expect(mockRazorpayCreate).not.toHaveBeenCalled();
    });

    it("creates new razorpay subscription and updates DB", async () => {
        mockSubscriptionRepo.findByInstituteId.mockResolvedValue({
            ...activeSub,
            razorpaySubId: null,
            planType: "SOLO",
            userLimit: 1,
            status: "TRIAL",
            trialEndsAt: future,
        });
        mockRazorpayCreate.mockResolvedValue({ id: "rzp_new_1" });

        const result = await subscriptionService.createRazorpaySubscription("inst1", "TEAM");

        expect(mockAssertRazorpayReady).toHaveBeenCalled();
        expect(mockRazorpayCreate).toHaveBeenCalled();
        expect(mockSubscriptionRepo.updateByInstituteId).toHaveBeenCalled();
        expect(result.reused).toBe(false);
        expect(result.razorpaySubId).toBe("rzp_new_1");
    });

    it("maps webhook events", () => {
        expect(subscriptionService.mapWebhookEventToStatus("subscription.activated")).toBe("ACTIVE");
        expect(subscriptionService.mapWebhookEventToStatus("payment.failed")).toBe("INACTIVE");
        expect(subscriptionService.mapWebhookEventToStatus("unknown")).toBeNull();
    });

    it("handles webhook by institute and sub id", async () => {
        mockSubscriptionRepo.upsertByRazorpaySubId.mockResolvedValue({ ok: true });
        await subscriptionService.handleWebhookEvent({
            event: "subscription.activated",
            instituteId: "inst1",
            razorpaySubId: "rzp_sub_1",
            currentPeriodEnd: now,
        });
        expect(mockSubscriptionRepo.upsertByRazorpaySubId).toHaveBeenCalled();
    });

    it("throws when webhook target missing", async () => {
        await expect(
            subscriptionService.handleWebhookEvent({
                event: "subscription.activated",
            })
        ).rejects.toThrow(AppError);
    });
});
