import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env, requireEnv } from "@/lib/config/env";

const SESSION_COOKIE = "session_token";

export type SessionRole = "OWNER" | "MEMBER" | "EDITOR" | "VIEWER" | "MANAGER";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";

export type SessionPayload = {
    userId: string;
    email: string;
    role: SessionRole;
    orgId?: string;
    instituteId: string;
    isOnboarded: boolean;
    subscriptionStatus: SubscriptionStatus;
};

const getJwtSecret = (): string => requireEnv("JWT_SECRET");

export const createSessionToken = (payload: SessionPayload): string =>
    jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });

export const verifySessionToken = (token: string): SessionPayload | null => {
    try {
        return jwt.verify(token, getJwtSecret()) as SessionPayload;
    } catch {
        return null;
    }
};

export const setSessionCookie = async (token: string): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
};

export const clearSessionCookie = async (): Promise<void> => {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
};

export const readSessionFromCookie = async (): Promise<SessionPayload | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
};

export const readSessionUserId = async (): Promise<string | null> => {
    const session = await readSessionFromCookie();
    return session?.userId ?? null;
};

export const readSessionOrgId = async (): Promise<string | null> => {
    const session = await readSessionFromCookie();
    return session?.orgId ?? session?.instituteId ?? null;
};

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

