"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "@/components/theme-toggle";
import ImraboChat from "@/modules/ai/components/ImraboChat";
import UserMenu from "@/modules/auth/components/UserMenu";

export default function DashboardHeader() {
    return (
        <header className="flex h-16 items-center justify-between px-4 border-b bg-background dark:bg-zinc-900/40 backdrop-blur-sm rounded-t-xl">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
            </div>

            <div className="flex items-center gap-3">
                <ImraboChat />
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
