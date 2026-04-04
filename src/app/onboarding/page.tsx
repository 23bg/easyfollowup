"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

type OnboardingForm = {
    name: string;
    slug: string;
    industry: string;
    country: string;
    phone: string;
    whatsapp: string;
    description: string;
    website: string;
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
};

type FieldError = Partial<Record<keyof OnboardingForm, string>>;

export default function OnboardingIndexPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sourceLoading, setSourceLoading] = useState(false);
    const [errors, setErrors] = useState<FieldError>({});
    const [sourceType, setSourceType] = useState("FORM");
    const [sourceName, setSourceName] = useState("Website Form");
    const [sourceSetup, setSourceSetup] = useState<{ endpoint: string; embedCode: string } | null>(null);
    const [form, setForm] = useState<OnboardingForm>({
        name: "",
        slug: "",
        industry: "",
        country: "",
        phone: "",
        whatsapp: "",
        description: "",
        website: "",
        facebook: "",
        instagram: "",
        youtube: "",
        linkedin: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get(API.INTERNAL.ORGANIZATION.ROOT);
                const data = response.data?.data ?? {};

                if (data.isOnboarded) {
                    router.push("/dashboard");
                    return;
                }

                setForm({
                    name: data.name ?? "",
                    slug: data.slug ?? "",
                    industry: "",
                    country: data.state ?? "",
                    phone: data.phone ?? "",
                    whatsapp: data.whatsapp ?? "",
                    description: data.description ?? "",
                    website: data.socialLinks?.website ?? "",
                    facebook: data.socialLinks?.facebook ?? "",
                    instagram: data.socialLinks?.instagram ?? "",
                    youtube: data.socialLinks?.youtube ?? "",
                    linkedin: data.socialLinks?.linkedin ?? "",
                });
                setLoading(false);
            } catch {
                router.push("/login");
            }
        };
        load();
    }, [router]);

    const setValue = (key: keyof OnboardingForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const next: FieldError = {};
        if (!form.name.trim()) next.name = "Organization name is required";
        if (!form.slug.trim()) next.slug = "Slug is required";
        if (!form.industry.trim()) next.industry = "Industry is required";
        if (!form.country.trim()) next.country = "Country is required";
        if (form.phone.trim() && !/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) {
            next.phone = "Enter a valid Indian mobile number";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const generateFirstSource = async () => {
        setSourceLoading(true);
        try {
            const response = await api.post(API.INTERNAL.LEAD_SOURCES.ROOT, {
                source: sourceType,
                name: sourceName.trim() || undefined,
            });
            setSourceSetup({
                endpoint: response.data?.data?.endpoint,
                embedCode: response.data?.data?.embedCode,
            });
            toast.success("First source configured.");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to configure source.");
        } finally {
            setSourceLoading(false);
        }
    };

    const submit = async () => {
        if (!validate()) return;
        if (!sourceSetup) {
            toast.error("Please create your first source before continuing.");
            return;
        }

        setSaving(true);
        try {
            await api.post(API.INTERNAL.ORGANIZATION.ONBOARDING, {
                ...form,
                city: "",
                state: form.country,
                address: "",
            });

            toast.success("Organization setup complete!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-primary">Step 1 of 2 — Organization Setup</p>
                    <h1 className="text-3xl font-bold tracking-tight">Set Up Your LeadHub Workspace</h1>
                    <p className="text-muted-foreground">Complete organization details and create your first source before entering dashboard.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                        <CardDescription>Fields marked with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name *</Label>
                                <Input id="name" value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="e.g. LeadHub Systems" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Workspace Slug *</Label>
                                <Input id="slug" value={form.slug} onChange={(e) => setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="e.g. leadhub-systems" />
                                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry *</Label>
                                <Input id="industry" value={form.industry} onChange={(e) => setValue("industry", e.target.value)} placeholder="e.g. SaaS" />
                                {errors.industry && <p className="text-sm text-destructive">{errors.industry}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input id="country" value={form.country} onChange={(e) => setValue("country", e.target.value)} placeholder="e.g. India" />
                                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} placeholder="e.g. 9876543210" />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setValue("whatsapp", e.target.value)} placeholder="WhatsApp number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={form.description} onChange={(e) => setValue("description", e.target.value)} placeholder="Short description" />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Social Links (optional)</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Input value={form.website} onChange={(e) => setValue("website", e.target.value)} placeholder="Website URL" />
                                <Input value={form.facebook} onChange={(e) => setValue("facebook", e.target.value)} placeholder="Facebook URL" />
                                <Input value={form.instagram} onChange={(e) => setValue("instagram", e.target.value)} placeholder="Instagram URL" />
                                <Input value={form.youtube} onChange={(e) => setValue("youtube", e.target.value)} placeholder="YouTube URL" />
                                <Input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="LinkedIn URL" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Step 2 — Create Your First Source</CardTitle>
                        <CardDescription>Choose a source and generate your first capture setup.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Source Type</Label>
                                <Select value={sourceType} onValueChange={setSourceType}>
                                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
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
                                <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Website Form" />
                            </div>
                        </div>

                        <Button onClick={generateFirstSource} disabled={sourceLoading} variant="outline">
                            {sourceLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate First Source"}
                        </Button>

                        {sourceSetup && (
                            <div className="space-y-3 rounded-md border p-3">
                                <p className="text-sm"><strong>Endpoint:</strong> {sourceSetup.endpoint}</p>
                                <div className="space-y-2">
                                    <Label>Embed Snippet</Label>
                                    <Textarea value={sourceSetup.embedCode} readOnly rows={8} className="font-mono text-xs" />
                                </div>
                            </div>
                        )}

                        <Button onClick={submit} disabled={saving} className="w-full" size="lg">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Complete Setup & Enter Dashboard"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
