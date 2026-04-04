"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/modules/auth/components/UserMenu";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Leads", href: "/leads" },
    { name: "Follow-ups", href: "/followups" },
    { name: "Team", href: "/team" },
    { name: "Billing", href: "/billing" },
];

export default function DashboardNavbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
                        EasyFollowup
                    </Link>
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
                                        active && "bg-primary text-primary-foreground hover:text-primary-foreground"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 lg:px-8">
                {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={`mobile-${item.href}`}
                            href={item.href}
                            className={cn(
                                "whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground",
                                active && "border-primary bg-primary text-primary-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </header>
    );
}
