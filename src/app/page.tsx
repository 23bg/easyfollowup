import { redirect } from "next/navigation";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { organizationService } from "@/features/organization/services/organization.service";
import LandingPage from "@/modules/marketing/LandingPage";
import DashboardHome from "@/modules/dashboard/DashboardHome";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

export default async function Page() {
    const session = await readSessionFromCookie();

    if (!session) {
        return <LandingPage />;
    }

    const organization = await organizationService.getOverview(session.instituteId);
    if (!organization.isOnboarded) {
        redirect("/onboarding");
    }

    return (
        <DashboardLayout>
            <DashboardHome />
        </DashboardLayout>
    );
}
