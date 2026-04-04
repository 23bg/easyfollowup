import { createSessionToken, setSessionCookie, SubscriptionStatus } from "@/lib/auth/auth";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit } from "@/lib/utils/rateLimit";
import { otpRepository } from "@/features/auth/repositories/otp.repo";
import { userRepository } from "@/features/auth/repositories/user.repo";
import { organizationRepository } from "@/features/organization/repositories/organization.repo";
import { subscriptionService } from "@/features/subscription/services/subscription.service";
import { mailerService } from "@/lib/services/mailer.service";
import crypto from "crypto";

export type RequestOtpInput = {
    email: string;
    ip: string;
};

export type VerifyOtpInput = {
    email: string;
    otp: string;
};

export type AuthResult = {
    userId: string;
    instituteId: string;
    role: "OWNER" | "MEMBER" | "EDITOR" | "VIEWER" | "MANAGER";
    subscriptionStatus: SubscriptionStatus;
    redirectTo: "/dashboard" | "/pricing" | "/onboarding";
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateOtpCode = (): string => crypto.randomInt(0, 100_000).toString().padStart(5, "0");

const slugFromEmail = (email: string): string => {
    const local = email.split("@")[0] || "leadhub-org";
    return local
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 40);
};

const tempSlugFromEmail = (email: string): string => `temp-${slugFromEmail(email)}-${Date.now().toString(36)}`;

export const authService = {
    async requestOtp(input: RequestOtpInput): Promise<{ expiresAt: number }> {
        const email = normalizeEmail(input.email);
        if (!email.includes("@")) {
            throw new AppError("Invalid email", 400, "INVALID_EMAIL");
        }

        const rate = enforceRateLimit(`otp:${input.ip}:${email}`, env.OTP_RATE_LIMIT_PER_MIN, 60_000);
        if (!rate.ok) {
            throw new AppError(`Too many OTP requests. Retry in ${rate.retryAfter}s`, 429, "RATE_LIMITED");
        }

        const latest = await otpRepository.getLatestByEmail(email);
        const hasActiveOtp = Boolean(latest?.otpExpiresAt && latest.otpExpiresAt.getTime() > Date.now());

        if (hasActiveOtp && (latest?.otpResendCount ?? 0) >= env.OTP_MAX_RESEND) {
            throw new AppError("Maximum OTP resend attempts reached", 429, "OTP_RESEND_LIMIT");
        }

        const nextResendCount = hasActiveOtp ? (latest?.otpResendCount ?? 0) + 1 : 1;

        const otp = generateOtpCode();
        const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);
        await otpRepository.saveOtp(email, otp, expiresAt, nextResendCount);

        logger.info({ email, expiresAt }, "OTP issued");
        if (process.env.NODE_ENV !== "production") {
            logger.debug({ email, otp }, "OTP debug log for non-production environments");
        }

        await mailerService.sendOtpEmail({ email, otp });

        return { expiresAt: expiresAt.getTime() };
    },

    async verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
        const email = normalizeEmail(input.email);
        const valid = await otpRepository.verifyOtp(email, input.otp);

        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        await otpRepository.deleteAllByEmail(email);

        let user = await userRepository.findByEmail(email);

        if (!user) {
            throw new AppError("User not found after OTP verification", 404, "USER_NOT_FOUND");
        }

        if (!user.instituteId) {
            const organization = await organizationRepository.create({
                name: null,
                slug: tempSlugFromEmail(email),
                isOnboarded: false,
            });
            user = await userRepository.updateByEmail(email, {
                instituteId: organization.id,
                role: "OWNER",
                emailVerified: true,
            });

            if (!user) {
                throw new AppError("User not found after organization assignment", 500, "USER_NOT_FOUND");
            }
        }

        if (!user.instituteId) {
            throw new AppError("User organization not found", 500, "ORGANIZATION_NOT_FOUND");
        }

        const subscription = await subscriptionService.getSubscription(user.instituteId);
        const organization = await organizationRepository.findById(user.instituteId);
        const isOnboarded = Boolean(organization?.isOnboarded);
        const role = user.role;
        const subscriptionStatus = subscription.status as SubscriptionStatus;

        const token = createSessionToken({
            userId: user.id,
            email,
            role,
            instituteId: user.instituteId,
            isOnboarded,
            subscriptionStatus,
        });

        await setSessionCookie(token);

        return {
            userId: user.id,
            instituteId: user.instituteId,
            role,
            subscriptionStatus,
            redirectTo: !isOnboarded
                ? "/onboarding"
                : subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIAL"
                    ? "/dashboard"
                    : "/pricing",
        };
    },
};
