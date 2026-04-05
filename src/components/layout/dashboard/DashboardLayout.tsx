"use client";

import DashboardAppShell from "@/components/layout/dashboard/DashboardAppShell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardAppShell>{children}</DashboardAppShell>;
}

