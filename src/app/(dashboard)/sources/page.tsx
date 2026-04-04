"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SourceSummary = {
    source: string;
    totalLeads: number;
    lastCapturedAt: string | null;
    status: "ACTIVE" | "NOT_USED";
};

export default function LeadSourcesPage() {
    const [items, setItems] = useState<SourceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState("FORM");
    const [name, setName] = useState("Website Form");
    const [generated, setGenerated] = useState<{ endpoint: string; embedCode: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const response = await api.get(API.INTERNAL.LEAD_SOURCES.ROOT);
            setItems(response.data?.data ?? []);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to load sources.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const generateSource = async () => {
        setSaving(true);
        try {
            const response = await api.post(API.INTERNAL.LEAD_SOURCES.ROOT, {
                source,
                name: name.trim() || undefined,
            });
            setGenerated({
                endpoint: response.data?.data?.endpoint,
                embedCode: response.data?.data?.embedCode,
            });
            toast.success("Source setup generated.");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to create source setup.");
        } finally {
            setSaving(false);
        }
    };

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied.");
        } catch {
            toast.error("Copy failed.");
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Lead Sources</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track source performance and generate capture setup for your first source.</p>

            {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading sources...</p>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium">Leads</th>
                                <th className="px-4 py-3 font-medium">Last Captured</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.source} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">{item.source}</td>
                                    <td className="px-4 py-3">{item.totalLeads}</td>
                                    <td className="px-4 py-3">{item.lastCapturedAt ? new Date(item.lastCapturedAt).toLocaleString() : "-"}</td>
                                    <td className="px-4 py-3">{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <section className="mt-8 rounded-md border p-4">
                <h2 className="text-lg font-semibold">Create Source Setup</h2>
                <p className="mt-1 text-sm text-muted-foreground">Generate endpoint and embed snippet for capture integration.</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                        <Label>Source Type</Label>
                        <Select value={source} onValueChange={setSource}>
                            <SelectTrigger><SelectValue placeholder="Source type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FORM">FORM</SelectItem>
                                <SelectItem value="WEBSITE">WEBSITE</SelectItem>
                                <SelectItem value="IMPORT">IMPORT</SelectItem>
                                <SelectItem value="GOOGLE_MAPS">GOOGLE_MAPS</SelectItem>
                                <SelectItem value="MANUAL">MANUAL</SelectItem>
                                <SelectItem value="DIRECTORY">DIRECTORY</SelectItem>
                                <SelectItem value="EXTENSION">EXTENSION</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Source Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Form" />
                    </div>
                </div>

                <Button onClick={generateSource} className="mt-4" disabled={saving}>Generate Setup</Button>

                {generated && (
                    <div className="mt-4 space-y-3">
                        <div>
                            <Label>Public Capture Endpoint</Label>
                            <div className="mt-1 flex gap-2">
                                <Input value={generated.endpoint} readOnly />
                                <Button type="button" variant="outline" onClick={() => copy(generated.endpoint)}>Copy</Button>
                            </div>
                        </div>
                        <div>
                            <Label>Embed Snippet</Label>
                            <Textarea value={generated.embedCode} readOnly rows={8} className="font-mono text-xs" />
                            <Button type="button" className="mt-2" variant="outline" onClick={() => copy(generated.embedCode)}>Copy Snippet</Button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
