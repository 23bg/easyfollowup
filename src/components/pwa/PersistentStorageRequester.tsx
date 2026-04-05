"use client";

import { useEffect } from "react";

export default function PersistentStorageRequester() {
  useEffect(() => {
    // Intentionally no auto-request. Permissions are requested lazily from settings UX.
  }, []);

  return null;
}
