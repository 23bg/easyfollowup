import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { organizationService } from "@/features/organization/services/organization.service";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "EasyFollowUp Dashboard - Manage leads, follow-ups, team, and billing.",
};

export default async function AppLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await readSessionFromCookie();
    if (!session) {
        redirect("/login");
    }

    const organization = await organizationService.getOverview(session.instituteId);
    if (!organization.isOnboarded) {
        redirect("/onboarding");
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}

