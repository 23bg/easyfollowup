import { describe, expect, it } from "vitest";
import { DEFAULT_PLAN_TYPE, isPlanType, PLAN_CONFIG } from "@/config/plans";

describe("plans config", () => {
    it("has expected default plan", () => {
        expect(DEFAULT_PLAN_TYPE).toBe("SOLO");
    });

    it("has valid pricing and user limits", () => {
        expect(PLAN_CONFIG.SOLO.priceMonthly).toBe(499);
        expect(PLAN_CONFIG.SOLO.userLimit).toBe(1);
        expect(PLAN_CONFIG.TEAM.priceMonthly).toBe(999);
        expect(PLAN_CONFIG.TEAM.userLimit).toBe(5);
    });

    it("validates plan type inputs", () => {
        expect(isPlanType("SOLO")).toBe(true);
        expect(isPlanType("TEAM")).toBe(true);
        expect(isPlanType("ENTERPRISE")).toBe(false);
    });
});
