"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import InstallPrompt from "@/components/ui/InstallPrompt";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/modules/auth/components/UserMenu";
import { Button } from "@/components/ui/button";
import DashboardBottomNav from "@/components/layout/dashboard/DashboardBottomNav";
import DashboardSidebar from "@/components/layout/dashboard/DashboardSidebar";

export default function DashboardAppShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-dvh bg-background">
            <div className="flex min-h-dvh">
                <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 h-16 border-b bg-background/90 backdrop-blur">
                        <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="hidden md:inline-flex lg:hidden"
                                    onClick={() => setCollapsed((prev) => !prev)}
                                    aria-label="Toggle navigation"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                                <p className="text-sm text-muted-foreground">Workspace</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <InstallPrompt />
                                <ThemeToggle />
                                <UserMenu />
                            </div>
                        </div>
                    </header>

                    <main className="min-w-0 flex-1 pb-[calc(var(--dashboard-bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0">
                        {children}
                    </main>
                </div>
            </div>

            <DashboardBottomNav />
        </div>
    );
}
