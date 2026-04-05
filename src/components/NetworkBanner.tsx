"use client";

import useNetworkStatus from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

export default function NetworkBanner() {
  const online = useNetworkStatus();
  const shownRef = useRef(false);

  // Prevent multiple NetworkBanner instances from showing if component mounted in multiple places.
  const initialAllowed = typeof window !== 'undefined' ? !(window as any).__easyfollowupNetworkBannerMounted : false;
  const [allowedToRender, setAllowedToRender] = useState<boolean>(initialAllowed);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__easyfollowupNetworkBannerMounted) {
      // Some other instance already registered; do not render from this mount.
      setAllowedToRender(false);
      return;
    }

    (window as any).__easyfollowupNetworkBannerMounted = true;
    setAllowedToRender(true);

    return () => {
      // Clear flag when this instance unmounts if it was the registered one
      if ((window as any).__easyfollowupNetworkBannerMounted) {
        delete (window as any).__easyfollowupNetworkBannerMounted;
      }
    };
  }, []);

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;

    if (!allowedToRender) {
      setShowBanner(false);
      return;
    }

    if (!online) {
      // Debounce showing the banner to avoid brief false offline flashes
      t = setTimeout(() => {
        setShowBanner(true);
        if (!shownRef.current) {
          toast('You are offline', { description: 'Some features may be unavailable.' });
          shownRef.current = true;
        }
      }, 800);
    } else {
      // Hide banner immediately and toast once when connectivity returns
      setShowBanner(false);
      if (shownRef.current) {
        toast.success('You are back online');
        shownRef.current = false;
      }
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [online, allowedToRender]);

  if (!allowedToRender) return null;
  if (!showBanner) return null;

  return (
    <div className="w-full border-b border-yellow-500/40 bg-yellow-300 py-2 text-center text-sm font-medium text-yellow-900">
      You are offline. Viewing cached data.
    </div>
  );
}
