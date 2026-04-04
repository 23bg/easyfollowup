import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireEnv } from "@/lib/config/env";
import { userRepository } from "@/features/auth/repositories/user.repo";

const hashOtp = (otp: string) =>
    crypto.createHash("sha256").update(`${otp}:${requireEnv("JWT_SECRET")}`).digest("hex");

export const otpRepository = {
    saveOtp: async (email: string, otp: string, expiresAt: Date, resendCount: number) => {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await userRepository.findByEmail(normalizedEmail);

        if (!existingUser) {
            await userRepository.create({
                email: normalizedEmail,
                otpHash: hashOtp(otp),
                otpExpiresAt: expiresAt,
                otpResendCount: resendCount,
                otpPending: true,
                emailVerified: false,
            });
            return;
        }

        await userRepository.updateByEmail(normalizedEmail, {
            otpHash: hashOtp(otp),
            otpExpiresAt: expiresAt,
            otpResendCount: resendCount,
            otpPending: true,
        });
    },

    getLatestByEmail: async (email: string) =>
        prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: {
                otpExpiresAt: true,
                otpResendCount: true,
            },
        }),

    verifyOtp: async (email: string, otp: string) => {
        const record = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: {
                otpHash: true,
                otpExpiresAt: true,
                otpPending: true,
            },
        });

        if (!record) return false;
        if (!record.otpPending || !record.otpHash || !record.otpExpiresAt) return false;
        if (record.otpExpiresAt.getTime() < Date.now()) return false;

        return record.otpHash === hashOtp(otp);
    },

    deleteAllByEmail: async (email: string) =>
        userRepository.updateByEmail(email, {
            otpHash: null,
            otpExpiresAt: null,
            otpPending: false,
            otpResendCount: 0,
            emailVerified: true,
        }),
};
