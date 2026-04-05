"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dashboardNavItems } from "@/modules/dashboard/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardSidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
};

export default function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "sticky top-0 hidden h-dvh shrink-0 border-r bg-muted/30 md:flex md:flex-col",
                collapsed ? "md:w-20 lg:w-64" : "w-64"
            )}
        >
            <div className="flex h-16 items-center justify-between border-b px-3">
                <Link href="/dashboard" className="flex min-w-0 items-center gap-2 px-2 py-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className={cn("truncate text-base font-semibold", collapsed ? "lg:inline" : "inline", collapsed && "hidden")}>EasyFollowUp</span>
                    <span className={cn("truncate text-base font-semibold", collapsed ? "hidden lg:hidden" : "hidden")}>EasyFollowUp</span>
                </Link>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex lg:hidden"
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
                <ul className="space-y-1">
                    {dashboardNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                                        active && "bg-primary text-primary-foreground hover:bg-primary/95 hover:text-primary-foreground",
                                        collapsed && "justify-center lg:justify-start"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0", collapsed ? "lg:mr-3" : "mr-3")} />
                                    <span className={cn(collapsed ? "hidden lg:inline" : "inline")}>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
