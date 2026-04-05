"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { initMessagingTokenFlow, subscribeForegroundMessages } from "@/lib/firebase/messaging";
import {
    enqueueNotificationBatch,
    showLocalNotification,
} from "@/lib/notifications/local";
import { permissionsManager } from "@/lib/permissions";

type UseNotificationsOptions = {
    autoInitMessaging?: boolean;
};

const SETTINGS_KEY = "easyfollowup.notifications.enabled";

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { autoInitMessaging = true } = options;

    const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
    const [enabled, setEnabled] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
        setEnabled(stored === "true");

        permissionsManager.getNotificationPermission().then((value) => setPermission(value as NotificationPermission | "unsupported"));
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(SETTINGS_KEY, String(enabled));
    }, [enabled]);

    useEffect(() => {
        if (!enabled || permission !== "granted" || !autoInitMessaging) return;

        initMessagingTokenFlow().then((token) => {
            if (token) setFcmToken(token);
        });

        let unsubscribe: (() => void) | null = null;
        subscribeForegroundMessages((payload) => {
            enqueueNotificationBatch({
                title: payload.title ?? "New update",
                body: payload.body,
                tag: payload.data?.tag,
                url: payload.data?.url,
            });
        }).then((cleanup) => {
            unsubscribe = cleanup;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [enabled, permission, autoInitMessaging]);

    const requestPermission = useCallback(async () => {
        const next = await permissionsManager.requestNotificationPermission();
        setPermission(next as NotificationPermission | "unsupported");
        if (next === "granted") setEnabled(true);
        return next;
    }, []);

    const sendTestNotification = useCallback(async () => {
        return showLocalNotification({
            title: "Notifications enabled",
            body: "You will receive lead activity updates in real time.",
            tag: "notifications-test",
            url: "/leads",
        });
    }, []);

    const status = useMemo(
        () => ({
            enabled,
            permission,
            isSupported: permission !== "unsupported",
            isActive: enabled && permission === "granted",
            fcmToken,
        }),
        [enabled, permission, fcmToken]
    );

    return {
        ...status,
        setEnabled,
        requestPermission,
        sendTestNotification,
    };
}

export default useNotifications;
