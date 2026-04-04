"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type AutomationItem = {
    key: "autoReplyEnabled" | "leadWhatsappEnabled";
    title: string;
    description: string;
    enabled: boolean;
};

export default function AutomationPage() {
    const [items, setItems] = useState<AutomationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const response = await api.get(API.INTERNAL.AUTOMATIONS.ROOT);
            setItems(response.data?.data ?? []);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to load automations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const update = async (key: AutomationItem["key"], enabled: boolean) => {
        setSavingKey(key);
        try {
            const response = await api.post(API.INTERNAL.AUTOMATIONS.ROOT, { key, enabled });
            setItems(response.data?.data ?? []);
            toast.success("Automation updated.");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to update automation.");
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Automation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enable workflow automations for faster first response.</p>

            {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading automations...</p>
            ) : (
                <div className="mt-6 grid gap-4">
                    {items.map((item) => (
                        <div key={item.key} className="rounded-md border p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold">{item.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                </div>
                                <Switch
                                    checked={item.enabled}
                                    onCheckedChange={(enabled) => update(item.key, enabled)}
                                    disabled={savingKey === item.key}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
