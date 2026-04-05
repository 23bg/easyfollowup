"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { permissionsManager } from "@/lib/permissions";
import type { PermissionStatusValue } from "@/lib/permissions";

type PermissionsCenterProps = {
    notificationPermission: PermissionStatusValue;
    onRequestNotifications: () => Promise<PermissionStatusValue>;
    onRequestPersistentStorage: () => Promise<boolean>;
    hasPersistentStorage: boolean;
};

export default function PermissionsCenter({
    notificationPermission,
    onRequestNotifications,
    onRequestPersistentStorage,
    hasPersistentStorage,
}: PermissionsCenterProps) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [fullscreenSupported] = useState(() => permissionsManager.isFullscreenEnabled());

    const statusTone = useMemo(() => {
        if (notificationPermission === "granted") return "default" as const;
        return "secondary" as const;
    }, [notificationPermission]);

    const requestNotifications = async () => {
        setBusy(true);
        await onRequestNotifications();
        setBusy(false);
    };

    const requestPersistent = async () => {
        setBusy(true);
        await onRequestPersistentStorage();
        setBusy(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Open Permission Center</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Permission Center</DialogTitle>
                    <DialogDescription>
                        Request only the capabilities you need. No automatic permission prompts on page load.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span>Notifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={statusTone}>{notificationPermission}</Badge>
                            <Button size="sm" variant="secondary" disabled={busy} onClick={requestNotifications}>
                                Request
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Persistent storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={hasPersistentStorage ? "default" : "secondary"}>
                                {hasPersistentStorage ? "granted" : "not granted"}
                            </Badge>
                            <Button size="sm" variant="secondary" disabled={busy} onClick={requestPersistent}>
                                Request
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            <span>Fullscreen support</span>
                        </div>
                        <Badge variant={fullscreenSupported ? "default" : "secondary"}>
                            {fullscreenSupported ? "available" : "unavailable"}
                        </Badge>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
