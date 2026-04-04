"use client";

import { useEffect } from "react";
import storage from "@/lib/storage";
import { toast } from "sonner";

export default function PersistentStorageRequester() {
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const granted = await storage.requestPersistentStorage();
        if (!mounted) return;
        console.log('persistent storage granted:', granted);
        if (granted) toast.success('Persistent storage enabled');
        else toast('Persistent storage not granted');
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false };
  }, []);

  return null;
}
