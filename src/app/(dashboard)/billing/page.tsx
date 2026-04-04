"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";

type BillingSummary = {
    planType?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
};

export default function BillingPage() {
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadSummary = async () => {
        setLoading(true);
        try {
            const response = await api.get(API.CRM.SUBSCRIPTION);
            setSummary(response.data?.data ?? null);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to load billing summary.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    const upgrade = async () => {
        setSubmitting(true);
        try {
            const response = await api.post(API.CRM.SUBSCRIPTION, {
                action: "create-subscription",
                planType: "TEAM",
                provider: "razorpay",
            });

            const shortUrl = response.data?.data?.shortUrl;
            if (shortUrl) {
                window.location.href = shortUrl;
                return;
            }

            toast.success("Subscription request created.");
            await loadSummary();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to create subscription.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="space-y-4 py-2">
            <div>
                <h1 className="text-2xl font-semibold">Billing</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage your EasyFollowUp subscription and plan limits.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {loading ? (
                        <p className="text-muted-foreground">Loading billing details...</p>
                    ) : (
                        <>
                            <p>Plan: <span className="font-medium">{summary?.planType ?? "SOLO"}</span></p>
                            <p>Status: <span className="font-medium">{summary?.status ?? "TRIAL"}</span></p>
                            <p>
                                Period ends: <span className="font-medium">{summary?.currentPeriodEnd ? new Date(summary.currentPeriodEnd).toLocaleDateString() : "-"}</span>
                            </p>
                        </>
                    )}

                    <div className="pt-3">
                        <Button onClick={upgrade} disabled={submitting || loading}>Upgrade to Team</Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
