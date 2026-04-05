"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV === 'development') return; // skip in dev
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        if (registration && 'sync' in registration && (registration as any).sync?.register) {
          try {
            await (registration as any).sync.register('easyfollowup-sync-queue');
          } catch {
            // Background sync is best-effort.
          }
        }

        // listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // new update available
                toast('A new version is available — refresh to update', { action: { label: 'Refresh', onClick: () => window.location.reload() } });
              }
            }
          });
        });
      } catch (e) {
        // registration failed
      }
    };

    const onServiceWorkerMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (type === 'NOTIFICATION_CLICK' && event.data?.url) {
        window.location.assign(event.data.url);
      }
    };

    register();
    navigator.serviceWorker.addEventListener('message', onServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', onServiceWorkerMessage);
    };
  }, []);

  return null;
}
