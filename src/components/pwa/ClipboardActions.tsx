"use client";

import { useState } from "react";
import clipboard from "@/lib/clipboard";
import { toast } from "sonner";

type Props = {
  lead?: Record<string, any>;
  onPaste?: (lead: Record<string, any>) => void;
};

export default function ClipboardActions({ lead, onPaste }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (!lead) return toast.error('No lead selected');
    const text = JSON.stringify(lead);
    const ok = await clipboard.copyToClipboard(text);
    if (ok) toast.success('Copied lead to clipboard');
    else toast.error('Copy failed');
  };

  const handlePaste = async () => {
    setLoading(true);
    try {
      const txt = await clipboard.readFromClipboard();
      if (!txt) {
        toast.error('Clipboard empty or inaccessible');
        return;
      }
      // Try JSON first
      try {
        const obj = JSON.parse(txt);
        if (onPaste) onPaste(obj);
        toast.success('Parsed JSON from clipboard');
        return;
      } catch (e) {
        // not JSON, try CSV/line parse
      }

      // simple CSV line: name,email,phone
      const parts = txt.split(/[\t,;|]+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const candidate: Record<string, any> = { name: parts[0], email: parts[1], phone: parts[2] ?? '' };
        if (onPaste) onPaste(candidate);
        toast.success('Pasted lead data');
        return;
      }

      toast('Could not parse clipboard contents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy} className="px-3 py-1 rounded border text-sm">Copy</button>
      <button onClick={handlePaste} disabled={loading} className="px-3 py-1 rounded border text-sm">Paste</button>
    </div>
  );
}
