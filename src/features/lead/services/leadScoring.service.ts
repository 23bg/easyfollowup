type ScoreInput = {
    phone?: string | null;
    website?: string | null;
    email?: string | null;
    address?: string | null;
    verified?: boolean;
};

export const leadScoringService = {
    calculate(input: ScoreInput): number {
        let score = 0;
        if (input.phone) score += 40;
        if (input.website) score += 20;
        if (input.email) score += 10;
        if (input.address) score += 10;
        if (input.verified) score += 20;
        return Math.max(0, Math.min(100, score));
    },
};
