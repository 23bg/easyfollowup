"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FollowUpItem = {
    id: string;
    note: string;
    nextDate?: string | null;
    completed: boolean;
    createdAt: string;
    lead?: {
        id: string;
        name: string;
        status: string;
        primaryPhone?: string | null;
    };
};

export default function FollowUpsPage() {
    const [items, setItems] = useState<FollowUpItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const response = await api.get(API.CRM.FOLLOWUP, {
                    params: {
                        upcoming: true,
                        page: 1,
                        pageSize: 50,
                    },
                });
                setItems(response.data?.data?.items ?? []);
            } catch (error: any) {
                toast.error(error?.response?.data?.error?.message ?? "Failed to load follow-ups.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <main className="space-y-4 py-2">
            <div>
                <h1 className="text-2xl font-semibold">Follow-ups</h1>
                <p className="mt-1 text-sm text-muted-foreground">Upcoming and overdue reminders across your leads.</p>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="py-8 text-sm text-muted-foreground">Loading follow-ups...</CardContent>
                </Card>
            ) : !items.length ? (
                <Card>
                    <CardContent className="py-8 text-sm text-muted-foreground">No upcoming follow-ups.</CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {items.map((item) => {
                        const isOverdue = !!item.nextDate && new Date(item.nextDate).getTime() < Date.now() && !item.completed;
                        return (
                            <Card key={item.id} className={isOverdue ? "border-red-400/60" : ""}>
                                <CardHeader className="pb-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <CardTitle className="text-base">{item.lead?.name ?? "Unknown Lead"}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isOverdue ? <Badge variant="destructive">Overdue</Badge> : <Badge variant="secondary">Upcoming</Badge>}
                                            <Badge variant="outline">{item.lead?.status ?? "NEW"}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="text-foreground">{item.note}</p>
                                    <p className="text-muted-foreground">
                                        Next date: {item.nextDate ? new Date(item.nextDate).toLocaleString() : "Not set"}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
