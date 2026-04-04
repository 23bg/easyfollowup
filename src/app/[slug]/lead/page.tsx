"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function LeadCapturePage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;

    const [form, setForm] = useState({ name: "", phone: "", email: "", category: "", message: "" });
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            setError("Name and phone are required");
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await api.post(API.INTERNAL.PUBLIC.LEAD(slug), {
                name: form.name,
                phone: form.phone,
                email: form.email || undefined,
                course: form.category || undefined,
                message: form.message || undefined,
                source: "FORM",
            });
            setSubmitted(true);
        } catch (error: any) {
            setError(error?.response?.data?.error?.message ?? "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return (
            <main className="mx-auto max-w-xl px-4 py-20 text-center">
                <CheckCircle2 className="h-12 w-12 text-foreground mx-auto" />
                <h1 className="mt-4 text-2xl font-bold">Thank You!</h1>
                <p className="mt-2 text-muted-foreground">Your details have been submitted. Our team will contact you soon.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-xl px-4 py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Lead Capture Form</CardTitle>
                    <CardDescription>Submit your details and our team will get back to you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="What are you looking for?" />
                    </div>
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Any message (optional)" rows={4} />
                    </div>
                    <Button onClick={submit} disabled={saving} className="w-full">
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit"}
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
