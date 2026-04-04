"use client";

import { useCallback, useEffect, useState } from "react";
import storage from "@/lib/storage";

export function usePersistentStorage() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const request = useCallback(async () => {
    const r = await storage.requestPersistentStorage();
    setGranted(r);
    return r;
  }, []);

  useEffect(() => {
    // do not auto-request here — expose request; but we can check persisted state
    if (typeof navigator !== 'undefined' && (navigator as any).storage && (navigator as any).storage.persisted) {
      (navigator as any).storage.persisted().then((v: boolean) => setGranted(v));
    }
  }, []);

  return { granted, request } as const;
}

export default usePersistentStorage;
