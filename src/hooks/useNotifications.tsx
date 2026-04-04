"use client";

import { useCallback } from "react";
import {
  requestNotificationPermission,
  showNotification as libShowNotification,
  notifyNewLead as libNotifyNewLead,
  notifyLeadStatusUpdated as libNotifyLeadStatusUpdated,
  startReminderScheduler as libStartReminderScheduler,
  stopReminderScheduler as libStopReminderScheduler,
} from "@/lib/notifications";
import { toast } from "sonner";

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    try {
      const p = await requestNotificationPermission();
      if (p === 'unsupported') {
        toast('Notifications not supported in this browser');
      }
      return p;
    } catch (e) {
      console.error(e);
      toast.error('Unable to request notifications');
      return 'denied';
    }
  }, []);

  const showNotification = useCallback((title: string, body?: string) => {
    try {
      // attempt to show native notification first
      libShowNotification(title, body);
    } catch (e) {
      // fallback to toast
      toast(`${title}${body ? ' — ' + body : ''}`);
    }
  }, []);

  const notifyNewLead = useCallback((lead: { name?: string; email?: string }) => {
    try {
      libNotifyNewLead(lead);
    } catch (e) {
      toast(`New lead: ${lead.name ?? lead.email ?? 'Lead added'}`);
    }
  }, []);

  const notifyLeadStatusUpdated = useCallback((payload: { name?: string; oldStatus?: string; newStatus?: string; id?: string }) => {
    try {
      libNotifyLeadStatusUpdated(payload);
    } catch (e) {
      toast(`Lead status changed: ${payload.name ?? payload.id}`);
    }
  }, []);

  const startReminderScheduler = useCallback((getDueReminders: () => Promise<Array<{ id?: string; title: string; body?: string }>>, intervalMs?: number) => {
    libStartReminderScheduler(getDueReminders, intervalMs);
  }, []);

  const stopReminderScheduler = useCallback(() => {
    libStopReminderScheduler();
  }, []);

  return {
    requestPermission,
    showNotification,
    notifyNewLead,
    notifyLeadStatusUpdated,
    startReminderScheduler,
    stopReminderScheduler,
  } as const;
}

export default useNotifications;
