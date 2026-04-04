import { z } from "zod";

export const requestOtpValidation = z.object({
    email: z.string().email(),
});

export const verifyOtpValidation = z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{5}$/),
});
