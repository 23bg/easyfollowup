"use client";

import { getToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import { firebaseApp, isFirebaseConfigured } from "@/lib/firebase/client";

let messagingInstance: Messaging | null = null;

const getMessagingInstance = async (): Promise<Messaging | null> => {
    if (!isFirebaseConfigured || !firebaseApp) return null;
    if (!(await isSupported())) return null;

    if (!messagingInstance) {
        const firebaseMessagingModule = await import("firebase/messaging");
        messagingInstance = firebaseMessagingModule.getMessaging(firebaseApp);
    }

    return messagingInstance;
};

export const getFcmToken = async (): Promise<string | null> => {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) return null;

    try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });
        return token || null;
    } catch {
        return null;
    }
};

export const subscribeForegroundMessages = async (
    callback: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<(() => void) | null> => {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    return onMessage(messaging, (payload) => {
        callback({
            title: payload.notification?.title,
            body: payload.notification?.body,
            data: payload.data,
        });
    });
};

export const storeFcmToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch("/api/v1/notifications/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
        return response.ok;
    } catch {
        return false;
    }
};

export const initMessagingTokenFlow = async (): Promise<string | null> => {
    const token = await getFcmToken();
    if (!token) return null;
    await storeFcmToken(token);
    return token;
};
