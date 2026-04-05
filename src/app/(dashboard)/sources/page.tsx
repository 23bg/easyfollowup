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
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import Section from "@/components/ui/section";
import { Grid, Stack } from "@/components/ui/layout-primitives";
import ResponsiveTable, { ResponsiveTableColumn } from "@/components/tables/ResponsiveTable";

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

    const sourceColumns: ResponsiveTableColumn<SourceSummary>[] = [
        { key: "source", title: "Source", isPrimary: true, render: (item) => item.source },
        { key: "totalLeads", title: "Leads", render: (item) => item.totalLeads },
        {
            key: "lastCapturedAt",
            title: "Last Captured",
            render: (item) => (item.lastCapturedAt ? new Date(item.lastCapturedAt).toLocaleString() : "-"),
        },
        { key: "status", title: "Status", render: (item) => item.status },
    ];

    return (
        <Container className="py-4 md:py-6 lg:py-8">
            <Stack>
                <PageHeader
                    title="Lead Sources"
                    description="Track source performance and generate capture setup for your first source."
                />

                <Section>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading sources...</p>
                    ) : (
                        <ResponsiveTable
                            data={items}
                            columns={sourceColumns}
                            getRowKey={(item) => item.source}
                            emptyTitle="No lead sources yet"
                            emptyDescription="Create one below to start capturing leads."
                        />
                    )}
                </Section>

                <Section
                    title="Create Source Setup"
                    description="Generate endpoint and embed snippet for capture integration."
                >
                    <Grid className="md:grid-cols-2">
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            <Label>Source Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Form" />
                        </div>
                    </Grid>

                    <Button onClick={generateSource} className="mt-4" disabled={saving}>Generate Setup</Button>

                    {generated && (
                        <Stack className="mt-4">
                            <div>
                                <Label>Public Capture Endpoint</Label>
                                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                    <Input value={generated.endpoint} readOnly className="w-full" />
                                    <Button type="button" variant="outline" onClick={() => copy(generated.endpoint)}>Copy</Button>
                                </div>
                            </div>
                            <div>
                                <Label>Embed Snippet</Label>
                                <Textarea value={generated.embedCode} readOnly rows={8} className="font-mono text-xs" />
                                <Button type="button" className="mt-2" variant="outline" onClick={() => copy(generated.embedCode)}>Copy Snippet</Button>
                            </div>
                        </Stack>
                    )}
                </Section>
            </Stack>
        </Container>
    );
}
