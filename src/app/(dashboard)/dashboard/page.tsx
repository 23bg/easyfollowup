"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { Loader2, UserPlus, PhoneCall, Trophy } from "lucide-react";
import Section from "@/components/ui/section";
import type { ResponsiveTableColumn, ResponsiveTableProps } from "@/components/tables/ResponsiveTable";
import { Grid, Stack } from "@/components/ui/layout-primitives";
import LoadingState from "@/components/ui/loading-state";

const ResponsiveTable = dynamic<ResponsiveTableProps<Metrics["recentLeads"][number]>>(() => import("@/components/tables/ResponsiveTable"), {
    loading: () => <LoadingState showSkeleton className="py-2" />,
});

type Metrics = {
    totalLeads: number;
    newLeads: number;
    contactedLeads: number;
    customers: number;
    recentLeads: Array<{
        id: string;
        name: string;
        primaryPhone?: string | null;
        category?: string | null;
        city?: string | null;
        status: string;
        createdAt: string;
    }>;
};

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [allRes, newRes, contactedRes, customerRes] = await Promise.all([
                    api.get(API.EasyFollowUp.LEADS, { params: { page: 1, pageSize: 5 } }),
                    api.get(API.EasyFollowUp.LEADS, { params: { page: 1, pageSize: 1, status: "NEW" } }),
                    api.get(API.EasyFollowUp.LEADS, { params: { page: 1, pageSize: 1, status: "CONTACTED" } }),
                    api.get(API.EasyFollowUp.LEADS, { params: { page: 1, pageSize: 1, status: "CUSTOMER" } }),
                ]);

                const allData = allRes.data?.data;
                setMetrics({
                    totalLeads: allData?.total ?? 0,
                    newLeads: newRes.data?.data?.total ?? 0,
                    contactedLeads: contactedRes.data?.data?.total ?? 0,
                    customers: customerRes.data?.data?.total ?? 0,
                    recentLeads: allData?.items ?? [],
                });
            } catch {
                setMetrics({
                    totalLeads: 0,
                    newLeads: 0,
                    contactedLeads: 0,
                    customers: 0,
                    recentLeads: [],
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const cards = [
        { label: "Total Leads", value: metrics?.totalLeads ?? 0, icon: UserPlus, color: "text-foreground" },
        { label: "New Leads", value: metrics?.newLeads ?? 0, icon: UserPlus, color: "text-foreground" },
        { label: "Contacted Leads", value: metrics?.contactedLeads ?? 0, icon: PhoneCall, color: "text-foreground" },
        { label: "Customers", value: metrics?.customers ?? 0, icon: Trophy, color: "text-foreground" },
    ];

    const recentLeadColumns: ResponsiveTableColumn<Metrics["recentLeads"][number]>[] = [
        {
            key: "name",
            title: "Name",
            isPrimary: true,
            render: (lead) => <span className="font-medium">{lead.name}</span>,
        },
        { key: "phone", title: "Phone", render: (lead) => lead.primaryPhone || "-" },
        { key: "category", title: "Category", render: (lead) => lead.category || "-" },
        { key: "city", title: "City", render: (lead) => lead.city || "-" },
        { key: "status", title: "Status", render: (lead) => lead.status },
    ];

    return (
        <Container className="py-4 md:py-6 lg:py-8">
            <Stack className="gap-6 md:gap-8">
                <PageHeader
                    title="Dashboard"
                    description="Monthly performance snapshot."
                />

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                            <Grid className="md:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <Card key={card.label}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{card.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                            </Grid>

                        <Section title="Recent Leads">
                            <ResponsiveTable
                                data={metrics?.recentLeads ?? []}
                                columns={recentLeadColumns}
                                getRowKey={(lead) => lead.id}
                                emptyTitle="No leads found"
                                emptyDescription="Newly captured leads will appear here."
                            />
                        </Section>
                    </>
                )}
            </Stack>
        </Container>
    );
}
