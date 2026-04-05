"use client";

export type PermissionStatusValue =
    | "granted"
    | "denied"
    | "prompt"
    | "default"
    | "unsupported";

const canUsePermissionsApi = () => typeof navigator !== "undefined" && "permissions" in navigator;

const queryPermission = async (name: "clipboard-read" | "clipboard-write"): Promise<PermissionStatusValue> => {
    if (!canUsePermissionsApi()) return "unsupported";

    try {
        const status = await navigator.permissions.query({ name } as unknown as PermissionDescriptor);
        return status.state;
    } catch {
        return "unsupported";
    }
};

export const permissionsManager = {
    async getNotificationPermission(): Promise<PermissionStatusValue> {
        if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
        return Notification.permission;
    },

    async requestNotificationPermission(): Promise<PermissionStatusValue> {
        if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
        try {
            return await Notification.requestPermission();
        } catch {
            return "denied";
        }
    },

    getClipboardReadPermission: () => queryPermission("clipboard-read"),
    getClipboardWritePermission: () => queryPermission("clipboard-write"),

    async requestPersistentStorage(): Promise<boolean> {
        if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
        try {
            return await navigator.storage.persist();
        } catch {
            return false;
        }
    },

    async hasPersistentStorage(): Promise<boolean> {
        if (typeof navigator === "undefined" || !navigator.storage?.persisted) return false;
        try {
            return await navigator.storage.persisted();
        } catch {
            return false;
        }
    },

    isFullscreenEnabled(): boolean {
        if (typeof document === "undefined") return false;
        return Boolean(document.fullscreenEnabled);
    },
};
