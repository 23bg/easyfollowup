"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { Grid, Inline, Stack } from "@/components/ui/layout-primitives";
import ResponsiveTable, { ResponsiveTableColumn } from "@/components/tables/ResponsiveTable";

type LeadDetails = {
    id: string;
    name: string;
    primaryPhone?: string | null;
    email?: string | null;
    city?: string | null;
    website?: string | null;
    notes?: string | null;
    leadProducts: Array<{ id: string; productId: string; status: string; product?: { name: string } | null }>;
    contactLogs: Array<{ id: string; type: string; notes?: string | null; createdAt: string }>;
};

type Product = { id: string; name: string };

export default function LeadDetailsPage() {
    const params = useParams<{ id: string }>();
    const [lead, setLead] = useState<LeadDetails | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState("");
    const [contactType, setContactType] = useState("CALL");
    const [contactNotes, setContactNotes] = useState("");

    const load = async () => {
        if (!params?.id) return;
        try {
            const [leadRes, productsRes] = await Promise.all([
                api.get(API.EasyFollowUp.LEAD_BY_ID(params.id)),
                api.get("/api/products"),
            ]);
            setLead(leadRes.data?.data ?? null);
            setProducts(productsRes.data?.data ?? []);
        } catch {
            toast.error("Failed to load lead details");
        }
    };

    useEffect(() => {
        load();
    }, [params?.id]);

    const addProduct = async () => {
        if (!productId || !lead) return;
        try {
            await api.post("/api/lead-products", {
                leadId: lead.id,
                productId,
                status: "INTERESTED",
            });
            setProductId("");
            await load();
            toast.success("Product linked");
        } catch {
            toast.error("Failed to link product");
        }
    };

    const addContactLog = async () => {
        if (!lead) return;
        try {
            await api.post("/api/contact-log", {
                leadId: lead.id,
                type: contactType,
                notes: contactNotes || undefined,
            });
            setContactNotes("");
            await load();
            toast.success("Contact log added");
        } catch {
            toast.error("Failed to add contact log");
        }
    };

    if (!lead) {
        return (
            <Container className="py-4 md:py-6 lg:py-8">
                <p className="text-sm text-muted-foreground">Lead not found.</p>
            </Container>
        );
    }

    const contactColumns: ResponsiveTableColumn<LeadDetails["contactLogs"][number]>[] = [
        { key: "createdAt", title: "Date", isPrimary: true, render: (item) => new Date(item.createdAt).toLocaleString() },
        { key: "type", title: "Type", render: (item) => item.type },
        { key: "notes", title: "Notes", render: (item) => item.notes || "-" },
    ];

    return (
        <Container className="py-4 md:py-6 lg:py-8">
            <Stack>
                <PageHeader title="Lead Details" description="Review profile, product interest, and contact timeline." />

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Grid className="md:grid-cols-2">
                            <div className="space-y-2"><Label>Name</Label><Input value={lead.name} readOnly /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={lead.primaryPhone ?? ""} readOnly /></div>
                            <div className="space-y-2"><Label>Email</Label><Input value={lead.email ?? ""} readOnly /></div>
                            <div className="space-y-2"><Label>City</Label><Input value={lead.city ?? ""} readOnly /></div>
                            <div className="space-y-2"><Label>Website</Label><Input value={lead.website ?? ""} readOnly /></div>
                            <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={lead.notes ?? ""} readOnly /></div>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Product Interest</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Inline>
                            <Select value={productId} onValueChange={setProductId}>
                                <SelectTrigger className="w-full sm:w-70"><SelectValue placeholder="Select product" /></SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={addProduct}>Add Product</Button>
                        </Inline>
                        <ul className="space-y-2 text-sm">
                            {lead.leadProducts?.length ? lead.leadProducts.map((item) => (
                                <li key={item.id} className="rounded border p-2">{item.product?.name ?? "Unknown Product"} • {item.status}</li>
                            )) : <li className="text-muted-foreground">No products linked.</li>}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Inline>
                            <Select value={contactType} onValueChange={setContactType}>
                                <SelectTrigger className="w-full sm:w-45"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CALL">CALL</SelectItem>
                                    <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                                    <SelectItem value="EMAIL">EMAIL</SelectItem>
                                    <SelectItem value="DEMO">DEMO</SelectItem>
                                    <SelectItem value="MEETING">MEETING</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder="Notes" value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} className="w-full sm:max-w-md" />
                            <Button onClick={addContactLog}>Add Log</Button>
                        </Inline>

                        <ResponsiveTable
                            data={lead.contactLogs ?? []}
                            columns={contactColumns}
                            getRowKey={(item) => item.id}
                            emptyTitle="No contact history yet"
                        />
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}
