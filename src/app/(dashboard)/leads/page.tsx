"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type LeadItem = {
    id: string;
    name: string;
    primaryPhone?: string | null;
    email?: string | null;
    status: string;
    city?: string | null;
    category?: string | null;
    source?: string | null;
    googleMapsLink?: string | null;
    rating?: number | null;
    notes?: string | null;
    tags?: string[];
    createdAt: string;
};

type LeadForm = {
    name: string;
    primaryPhone: string;
    email: string;
    city: string;
    category: string;
    source: string;
    googleMapsLink: string;
    rating: string;
    notes: string;
    tags: string;
};

const statusOptions = ["ALL", "NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED", "ADMITTED"];
const sourceOptions = ["ALL", "MANUAL", "IMPORT", "GOOGLE_MAPS", "WEBSITE", "DIRECTORY", "EXTENSION", "FORM"];
const contactTypes = ["CALL", "WHATSAPP", "EMAIL", "DEMO", "MEETING"];

const emptyForm: LeadForm = {
    name: "",
    primaryPhone: "",
    email: "",
    city: "",
    category: "",
    source: "MANUAL",
    googleMapsLink: "",
    rating: "",
    notes: "",
    tags: "",
};

const normalize = (value?: string | null) => (value ?? "").toLowerCase();

type ImportRow = Record<string, unknown>;

const importSourceOptions = sourceOptions.filter((item) => item !== "ALL");
const leadSourceSet = new Set(importSourceOptions);
const leadStatusSet = new Set(statusOptions.filter((item) => item !== "ALL"));

const supportedImportColumns = [
    { field: "name", required: "Yes", aliases: "name, fullName, leadName", notes: "Required for each row" },
    { field: "primaryPhone", required: "No", aliases: "primaryPhone, phone, mobile, phoneNumber", notes: "Stored as primary phone" },
    { field: "email", required: "No", aliases: "email", notes: "Valid email format recommended" },
    { field: "city", required: "No", aliases: "city", notes: "City/region text" },
    { field: "category", required: "No", aliases: "category, segment", notes: "Lead category" },
    { field: "source", required: "No", aliases: "source", notes: "Defaults to IMPORT if unknown" },
    { field: "googleMapsLink", required: "No", aliases: "googleMapsLink, googleMapLink, mapsLink, mapUrl", notes: "Valid Google Maps URL" },
    { field: "rating", required: "No", aliases: "rating, score", notes: "0 to 5" },
    { field: "status", required: "No", aliases: "status", notes: "NEW, CONTACTED, INTERESTED, TRIAL, CUSTOMER, REJECTED, ADMITTED" },
    { field: "tags", required: "No", aliases: "tags, tag", notes: "Comma or semicolon separated" },
    { field: "notes", required: "No", aliases: "notes, remark, message", notes: "Free text" },
];

const PAGE_SIZE = 10;

const sampleCsvImportData = `name,primaryPhone,email,city,category,source,googleMapsLink,status,rating,tags,notes
Riya Sharma,9876543210,riya@example.com,Pune,Coaching,IMPORT,https://maps.google.com/?q=Pune,NEW,4.2,"hot,science","Interested in weekend batches"
Amit Verma,9123456789,amit@example.com,Mumbai,School,GOOGLE_MAPS,https://maps.google.com/?q=Mumbai,CONTACTED,3.8,"follow-up","Requested fee details"`;

const sampleJsonImportData = `[
    {
        "name": "Riya Sharma",
        "primaryPhone": "9876543210",
        "email": "riya@example.com",
        "city": "Pune",
        "category": "Coaching",
        "source": "IMPORT",
        "googleMapsLink": "https://maps.google.com/?q=18.5204,73.8567",
        "status": "NEW",
        "rating": 4.2,
        "tags": "hot,science",
        "notes": "Interested in weekend batches"
    }
]`;

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

const supportedExcelMimeTypes = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
]);

