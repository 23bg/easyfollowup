import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, POST } from "@/app/api/v1/billing/route";

const { mockReadSessionFromCookie, mockSubscriptionService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockSubscriptionService: {
        getBillingSummary: vi.fn(),
        createRazorpaySubscription: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

describe("/api/v1/billing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("GET returns billing summary", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockSubscriptionService.getBillingSummary.mockResolvedValue({
            planType: "SOLO",
            status: "TRIAL",
            usersUsed: 1,
            userLimit: 1,
            trialEndsAt: new Date().toISOString(),
        });

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSubscriptionService.getBillingSummary).toHaveBeenCalledWith("inst1");
    });

    it("POST rejects invalid action", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });

        const request = new Request("http://localhost/api/v1/billing", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "bad-action" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_ACTION");
    });

    it("POST rejects invalid plan", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });

        const request = new Request("http://localhost/api/v1/billing", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "create-subscription", planType: "BASIC" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_PLAN");
    });

    it("POST creates subscription for valid action", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockSubscriptionService.createRazorpaySubscription.mockResolvedValue({
            razorpaySubId: "sub_123",
            reused: false,
        });

        const request = new Request("http://localhost/api/v1/billing", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "create-subscription", planType: "TEAM" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSubscriptionService.createRazorpaySubscription).toHaveBeenCalledWith("inst1", "TEAM");
    });

    it("POST returns service failure status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockSubscriptionService.createRazorpaySubscription.mockRejectedValue(
            new AppError("Provider down", 503, "PROVIDER_DOWN")
        );

        const request = new Request("http://localhost/api/v1/billing", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "create-subscription", planType: "SOLO" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(503);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("PROVIDER_DOWN");
    });
});

