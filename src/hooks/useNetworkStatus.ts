"use client";

import { useEffect, useState } from 'react';
import { getNetworkManager } from '@/lib/network/manager';

export default function useNetworkStatus() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    const manager = getNetworkManager();
    const initialState = manager.getState();
    setOnline(initialState.isOnline);

    // Subscribe to network state changes
    const unsubscribe = manager.subscribe((state) => {
      setOnline(state.isOnline);
    });

    return unsubscribe;
  }, []);

  return online;
}
