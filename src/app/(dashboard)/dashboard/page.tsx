"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { Loader2, UserPlus, PhoneCall, Trophy } from "lucide-react";

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
                    api.get(API.LEADHUB.LEADS, { params: { page: 1, pageSize: 5 } }),
                    api.get(API.LEADHUB.LEADS, { params: { page: 1, pageSize: 1, status: "NEW" } }),
                    api.get(API.LEADHUB.LEADS, { params: { page: 1, pageSize: 1, status: "CONTACTED" } }),
                    api.get(API.LEADHUB.LEADS, { params: { page: 1, pageSize: 1, status: "CUSTOMER" } }),
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

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Monthly performance snapshot.</p>

            {loading ? (
                <div className="mt-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-base">Recent Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!metrics?.recentLeads?.length ? (
                                <p className="text-sm text-muted-foreground">No leads found yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>City</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {metrics.recentLeads.map((lead) => (
                                            <TableRow key={lead.id}>
                                                <TableCell className="font-medium">{lead.name}</TableCell>
                                                <TableCell>{lead.primaryPhone || "-"}</TableCell>
                                                <TableCell>{lead.category || "-"}</TableCell>
                                                <TableCell>{lead.city || "-"}</TableCell>
                                                <TableCell>{lead.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </main>
    );
}
