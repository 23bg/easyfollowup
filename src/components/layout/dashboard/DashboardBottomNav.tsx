"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardMobileNavItems } from "@/modules/dashboard/navigation";
import { cn } from "@/lib/utils";

export default function DashboardBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Mobile dashboard navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 md:hidden"
        >
            <ul className="grid h-16 grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
                {dashboardMobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <li key={item.href} className="flex">
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex w-full flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground transition-colors",
                                    active && "text-primary"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
