"use client";

type NetworkState = {
  isOnline: boolean;
  failureCount: number;
  lastCheckedAt: number | null;
};

type Listener = (state: NetworkState) => void;

class NetworkManager {
  private state: NetworkState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    failureCount: 0,
    lastCheckedAt: null,
  };

  private listeners: Set<Listener> = new Set();
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window === "undefined") return;

    // Listen to native online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private handleOnline() {
    this.state.isOnline = true;
    this.state.failureCount = 0;
    this.state.lastCheckedAt = Date.now();
    this.notifyListeners();
  }

  private handleOffline() {
    this.state.isOnline = false;
    this.state.lastCheckedAt = Date.now();
    this.notifyListeners();
  }

  // Report successful API call
  reportApiSuccess() {
    this.state.failureCount = 0;
    this.state.isOnline = true;
    this.state.lastCheckedAt = Date.now();
    this.notifyListeners();
  }

  // Report failed API call
  reportApiFailure() {
    this.state.failureCount += 1;

    // Mark offline only after 3+ consecutive failures
    if (this.state.failureCount >= 3) {
      this.state.isOnline = false;
    }

    this.state.lastCheckedAt = Date.now();
    this.notifyListeners();
  }

  // Soft validation: ping backend
  async validateConnectivity() {
    if (typeof window === "undefined") return false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch("/api/ping", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.status === 204 || res.ok) {
        this.reportApiSuccess();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Start periodic health check (only when offline)
  startHealthCheck() {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(async () => {
      if (this.state.isOnline) {
        // Stop checking if we think we're online
        if (this.healthCheckInterval) {
          clearInterval(this.healthCheckInterval);
          this.healthCheckInterval = null;
        }
        return;
      }

      // Try to recover online state
      await this.validateConnectivity();
    }, 20000); // Check every 20 seconds when offline
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getState(): NetworkState {
    return { ...this.state };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    // Start health checks if offline
    if (!this.state.isOnline) {
      this.startHealthCheck();
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopHealthCheck();
      }
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));

    // Auto-start health checks if offline
    if (!state.isOnline && this.listeners.size > 0) {
      this.startHealthCheck();
    } else if (state.isOnline) {
      this.stopHealthCheck();
    }
  }
}

// Singleton instance
let instance: NetworkManager | null = null;

export function getNetworkManager(): NetworkManager {
  if (typeof window === "undefined") {
    // Return a dummy on server
    return {
        getState: () => ({ isOnline: true, failureCount: 0, lastCheckedAt: null }),
        reportApiSuccess: () => { },
        reportApiFailure: () => { },
        validateConnectivity: async () => true,
        startHealthCheck: () => { },
        stopHealthCheck: () => { },
        subscribe: () => () => { },
    } as unknown as NetworkManager;
  }

  if (!instance) {
    instance = new NetworkManager();
  }

  return instance;
}

export function reportApiSuccess() {
  getNetworkManager().reportApiSuccess();
}

export function reportApiFailure() {
  getNetworkManager().reportApiFailure();
}
