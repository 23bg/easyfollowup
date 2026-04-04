"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type TeamRole = "OWNER" | "MANAGER" | "COUNSELOR" | "TEACHER" | "VIEWER";

export type TeamFormState = {
    name: string;
    phone: string;
    email: string;
    role: TeamRole;
    active: boolean;
    subjects: string;
    experience: string;
    bio: string;
};

type TeamFormProps = {
    form: TeamFormState;
    onChange: (value: TeamFormState) => void;
};

export default function TeamForm({ form, onChange }: TeamFormProps) {
    return (
        <div className="space-y-3 py-2">
            <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} placeholder="Full name" />
            </div>

            <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(value) => onChange({ ...form, role: value as TeamRole })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="MANAGER">Editor</SelectItem>
                        <SelectItem value="COUNSELOR">Counselor</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {form.role === "TEACHER" ? (
                <>
                    <div className="space-y-2">
                        <Label>Subjects</Label>
                        <Input value={form.subjects} onChange={(event) => onChange({ ...form, subjects: event.target.value })} placeholder="Physics, Chemistry" />
                    </div>
                    <div className="space-y-2">
                        <Label>Experience</Label>
                        <Input value={form.experience} onChange={(event) => onChange({ ...form, experience: event.target.value })} placeholder="e.g. 6 years" />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea value={form.bio} onChange={(event) => onChange({ ...form, bio: event.target.value })} rows={3} placeholder="Short teacher bio" />
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} placeholder="email@domain.com" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} placeholder="Optional" />
                    </div>
                </>
            )}
        </div>
    );
}
