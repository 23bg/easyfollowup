"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type AppSettings = {
    compactTables: boolean;
    autoRefreshDashboard: boolean;
    leadActivityAlerts: boolean;
};

const SETTINGS_STORAGE_KEY = "EasyFollowUp:settings";

const defaultSettings: AppSettings = {
    compactTables: false,
    autoRefreshDashboard: true,
    leadActivityAlerts: true,
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    useEffect(() => {
        setMounted(true);
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as AppSettings;
            setSettings({ ...defaultSettings, ...parsed });
        } catch {
            setSettings(defaultSettings);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        toast.success("Settings saved");
    };

    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage appearance and lead-workflow preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Choose your workspace theme.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label>Theme</Label>
                        <Select
                            value={mounted ? (theme ?? "system") : "system"}
                            onValueChange={(value) => setTheme(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Workflow Preferences</CardTitle>
                    <CardDescription>Control list density and alert behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Compact tables</p>
                            <p className="text-xs text-muted-foreground">Reduce spacing to fit more rows.</p>
                        </div>
                        <Switch
                            checked={settings.compactTables}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, compactTables: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Auto refresh dashboard</p>
                            <p className="text-xs text-muted-foreground">Refresh lead metrics automatically.</p>
                        </div>
                        <Switch
                            checked={settings.autoRefreshDashboard}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoRefreshDashboard: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Lead activity alerts</p>
                            <p className="text-xs text-muted-foreground">Notify when new leads are captured.</p>
                        </div>
                        <Switch
                            checked={settings.leadActivityAlerts}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, leadActivityAlerts: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={saveSettings}>Save Settings</Button>
            </div>
        </main>
    );
}
