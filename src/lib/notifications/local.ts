"use client";

type LocalNotificationPayload = {
    title: string;
    body?: string;
    tag?: string;
    url?: string;
    icon?: string;
    badge?: string;
    vibrate?: number[];
    dedupeKey?: string;
    dedupeMs?: number;
    silent?: boolean;
};

const dedupeCache = new Map<string, number>();
const queue: LocalNotificationPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const defaultIcon = "/icons/icon-192.png";
const defaultBadge = "/icons/icon-192.png";

const isNotificationSupported = () => typeof window !== "undefined" && "Notification" in window;

const canNotify = () => isNotificationSupported() && Notification.permission === "granted";

const getDedupeKey = (payload: LocalNotificationPayload) =>
    payload.dedupeKey ?? payload.tag ?? `${payload.title}:${payload.body ?? ""}`;

const shouldSkipByDedupe = (payload: LocalNotificationPayload): boolean => {
    const key = getDedupeKey(payload);
    const dedupeMs = payload.dedupeMs ?? 15_000;
    const now = Date.now();
    const previous = dedupeCache.get(key) ?? 0;

    if (now - previous < dedupeMs) return true;

    dedupeCache.set(key, now);
    return false;
};

export const showLocalNotification = async (payload: LocalNotificationPayload): Promise<boolean> => {
    if (!canNotify()) return false;
    if (shouldSkipByDedupe(payload)) return false;

    const options: NotificationOptions = {
        body: payload.body,
        tag: payload.tag,
        icon: payload.icon ?? defaultIcon,
        badge: payload.badge ?? defaultBadge,
        silent: payload.silent,
        data: {
            url: payload.url,
        },
    };

    if (payload.vibrate) {
        (options as NotificationOptions & { vibrate?: number[] }).vibrate = payload.vibrate;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration?.showNotification) {
            await registration.showNotification(payload.title, options);
            return true;
        }
    } catch {
        // Fallback to Notification constructor below.
    }

    try {
        const notification = new Notification(payload.title, options);
        notification.onclick = () => {
            if (payload.url) window.location.assign(payload.url);
            window.focus();
            notification.close();
        };
        return true;
    } catch {
        return false;
    }
};

export const notifyLeadCreated = (lead: { id: string; name: string; status?: string }) =>
    showLocalNotification({
        title: "New lead added",
        body: `${lead.name}${lead.status ? ` • ${lead.status}` : ""}`,
        tag: `lead-${lead.id}`,
        url: `/lead/${lead.id}`,
        dedupeKey: `lead-created-${lead.id}`,
        vibrate: [100, 40, 100],
    });

export const notifyLeadStatusChanged = (lead: {
    id: string;
    name: string;
    fromStatus?: string;
    toStatus?: string;
}) =>
    showLocalNotification({
        title: "Lead status updated",
        body: `${lead.name}: ${lead.fromStatus ?? "unknown"} -> ${lead.toStatus ?? "updated"}`,
        tag: `lead-${lead.id}`,
        url: `/lead/${lead.id}`,
        dedupeKey: `lead-status-${lead.id}-${lead.toStatus ?? "unknown"}`,
        vibrate: [80, 30, 80],
    });

export const enqueueNotificationBatch = (payload: LocalNotificationPayload) => {
    queue.push(payload);
    if (flushTimer) return;

    flushTimer = setTimeout(async () => {
        const batch = queue.splice(0, queue.length);
        flushTimer = null;

        if (!batch.length) return;
        if (batch.length === 1) {
            await showLocalNotification(batch[0]);
            return;
        }

        const newest = batch[batch.length - 1];
        await showLocalNotification({
            title: `${batch.length} updates received`,
            body: newest.body ?? newest.title,
            tag: "lead-updates-batch",
            url: newest.url ?? "/leads",
            dedupeKey: `batch-${Math.floor(Date.now() / 60000)}`,
            silent: true,
        });
    }, 2500);
};
