"use client";

import { useCallback, useState } from "react";
import fileLib from "@/lib/file";

export function useFileImport() {
  const [preview, setPreview] = useState<Record<string, any>[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(async (opts = { multiple: false }) => {
    setError(null);
    setLoading(true);
    try {
      const files = await fileLib.pickFiles({ multiple: !!opts.multiple });
      if (!files || files.length === 0) {
        setLoading(false);
        return;
      }
      const allRows: Record<string, any>[] = [];
      for (const f of files) {
        if (f.name.toLowerCase().endsWith('.csv')) {
          const parsed = await fileLib.parseCSV(f);
          allRows.push(...parsed);
        } else if (f.name.toLowerCase().endsWith('.xlsx')) {
          // may throw if xlsx not installed
          const parsed = await fileLib.parseXlsx(f);
          allRows.push(...parsed as Record<string, any>[]);
        } else {
          // try CSV parse as fallback
          const parsed = await fileLib.parseCSV(f);
          allRows.push(...parsed);
        }
      }

      const mapped = fileLib.mapToLeadSchema(allRows);
      setRows(mapped);
      setPreview(mapped.slice(0, 20));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (onSave: (lead: Record<string, any>) => Promise<void> | void, chunkSize = 100) => {
    setLoading(true);
    try {
      let idx = 0;
      while (idx < rows.length) {
        const slice = rows.slice(idx, idx + chunkSize);
        for (const r of slice) {
          // allow onSave to be sync or async
          // eslint-disable-next-line no-await-in-loop
          await Promise.resolve(onSave(r));
        }
        idx += chunkSize;
        // yield to event loop to keep UI responsive
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 0));
      }
    } finally {
      setLoading(false);
    }
  }, [rows]);

  return {
    preview,
    rows,
    loading,
    error,
    openPicker,
    save,
    setPreview,
    setRows,
  } as const;
}

export default useFileImport;
