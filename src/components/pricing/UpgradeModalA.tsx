"use client";

import React from "react";

type Props = { open: boolean; onClose: () => void };

export default function UpgradeModalA({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-lg font-bold">Upgrade to Pro</h3>
        <p className="mt-2">Price-first message: Pro at <strong>₹499/month</strong> or <strong>₹4,999/year</strong>. Designed for small teams — 50k leads, 5 users.</p>
        <ul className="mt-4 list-disc ml-5 text-sm">
          <li>Higher lead limits</li>
          <li>Unlimited follow-up templates</li>
          <li>Team roles & activity log</li>
        </ul>
        <div className="mt-6 flex gap-2 justify-end">
          <a href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded">Start Pro Trial</a>
          <button onClick={onClose} className="border px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
