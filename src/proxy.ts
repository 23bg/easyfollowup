import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/auth";

const PUBLIC_PATHS = ["/login", "/signup", "/verification", "/pricing", "/features", "/about", "/contact"];
const ONBOARDING_PATH = "/onboarding";
const APP_PROTECTED_PATHS = [
    "/dashboard",
    "/leads",
    "/lead",
    "/sources",
    "/automation",
    "/contacts",
    "/team",
    "/settings",
];

const normalizeDashboardPath = (pathname: string): string | null => {
    if (!pathname.startsWith("/dashboard")) return null;
    const remainder = pathname.slice("/dashboard".length);
    if (!remainder) return "/";
    return remainder.startsWith("/") ? remainder : `/${remainder}`;
};

const isPublicPath = (pathname: string): boolean =>
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const getSessionToken = (req: NextRequest): string | undefined =>
    req.cookies.get("session_token")?.value || req.cookies.get("access_token")?.value;

const isProtectedPath = (pathname: string): boolean =>
    pathname.startsWith(ONBOARDING_PATH) || APP_PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const normalizedPath = normalizeDashboardPath(pathname);
    if (normalizedPath) {
        return NextResponse.redirect(new URL(normalizedPath, req.url));
    }

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/images")
    ) {
        return NextResponse.next();
    }

    const token = getSessionToken(req);
    const session = token ? verifySessionToken(token) : null;
    const isOnboarded = Boolean(session?.isOnboarded);
    const isDashboardPath = APP_PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
    const isOnboardingPath = pathname.startsWith(ONBOARDING_PATH);

    if (!session && isProtectedPath(pathname) && !isPublicPath(pathname)) {
        if (isOnboardingPath) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (session && ["/login", "/signup", "/verification"].includes(pathname)) {
        return NextResponse.redirect(new URL(isOnboarded ? "/" : ONBOARDING_PATH, req.url));
    }

    if (session && !isOnboarded && isDashboardPath) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
    }

    if (session && isOnboarded && isOnboardingPath) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (session && isOnboarded && (isDashboardPath || isProtectedPath(pathname))) {
        const status = session.subscriptionStatus;
        const isAllowed = status === "TRIAL" || status === "ACTIVE";

        if (!isAllowed && !pathname.startsWith("/pricing")) {
            return NextResponse.redirect(new URL("/pricing", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

