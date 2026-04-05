"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase/client";

type LeadSnapshot = {
    id: string;
    name?: string;
    status?: string;
};

type UseRealtimeLeadsOptions = {
    enabled: boolean;
    collectionPath?: string;
    onLeadCreated?: (lead: LeadSnapshot) => void;
    onLeadStatusChanged?: (lead: LeadSnapshot & { previousStatus?: string }) => void;
};

export function useRealtimeLeads({
    enabled,
    collectionPath = "leads",
    onLeadCreated,
    onLeadStatusChanged,
}: UseRealtimeLeadsOptions) {
    const [syncActive, setSyncActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

    const previousMapRef = useRef<Map<string, { status?: string }>>(new Map());
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!enabled || !isFirebaseConfigured || !firestore) {
            setSyncActive(false);
            return;
        }

        const ref = collection(firestore, collectionPath);

        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                const nextMap = new Map<string, { status?: string }>();

                snapshot.forEach((doc) => {
                    const data = doc.data() as { name?: string; status?: string };
                    nextMap.set(doc.id, { status: data.status });

                    const previous = previousMapRef.current.get(doc.id);
                    if (!initializedRef.current) return;

                    if (!previous) {
                        onLeadCreated?.({ id: doc.id, name: data.name, status: data.status });
                        return;
                    }

                    if (previous.status !== data.status) {
                        onLeadStatusChanged?.({
                            id: doc.id,
                            name: data.name,
                            status: data.status,
                            previousStatus: previous.status,
                        });
                    }
                });

                initializedRef.current = true;
                previousMapRef.current = nextMap;
                setSyncActive(true);
                setLastSyncAt(Date.now());
                setError(null);
            },
            (snapshotError) => {
                setSyncActive(false);
                setError(snapshotError.message || "Realtime sync failed");
            }
        );

        return () => {
            unsubscribe();
            setSyncActive(false);
        };
    }, [enabled, collectionPath, onLeadCreated, onLeadStatusChanged]);

    return {
        syncActive,
        error,
        lastSyncAt,
    };
}

export default useRealtimeLeads;
