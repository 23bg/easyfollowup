// Notifications helper: request permission, show notifications (foreground-only), simple debounce
type MaybeString = string | undefined;

const recentNotifications = new Map<string, number>();
const DEFAULT_DEBOUNCE_MS = 10_000; // 10s

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined') return 'denied';
  if (!('Notification' in window)) return 'unsupported';

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    return permission;
  } catch (e) {
    console.error('requestNotificationPermission failed', e);
    return 'denied';
  }
}

export function showNotification(title: string, body?: MaybeString, options?: NotificationOptions & { debounceMs?: number; key?: string }) {
  if (typeof window === 'undefined') return;

  // Only send notifications when app is in the foreground
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

  if (!('Notification' in window)) return;

  const permission = Notification.permission;
  if (permission !== 'granted') return;

  const key = options?.key ?? `${title}::${body ?? ''}`;
  const now = Date.now();
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const last = recentNotifications.get(key) ?? 0;
  if (now - last < debounceMs) return; // debounce duplicate
  recentNotifications.set(key, now);

  try {
    // Show a simple notification
    // Keep payload small; most browsers will display it while window is focused
    const opts: NotificationOptions = { ...options };
    if (body !== undefined) opts.body = body;
    new Notification(title, opts);
  } catch (e) {
    // Don't crash on notification errors
    console.error('showNotification error', e);
  }
}

// Convenience helpers
export function notifyNewLead(lead: { name?: string; email?: string }) {
  const title = 'New Lead Added';
  const body = lead?.name ? `${lead.name}${lead.email ? ' — ' + lead.email : ''}` : lead?.email ?? 'A new lead was added.';
  showNotification(title, body, { key: `new-lead:${lead?.email ?? lead?.name ?? ''}` });
}

export function notifyLeadStatusUpdated(payload: { name?: string; oldStatus?: string; newStatus?: string; id?: string }) {
  const title = 'Lead Status Updated';
  const body = payload.name
    ? `${payload.name}: ${payload.oldStatus ?? 'status'} → ${payload.newStatus ?? ''}`
    : `Status: ${payload.oldStatus} → ${payload.newStatus}`;
  showNotification(title, body, { key: `status-${payload.id ?? payload.name ?? ''}` });
}

// Simple scheduler loop that callers can opt into. Caller provides a function that returns due reminders.
let _reminderTimer: number | null = null;
export function startReminderScheduler(getDueReminders: () => Promise<Array<{ id?: string; title: string; body?: string }>>, intervalMs = 60_000) {
  if (typeof window === 'undefined') return;
  stopReminderScheduler();
  const run = async () => {
    try {
      const due = await getDueReminders();
      for (const r of due) {
        showNotification(r.title, r.body, { key: `reminder:${r.id ?? r.title}` });
      }
    } catch (e) {
      console.error('reminder scheduler error', e);
    }
  };
  // run immediately then interval
  run();
  _reminderTimer = window.setInterval(run, intervalMs);
}

export function stopReminderScheduler() {
  if (_reminderTimer) {
    clearInterval(_reminderTimer);
    _reminderTimer = null;
  }
}

export default {
  requestNotificationPermission,
  showNotification,
  notifyNewLead,
  notifyLeadStatusUpdated,
  startReminderScheduler,
  stopReminderScheduler,
};
