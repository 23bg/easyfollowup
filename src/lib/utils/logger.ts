import pino from "pino";

export const logger = pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    base: undefined,
    redact: {
        paths: ["req.headers.authorization", "token", "otp", "password"],
        remove: true,
    },
});