const supportedCsvMimeTypes = new Set([
    "text/csv",
    "application/csv",
    "text/plain",
]);

const extractRowsFromJson = (value: unknown): ImportRow[] => {
    if (Array.isArray(value)) return value as ImportRow[];
    if (!value || typeof value !== "object") return [];

    const objectValue = value as Record<string, unknown>;
    const candidates = [objectValue.leads, objectValue.items, objectValue.data];
    const list = candidates.find((candidate) => Array.isArray(candidate));
    return (list as ImportRow[]) ?? [];
};

const getImportField = (row: ImportRow, aliases: string[]) => {
    const entries = Object.entries(row);
    for (const alias of aliases) {
        const normalizedAlias = normalizeHeader(alias);
        const match = entries.find(([key]) => normalizeHeader(key) === normalizedAlias);
        if (match && match[1] !== null && match[1] !== undefined) {
            return String(match[1]).trim();
        }
    }
    return "";
};

const parseTags = (value: string) =>
    value
        .split(/[;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean);
const getPreviewHeaders = (rows: ImportRow[]) => {
    const headerSet = new Set<string>();
    rows.forEach((row) => {
        Object.keys(row).forEach((key) => {
            if (key) headerSet.add(key);
        });
    });
    return Array.from(headerSet);
};

export default function LeadsPage() {
    const [items, setItems] = useState<LeadItem[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [cityFilter, setCityFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sourceFilter, setSourceFilter] = useState("ALL");
    const [tagFilter, setTagFilter] = useState("");
    const [scoreFilter, setScoreFilter] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkTag, setBulkTag] = useState("");
    const [importing, setImporting] = useState(false);
    const [importPreviewOpen, setImportPreviewOpen] = useState(false);
    const [pendingImportRows, setPendingImportRows] = useState<ImportRow[]>([]);
    const [pendingImportHeaders, setPendingImportHeaders] = useState<string[]>([]);
    const [pendingImportFileName, setPendingImportFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    // const [mapsImportOpen, setMapsImportOpen] = useState(false);

    const [activeLead, setActiveLead] = useState<LeadItem | null>(null);
    const [form, setForm] = useState<LeadForm>(emptyForm);
    const [noteText, setNoteText] = useState("");
    const [contactType, setContactType] = useState("CALL");
    const [contactNotes, setContactNotes] = useState("");
    const [contactStatus, setContactStatus] = useState("KEEP");
    const [mapsQuery, setMapsQuery] = useState("");
    const [mapsCity, setMapsCity] = useState("");
    const [mapsCategory, setMapsCategory] = useState("");
    const [mapsImporting, setMapsImporting] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadLeads = async (targetPage = page) => {
        setLoading(true);
        try {
            const response = await api.get(API.EasyFollowUp.LEADS, {
                params: {
                    page: targetPage,
                    pageSize: PAGE_SIZE,
                    search: query || undefined,
                    status: statusFilter !== "ALL" ? statusFilter : undefined,
                    city: cityFilter || undefined,
                    category: categoryFilter || undefined,
                },
            });
            const payload = response.data?.data;
            setItems(payload?.items ?? []);
            setTotal(payload?.total ?? 0);
            setTotalPages(Math.max(1, payload?.totalPages ?? 1));
            setPage(payload?.page ?? targetPage);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to load leads.");
        } finally {
            setLoading(false);
        }
    };
    const closeImportPreview = () => {
        if (importing) return;
        setImportPreviewOpen(false);
        setPendingImportRows([]);
        setPendingImportHeaders([]);
        setPendingImportFileName("");
    };

    const confirmImportPreview = async () => {
        if (!pendingImportRows.length) {
            toast.error("No rows available to import.");
            return;
        }

        await importRows(pendingImportRows);
        closeImportPreview();
    };

    const updatePendingImportCell = (rowIndex: number, header: string, value: string) => {
        setPendingImportRows((prev) =>
            prev.map((row, index) => (index === rowIndex ? { ...row, [header]: value } : row))
        );
    };

    const removePendingImportRow = (rowIndex: number) => {
        setPendingImportRows((prev) => prev.filter((_, index) => index !== rowIndex));
    };

    useEffect(() => {
        setPage(1);
    }, [query, statusFilter, cityFilter, categoryFilter]);

    useEffect(() => {
        loadLeads();
    }, [page, query, statusFilter, cityFilter, categoryFilter]);

    const filteredItems = useMemo(() => {
        const minScore = scoreFilter ? Number(scoreFilter) : undefined;
        return items.filter((lead) => {
            if (sourceFilter !== "ALL" && lead.source !== sourceFilter) return false;
            if (tagFilter && !(lead.tags ?? []).some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
            if (minScore !== undefined && (lead.rating ?? 0) < minScore) return false;
            return true;
        });
    }, [items, sourceFilter, tagFilter, scoreFilter]);

    const selectedLeads = useMemo(
        () => filteredItems.filter((lead) => selectedIds.includes(lead.id)),
        [filteredItems, selectedIds]
    );

    const allVisibleSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (allVisibleSelected) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(filteredItems.map((lead) => lead.id));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setCreateOpen(true);
    };

    const openEdit = (lead: LeadItem) => {
        setActiveLead(lead);
        setForm({
            name: lead.name,
            primaryPhone: lead.primaryPhone ?? "",
            email: lead.email ?? "",
            city: lead.city ?? "",
            category: lead.category ?? "",
            source: lead.source ?? "MANUAL",
            googleMapsLink: lead.googleMapsLink ?? "",
            rating: lead.rating?.toString() ?? "",
            notes: lead.notes ?? "",
            tags: (lead.tags ?? []).join(", "),
        });
        setEditOpen(true);
    };

    const openView = (lead: LeadItem) => {
        setActiveLead(lead);
        setViewOpen(true);
    };

    const openNote = (lead: LeadItem) => {
        setActiveLead(lead);
        setNoteText("");
        setNoteOpen(true);
    };

    const openContact = (lead: LeadItem) => {
        setActiveLead(lead);
        setContactType("CALL");
        setContactNotes("");
        setContactStatus("KEEP");
        setContactOpen(true);
    };

    const submitLead = async (mode: "create" | "edit") => {
        if (!form.name.trim() || !form.primaryPhone.trim() || !form.city.trim() || !form.category.trim() || !form.source.trim()) {
            toast.error("Name, phone, city, category, and source are required.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            primaryPhone: form.primaryPhone.trim(),
            email: form.email.trim() || undefined,
            city: form.city.trim(),
            category: form.category.trim(),
            source: form.source,
            googleMapsLink: form.googleMapsLink.trim() || undefined,
            rating: form.rating ? Number(form.rating) : undefined,
            notes: form.notes.trim() || undefined,
            tags: form.tags
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        };

        setSaving(true);
        try {
            if (mode === "create") {
                await api.post(API.EasyFollowUp.LEADS, payload);
                toast.success("Lead added.");
                setCreateOpen(false);
            } else if (activeLead) {
                await api.put(API.EasyFollowUp.LEAD_BY_ID(activeLead.id), payload);
                toast.success("Lead updated.");
                setEditOpen(false);
            }
            await loadLeads();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to save lead.");
        } finally {
            setSaving(false);
        }
    };

    const submitNote = async () => {
        if (!activeLead || !noteText.trim()) {
            toast.error("Note cannot be empty.");
            return;
        }

        const timestamp = new Date().toLocaleString();
        const nextNotes = activeLead.notes ? `${activeLead.notes}\n[${timestamp}] ${noteText.trim()}` : `[${timestamp}] ${noteText.trim()}`;

        setSaving(true);
        try {
            await api.put(API.EasyFollowUp.LEAD_BY_ID(activeLead.id), { notes: nextNotes });
            toast.success("Note added.");
            setNoteOpen(false);
            await loadLeads();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to add note.");
        } finally {
            setSaving(false);
        }
    };

    const submitContactLog = async () => {
        if (!activeLead || !contactType) return;

        setSaving(true);
        try {
            await api.post(API.INTERNAL.CONTACT_LOGS.ROOT, {
                leadId: activeLead.id,
                type: contactType,
                notes: contactNotes.trim() || undefined,
            });

            if (contactStatus !== "KEEP") {
                await api.put(API.EasyFollowUp.LEAD_BY_ID(activeLead.id), { status: contactStatus });
            }

            toast.success("Contact log saved.");
            setContactOpen(false);
            await loadLeads();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to save contact log.");
        } finally {
            setSaving(false);
        }
    };

    const removeLead = async (lead: LeadItem) => {
        const confirmed = window.confirm(`Delete ${lead.name}? This action cannot be undone.`);
        if (!confirmed) return;

        setSaving(true);
        try {
            await api.delete(API.EasyFollowUp.LEAD_BY_ID(lead.id));
            toast.success("Lead deleted.");
            await loadLeads();
            setSelectedIds((prev) => prev.filter((id) => id !== lead.id));
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to delete lead.");
        } finally {
            setSaving(false);
        }
    };

    const applyBulkTag = async () => {
        if (!bulkTag.trim() || !selectedLeads.length) {
            toast.error("Select leads and enter a tag.");
            return;
        }

        setSaving(true);
        try {
            await Promise.all(
                selectedLeads.map((lead) => {
                    const tags = Array.from(new Set([...(lead.tags ?? []), bulkTag.trim()]));
                    return api.put(API.EasyFollowUp.LEAD_BY_ID(lead.id), { tags });
                })
            );
            toast.success("Tag applied to selected leads.");
            setBulkTag("");
            await loadLeads();
        } catch {
            toast.error("Failed to apply tag.");
        } finally {
            setSaving(false);
        }
    };

    const exportCsv = () => {
        const rows = selectedLeads.length ? selectedLeads : filteredItems;
        if (!rows.length) {
            toast.error("No leads to export.");
            return;
        }

        const header = ["Name", "Phone", "City", "Category", "Source", "Google Maps Link", "Score", "Status", "Created"];
        const csvRows = rows.map((lead) => [
            lead.name,
            lead.primaryPhone ?? "",
            lead.city ?? "",
            lead.category ?? "",
            lead.source ?? "",
            lead.googleMapsLink ?? "",
            lead.rating?.toString() ?? "",
            lead.status,
            new Date(lead.createdAt).toLocaleDateString(),
        ]);

        const csv = [header, ...csvRows]
            .map((cols) => cols.map((col) => `"${String(col).replaceAll('"', '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `leads-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const bulkDelete = async () => {
        if (!selectedLeads.length) {
            toast.error("Select leads to delete.");
            return;
        }

        const confirmed = window.confirm(`Delete ${selectedLeads.length} selected leads?`);
        if (!confirmed) return;

        setSaving(true);
        try {
            await Promise.all(selectedLeads.map((lead) => api.delete(API.EasyFollowUp.LEAD_BY_ID(lead.id))));
            toast.success("Selected leads deleted.");
            setSelectedIds([]);
            await loadLeads();
        } catch {
            toast.error("Failed to delete selected leads.");
        } finally {
            setSaving(false);
        }
    };

    const importRows = async (rows: ImportRow[]) => {
        const normalizedRows = rows
            .map((row) => {
                const name = getImportField(row, ["name", "fullName", "leadName"]);
                if (!name) return null;

                const sourceCandidate = getImportField(row, ["source"]).toUpperCase();
                const source = leadSourceSet.has(sourceCandidate) ? sourceCandidate : "IMPORT";
                const ratingValue = Number(getImportField(row, ["rating", "score"]));
                const tagsRaw = getImportField(row, ["tags", "tag"]);
                const statusRaw = getImportField(row, ["status"]).toUpperCase();

                return {
                    name,
                    primaryPhone: getImportField(row, ["primaryPhone", "phone", "mobile", "phoneNumber"]) || undefined,
                    email: getImportField(row, ["email"]) || undefined,
                    city: getImportField(row, ["city"]) || undefined,
                    category: getImportField(row, ["category", "segment"]) || undefined,
                    source,
                    googleMapsLink: getImportField(row, ["googleMapsLink", "googleMapLink", "mapsLink", "mapUrl"]) || undefined,
                    rating: Number.isFinite(ratingValue) && ratingValue >= 0 && ratingValue <= 5 ? ratingValue : undefined,
                    notes: getImportField(row, ["notes", "remark", "message"]) || undefined,
                    tags: tagsRaw ? parseTags(tagsRaw) : undefined,
                    status: leadStatusSet.has(statusRaw) ? statusRaw : undefined,
                };
            })
            .filter((item): item is NonNullable<typeof item> => Boolean(item));

        if (!normalizedRows.length) {
            toast.error("No valid rows found. Ensure each row contains a name field.");
            return;
        }

        setImporting(true);
        try {
            const response = await api.post(API.EasyFollowUp.LEADS, normalizedRows);
            const importedCount = Number(response?.data?.data?.imported ?? 0);
            const failedCount = Number(response?.data?.data?.failed ?? 0);
            const firstError = response?.data?.data?.errors?.[0]?.message as string | undefined;

            if (!importedCount) {
                toast.error(firstError ?? "Import failed. Please verify file content and try again.");
                return;
            }

            toast.success(`Imported ${importedCount} lead${importedCount === 1 ? "" : "s"}${failedCount ? `, ${failedCount} failed` : ""}.`);
            await loadLeads();
        } finally {
            setImporting(false);
        }
    };

    const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const extension = file.name.split(".").pop()?.toLowerCase();
        const mimeType = file.type.toLowerCase();
        const isJson = extension === "json" || mimeType === "application/json";
        const isCsv = extension === "csv" || supportedCsvMimeTypes.has(mimeType);
        const isExcel = extension === "xlsx" || extension === "xls" || supportedExcelMimeTypes.has(mimeType);

        try {
            let rows: ImportRow[] = [];

            if (isJson) {
                const text = await file.text();
                const parsed = JSON.parse(text) as unknown;
                rows = extractRowsFromJson(parsed);
            }

            if (isCsv || isExcel) {
                const [{ read, utils }, buffer] = await Promise.all([
                    import("xlsx"),
                    file.arrayBuffer(),
                ]);
                const workbook = read(buffer, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[firstSheetName];
                rows = utils.sheet_to_json<ImportRow>(sheet, { defval: "" });

                if (extension === "csv") {
                    const previewHeaderCount = Object.keys(rows[0] ?? {}).length;
                    const hasWideRows = rows.some((row) => Object.keys(row).length > previewHeaderCount + 2);
                    if (hasWideRows) {
                        toast.warning("CSV may contain unquoted commas. Some rows can shift columns; review and edit before import.");
                    }
                }
            }

            toast.error("Unsupported file. Use CSV, XLSX/XLS, or JSON.");

            if (!isJson && !isCsv && !isExcel) {
                toast.error("Unsupported file. Use CSV, XLSX/XLS, or JSON.");
                return;
            }

            if (!rows.length) {
                toast.error("No data rows found in selected file.");
                return;
            }

            setPendingImportRows(rows);
            setPendingImportHeaders(getPreviewHeaders(rows));
            setPendingImportFileName(file.name);
            setImportPreviewOpen(true);
        } catch {
            toast.error("Failed to parse import file.");
        }
    };

    const openMapsImport = () => {
        setMapsQuery("");
        setMapsCity("");
        setMapsCategory("");
        // setMapsImportOpen(true);
    };

    const submitMapsImport = async () => {
        if (!mapsQuery.trim() || mapsQuery.trim().length < 2) {
            toast.error("Query must be at least 2 characters.");
            return;
        }

        setMapsImporting(true);
        try {
            const response = await api.post(API.EasyFollowUp.MAPS_IMPORT, {
                query: mapsQuery.trim(),
                city: mapsCity.trim() || undefined,
                category: mapsCategory.trim() || undefined,
            });
            const message = response?.data?.data?.message as string | undefined;
            toast.success(message ?? "Google Maps import queued.");
            // setMapsImportOpen(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to queue Google Maps import.");
        } finally {
            setMapsImporting(false);
        }
    };

    return (
        <main className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Leads</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage manual and automated lead capture in one explorer.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.json,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                        {importing ? "Importing..." : "Import Leads"}
                    </Button>

                    <Button onClick={openCreate}>+ Add Lead</Button>
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, phone, email" />
                <Input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="Filter city" />
                <Input value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} placeholder="Filter category" />
                <Input value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} placeholder="Filter tag" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((item) => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                    <SelectContent>
                        {sourceOptions.map((item) => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} placeholder="Min score (0-5)" type="number" min={0} max={5} step={0.1} />
                <Button variant="outline" onClick={() => {
                    setQuery("");
                    setStatusFilter("ALL");
                    setCityFilter("");
                    setCategoryFilter("");
                    setSourceFilter("ALL");
                    setTagFilter("");
                    setScoreFilter("");
                }}>Reset Filters</Button>
            </div>

            <details className="mt-4 rounded border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Supported import table columns (CSV/XLSX/JSON)</summary>
                <p className="mt-2 text-xs text-muted-foreground">
                    Required fields: file import requires <strong>name</strong>. Google Maps import requires <strong>query</strong>.
                </p>
                <div className="mt-3 overflow-x-auto rounded border">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-3 py-2 font-medium">Field</th>
                                <th className="px-3 py-2 font-medium">Required</th>
                                <th className="px-3 py-2 font-medium">Accepted Column Names</th>
                                <th className="px-3 py-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supportedImportColumns.map((column) => (
                                <tr key={column.field} className="border-b last:border-b-0">
                                    <td className="px-3 py-2">{column.field}</td>
                                    <td className="px-3 py-2">{column.required}</td>
                                    <td className="px-3 py-2">{column.aliases}</td>
                                    <td className="px-3 py-2">{column.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>

            <details className="mt-3 rounded border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Simple data examples for import</summary>
                <p className="mt-2 text-xs text-muted-foreground">
                    Minimum required in file import: <strong>name</strong>. Optional columns can be included as needed.
                </p>
                <p className="mt-3 text-xs font-medium">CSV example</p>
                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-5">{sampleCsvImportData}</pre>
                <p className="mt-3 text-xs font-medium">JSON example</p>
                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-5">{sampleJsonImportData}</pre>
                <p className="mt-3 text-xs font-medium">Google Maps import (required)</p>
                <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-5">{"{\"query\": \"coaching institutes\", \"city\": \"Pune\", \"category\": \"Education\"}"}</pre>
            </details>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">Page items: {filteredItems.length}</Badge>
                <Badge variant="outline">Total leads: {total}</Badge>
                <Badge variant="outline">Page: {page} / {totalPages}</Badge>
                <Badge variant="outline">Selected: {selectedIds.length}</Badge>
            </div>

            {selectedIds.length > 0 && (
                <div className="mt-4 rounded border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input value={bulkTag} onChange={(e) => setBulkTag(e.target.value)} placeholder="Tag to add" className="max-w-xs" />
                        <Button variant="outline" onClick={applyBulkTag} disabled={saving}>Add tag</Button>
                        <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
                        <Button variant="destructive" onClick={bulkDelete} disabled={saving}>Delete</Button>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading leads...</p>
            ) : !filteredItems.length ? (
                <p className="mt-6 text-sm text-muted-foreground">No leads found.</p>
            ) : (
                        <div className="mt-6 overflow-x-auto rounded border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
                                </th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">City</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium">Maps</th>
                                <th className="px-4 py-3 font-medium">Score</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((lead) => (
                                <tr key={lead.id} className="border-b last:border-b-0">
                                    <td className="px-4 py-3">
                                        <Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={() => toggleSelection(lead.id)} />
                                    </td>
                                    <td className="px-4 py-3">{lead.name}</td>
                                    <td className="px-4 py-3">{lead.primaryPhone ?? "-"}</td>
                                    <td className="px-4 py-3">{lead.city ?? "-"}</td>
                                    <td className="px-4 py-3">{lead.category ?? "-"}</td>
                                    <td className="px-4 py-3">{lead.source ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        {lead.googleMapsLink ? (
                                            <a
                                                href={lead.googleMapsLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline"
                                            >
                                                Open
                                            </a>
                                        ) : "-"}
                                    </td>
                                    <td className="px-4 py-3">{lead.rating ?? "-"}</td>
                                    <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" aria-label="Open actions">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openView(lead)}>View details</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEdit(lead)}>Edit lead</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openNote(lead)}>Add note</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openContact(lead)}>Log contact</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => removeLead(lead)} disabled={saving} className="text-destructive focus:text-destructive">
                                                    Delete lead
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Showing up to {PAGE_SIZE} entries per page.</p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={loading || page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm">Page {page} of {totalPages}</span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={loading || page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="w-full">
                    <DialogHeader>
                        <DialogTitle>Add Lead</DialogTitle>
                        <DialogDescription>Manual lead entry with required qualification fields.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 w-full">
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        <Label>Phone</Label>
                        <Input value={form.primaryPhone} onChange={(e) => setForm((prev) => ({ ...prev, primaryPhone: e.target.value }))} />
                        <Label>Email</Label>
                        <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                        <Label>City</Label>
                        <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
                        <Label>Category</Label>
                        <Input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
                        <Label>Source</Label>
                        <Select value={form.source} onValueChange={(value) => setForm((prev) => ({ ...prev, source: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                            <SelectContent>
                                {sourceOptions.filter((item) => item !== "ALL").map((item) => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label>Google Maps Link</Label>
                        <Input value={form.googleMapsLink} onChange={(e) => setForm((prev) => ({ ...prev, googleMapsLink: e.target.value }))} placeholder="https://maps.google.com/..." />
                        <Label>Score</Label>
                        <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} />
                        <Label>Tags (comma separated)</Label>
                        <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} />
                        <Label>Notes</Label>
                        <Textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => submitLead("create")} disabled={saving}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                        <DialogDescription>Update lead profile and qualification details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                        <Label>Phone</Label>
                        <Input value={form.primaryPhone} onChange={(e) => setForm((prev) => ({ ...prev, primaryPhone: e.target.value }))} />
                        <Label>Email</Label>
                        <Input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                        <Label>City</Label>
                        <Input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
                        <Label>Category</Label>
                        <Input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
                        <Label>Source</Label>
                        <Select value={form.source} onValueChange={(value) => setForm((prev) => ({ ...prev, source: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                            <SelectContent>
                                {sourceOptions.filter((item) => item !== "ALL").map((item) => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label>Google Maps Link</Label>
                        <Input value={form.googleMapsLink} onChange={(e) => setForm((prev) => ({ ...prev, googleMapsLink: e.target.value }))} placeholder="https://maps.google.com/..." />
                        <Label>Score</Label>
                        <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} />
                        <Label>Tags (comma separated)</Label>
                        <Input value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} />
                        <Label>Notes</Label>
                        <Textarea rows={3} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={() => submitLead("edit")} disabled={saving}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lead Details</DialogTitle>
                        <DialogDescription>Review lead profile and qualification context.</DialogDescription>
                    </DialogHeader>
                    {activeLead && (
                        <div className="grid gap-2 text-sm">
                            <p><strong>Name:</strong> {activeLead.name}</p>
                            <p><strong>Phone:</strong> {activeLead.primaryPhone ?? "-"}</p>
                            <p><strong>Email:</strong> {activeLead.email ?? "-"}</p>
                            <p><strong>Status:</strong> {activeLead.status}</p>
                            <p><strong>City:</strong> {activeLead.city ?? "-"}</p>
                            <p><strong>Category:</strong> {activeLead.category ?? "-"}</p>
                            <p><strong>Source:</strong> {activeLead.source ?? "-"}</p>
                            <p>
                                <strong>Google Maps:</strong>{" "}
                                {activeLead.googleMapsLink ? (
                                    <a href={activeLead.googleMapsLink} target="_blank" rel="noreferrer" className="text-primary underline">
                                        {activeLead.googleMapsLink}
                                    </a>
                                ) : "-"}
                            </p>
                            <p><strong>Score:</strong> {activeLead.rating ?? "-"}</p>
                            <p><strong>Tags:</strong> {(activeLead.tags ?? []).join(", ") || "-"}</p>
                            <p><strong>Notes:</strong> {activeLead.notes ?? "-"}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>Append a note to this lead timeline.</DialogDescription>
                    </DialogHeader>
                    <Textarea rows={5} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write note..." />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
                        <Button onClick={submitNote} disabled={saving}>Save note</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Contact</DialogTitle>
                        <DialogDescription>Track contact activity for this lead.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <Label>Contact type</Label>
                        <Select value={contactType} onValueChange={setContactType}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                {contactTypes.map((item) => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label>Optional status update</Label>
                        <Select value={contactStatus} onValueChange={setContactStatus}>
                            <SelectTrigger><SelectValue placeholder="Keep existing" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="KEEP">Keep existing</SelectItem>
                                {statusOptions.filter((item) => item !== "ALL").map((item) => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Label>Notes</Label>
                        <Textarea rows={4} value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} placeholder="Call outcome, next step, objections..." />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContactOpen(false)}>Cancel</Button>
                        <Button onClick={submitContactLog} disabled={saving}>Save contact</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>



            <Dialog open={importPreviewOpen} onOpenChange={closeImportPreview}>
                <DialogContent className="!max-w-none w-[80vw] h-[92vh] p-4 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Confirm Import</DialogTitle>
                        <DialogDescription>
                            Review spreadsheet preview from <strong>{pendingImportFileName || "selected file"}</strong>. Click Confirm to start import.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded border">
                        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2 text-xs">
                            <Badge variant="outline">Rows detected: {pendingImportRows.length}</Badge>
                            <Badge variant="outline">Columns shown: {pendingImportHeaders.length}</Badge>
                        </div>
                        <div className="h-[calc(95vh-160px)] overflow-auto">
                            <table className="min-w-max text-left text-xs">
                                <thead className="sticky top-0 border-b bg-background">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-background px-3 py-2 font-medium">#</th>
                                        <th className="sticky left-[48px] z-10 bg-background px-3 py-2 font-medium">Row action</th>
                                        {pendingImportHeaders.map((header) => (
                                            <th key={header} className="px-3 py-2 font-medium">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingImportRows.map((row, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="sticky left-0 bg-background px-3 py-2 align-top text-muted-foreground">{index + 1}</td>
                                            <td className="sticky left-[48px] bg-background px-3 py-2 align-top">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => removePendingImportRow(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </td>
                                            {pendingImportHeaders.map((header) => (
                                                <td key={`${index}-${header}`} className="px-3 py-2 align-top">
                                                    <Input
                                                        value={String(row[header] ?? "")}
                                                        onChange={(event) => updatePendingImportCell(index, header, event.target.value)}
                                                        className="h-8 w-[140px] min-w-[140px]"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Full parsed list is shown. Scroll horizontally to view all columns, and edit/remove rows before confirming import.
                    </p>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeImportPreview} disabled={importing}>Cancel</Button>
                        <Button onClick={confirmImportPreview} disabled={importing}>
                            {importing ? "Importing..." : "Confirm and Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
