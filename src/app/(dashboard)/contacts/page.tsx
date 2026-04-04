"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type LeadOption = {
    id: string;
    name: string;
};

type ContactItem = {
    id: string;
    type: string;
    notes?: string | null;
    createdAt: string;
    lead: {
        id: string;
        name: string;
        primaryPhone?: string | null;
        city?: string | null;
        source?: string;
    };
};

export default function ContactLogsPage() {
    const [items, setItems] = useState<ContactItem[]>([]);
    const [leads, setLeads] = useState<LeadOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const [leadId, setLeadId] = useState("");
    const [type, setType] = useState("CALL");
    const [notes, setNotes] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const [logsResponse, leadsResponse] = await Promise.all([
                api.get(API.INTERNAL.CONTACT_LOGS.ROOT, {
                    params: {
                        page: 1,
                        pageSize: 100,
                        search: search || undefined,
                        type: typeFilter !== "ALL" ? typeFilter : undefined,
                    },
                }),
                api.get(API.EasyFollowUp.LEADS, { params: { page: 1, pageSize: 100 } }),
            ]);

            setItems(logsResponse.data?.data?.items ?? []);
            setLeads((leadsResponse.data?.data?.items ?? []).map((lead: any) => ({ id: lead.id, name: lead.name })));
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to load contacts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [search, typeFilter]);

    const submit = async () => {
        if (!leadId || !type) {
            toast.error("Lead and contact type are required.");
            return;
        }

        setSaving(true);
        try {
            await api.post(API.INTERNAL.CONTACT_LOGS.ROOT, {
                leadId,
                type,
                notes: notes.trim() || undefined,
            });
            toast.success("Contact log added.");
            setNotes("");
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to create contact log.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">Contact Logs</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track calls, emails, WhatsApp, demos, and meetings across leads.</p>

            <section className="mt-6 rounded border p-4">
                <h2 className="text-lg font-semibold">Log Contact Activity</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                        <Label>Lead</Label>
                        <Select value={leadId} onValueChange={setLeadId}>
                            <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                            <SelectContent>
                                {leads.map((lead) => (
                                    <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CALL">CALL</SelectItem>
                                <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                                <SelectItem value="EMAIL">EMAIL</SelectItem>
                                <SelectItem value="DEMO">DEMO</SelectItem>
                                <SelectItem value="MEETING">MEETING</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-3">
                    <Label>Notes</Label>
                    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Outcome, next action, objections..." />
                </div>
                <Button className="mt-4" onClick={submit} disabled={saving}>Save Contact Log</Button>
            </section>

            <section className="mt-6">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lead name or notes" />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger><SelectValue placeholder="Filter type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">ALL</SelectItem>
                            <SelectItem value="CALL">CALL</SelectItem>
                            <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                            <SelectItem value="EMAIL">EMAIL</SelectItem>
                            <SelectItem value="DEMO">DEMO</SelectItem>
                            <SelectItem value="MEETING">MEETING</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <p className="mt-4 text-sm text-muted-foreground">Loading contact logs...</p>
                ) : !items.length ? (
                    <p className="mt-4 text-sm text-muted-foreground">No contact logs found.</p>
                ) : (
                            <div className="mt-4 overflow-x-auto rounded border">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Lead</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Notes</th>
                                    <th className="px-4 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-b-0">
                                        <td className="px-4 py-3">{item.lead?.name ?? "-"}</td>
                                        <td className="px-4 py-3">{item.type}</td>
                                        <td className="px-4 py-3">{item.notes ?? "-"}</td>
                                        <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}
