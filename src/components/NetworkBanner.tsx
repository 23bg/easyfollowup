"use client";

import useNetworkStatus from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export default function NetworkBanner() {
  const online = useNetworkStatus();
  const shownRef = useRef(false);

  useEffect(() => {
    if (online) {
      if (shownRef.current) {
        toast.success('You are back online');
        shownRef.current = false;
      }
    } else {
      toast('You are offline', { description: 'Some features may be unavailable.' });
      shownRef.current = true;
    }
  }, [online]);

  if (online) return null;

  return (
    <div className="w-full bg-yellow-300 text-yellow-900 py-2 text-center">
      You are offline — viewing cached data
    </div>
  );
}
