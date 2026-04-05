import {
    Bell,
    Bot,
    CreditCard,
    LayoutDashboard,
    PhoneCall,
    Settings,
    Target,
    Users,
    UserSquare2,
} from "lucide-react";
import type { ComponentType } from "react";

export type DashboardNavItem = {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    mobile: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, mobile: true },
    { label: "Leads", href: "/leads", icon: Target, mobile: true },
    { label: "Follow-ups", href: "/followups", icon: Bell, mobile: true },
    { label: "Team", href: "/team", icon: Users, mobile: true },
    { label: "Settings", href: "/settings", icon: Settings, mobile: true },
    { label: "Contacts", href: "/contacts", icon: PhoneCall, mobile: false },
    { label: "Sources", href: "/sources", icon: UserSquare2, mobile: false },
    { label: "Automation", href: "/automation", icon: Bot, mobile: false },
    { label: "Billing", href: "/billing", icon: CreditCard, mobile: false },
];

export const dashboardMobileNavItems = dashboardNavItems.filter((item) => item.mobile).slice(0, 5);
