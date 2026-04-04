"use client";

import React from "react";

type Props = { open: boolean; onClose: () => void };

export default function UpgradeModalB({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-lg font-bold">Upgrade to Pro</h3>
        <p className="mt-2">Benefit-first message: Get unlimited templates, team workflows and priority support so you never miss another follow-up.</p>
        <ul className="mt-4 list-disc ml-5 text-sm">
          <li>Unlimited follow-up templates</li>
          <li>Priority support and team roles</li>
          <li>Automated reminders and activity logs</li>
        </ul>
        <div className="mt-6 flex gap-2 justify-end">
          <a href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded">Start Pro Trial</a>
          <button onClick={onClose} className="border px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
