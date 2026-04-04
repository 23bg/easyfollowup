export type PlanType = "SOLO" | "TEAM";

type PlanConfig = {
    key: PlanType;
    name: string;
    priceMonthly: number;
    userLimit: number;
    tagline: string;
};

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
    SOLO: {
        key: "SOLO",
        name: "Solo",
        priceMonthly: 499,
        userLimit: 1,
        tagline: "For individual educators",
    },
    TEAM: {
        key: "TEAM",
        name: "Team",
        priceMonthly: 999,
        userLimit: 5,
        tagline: "For growing institutes",
    },
};

export const DEFAULT_PLAN_TYPE: PlanType = "SOLO";

export const isPlanType = (value: string): value is PlanType => value === "SOLO" || value === "TEAM";