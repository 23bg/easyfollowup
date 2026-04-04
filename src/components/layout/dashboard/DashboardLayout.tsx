"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardNavbar from "@/components/layout/dashboard/DashboardNavbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardNavbar />

            <main className="mx-auto h-[calc(100vh-4rem)] w-full max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
                <ScrollArea className="h-full py-4">{children}</ScrollArea>
            </main>

            <footer className="border-t bg-background">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                    <span>©2026 EasyFollowUp.</span>
                    <div className="flex gap-3">
                        <Link href="#" className="transition hover:text-primary">Terms</Link>
                        <Link href="#" className="transition hover:text-primary">Docs</Link>
                        <Link href="#" className="transition hover:text-primary">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

