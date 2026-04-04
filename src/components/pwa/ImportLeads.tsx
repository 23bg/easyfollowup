"use client";

import React from "react";
import useFileImport from "@/hooks/useFileImport";
import storage from "@/lib/storage";
import { toast } from "sonner";

export default function ImportLeads() {
  const { preview, rows, loading, error, openPicker, save } = useFileImport();

  const handleImportClick = async () => {
    await openPicker({ multiple: true });
  };

  const handleSave = async () => {
    if (!rows || rows.length === 0) return toast.error('No leads to save');
    await save(async (lead) => {
      try {
        await storage.addLead(lead);
      } catch (e) {
        console.error('Failed to save lead', e);
      }
    });
    toast.success('Leads saved locally');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={handleImportClick} className="px-4 py-2 rounded bg-primary text-primary-foreground">Import leads</button>
        <button onClick={handleSave} className="px-4 py-2 rounded border">Save to local DB</button>
      </div>

      {loading && <div>Parsing files…</div>}
      {error && <div className="text-red-500">{error}</div>}

      {preview && preview.length > 0 && (
        <div className="overflow-auto max-h-60 border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
