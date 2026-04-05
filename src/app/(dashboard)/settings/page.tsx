"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { Stack } from "@/components/ui/layout-primitives";
import PermissionsCenter from "@/components/pwa/PermissionsCenter";
import { useNotifications } from "@/hooks/useNotifications";
import { permissionsManager } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

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
    const [persistentGranted, setPersistentGranted] = useState(false);
    const notifications = useNotifications({ autoInitMessaging: true });

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

    useEffect(() => {
        permissionsManager.hasPersistentStorage().then((granted) => setPersistentGranted(granted));
    }, []);

    const requestPersistentStorage = async () => {
        const granted = await permissionsManager.requestPersistentStorage();
        setPersistentGranted(granted);
        toast(granted ? "Persistent storage enabled" : "Persistent storage permission not granted");
        return granted;
    };

    const saveSettings = () => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        toast.success("Settings saved");
    };

    return (
        <Container className="py-4 md:py-6 lg:py-8">
            <Stack>
                <PageHeader
                    title="Settings"
                    description="Manage appearance and lead-workflow preferences."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Choose your workspace theme.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-md space-y-2">
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
                        <CardTitle>Notifications & Sync</CardTitle>
                        <CardDescription>Control local alerts, push token setup, and realtime status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">Enable notifications</p>
                                <p className="text-xs text-muted-foreground">Allow local + push notifications for lead updates.</p>
                            </div>
                            <Switch
                                checked={notifications.enabled}
                                onCheckedChange={async (checked) => {
                                    if (checked && notifications.permission !== "granted") {
                                        const next = await notifications.requestPermission();
                                        if (next !== "granted") {
                                            toast.error("Notification permission is required to enable alerts.");
                                            notifications.setEnabled(false);
                                            return;
                                        }
                                    }
                                    notifications.setEnabled(checked);
                                    if (checked) {
                                        await notifications.sendTestNotification();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={notifications.isActive ? "default" : "secondary"}>
                                Notifications {notifications.isActive ? "enabled" : "disabled"}
                            </Badge>
                            <Badge variant={persistentGranted ? "default" : "secondary"}>
                                Storage {persistentGranted ? "persistent" : "ephemeral"}
                            </Badge>
                            <Badge variant={notifications.fcmToken ? "default" : "secondary"}>
                                Push token {notifications.fcmToken ? "registered" : "not registered"}
                            </Badge>
                        </div>

                        <PermissionsCenter
                            notificationPermission={notifications.permission}
                            onRequestNotifications={notifications.requestPermission}
                            onRequestPersistentStorage={requestPersistentStorage}
                            hasPersistentStorage={persistentGranted}
                        />
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
            </Stack>
        </Container>
    );
}
