import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { API } from "../constants";
import ROUTES from "../constants/routes";
import { AppError } from "@/lib/utils/error";

const api = axios.create({
  baseURL: API.BASE_V1,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const rawUrl = config.url;
  if (!rawUrl || /^https?:\/\//i.test(rawUrl)) {
    return config;
  }

  // Normalize legacy EasyFollowUp callers that still pass /api/* or /api/v1/* paths.
  const legacyEasyFollowUpPrefixes = [
    "/api/leads",
    "/api/lead-sources",
    "/api/contact-logs",
    "/api/automations",
    "/api/maps-import",
  ];

  const v1EasyFollowUpPrefixes = legacyEasyFollowUpPrefixes.map((prefix) => `/api/v1${prefix}`);

  if (!legacyEasyFollowUpPrefixes.some((prefix) => rawUrl.startsWith(prefix)) && !v1EasyFollowUpPrefixes.some((prefix) => rawUrl.startsWith(prefix))) {
    return config;
  }

  if (rawUrl.startsWith("/api/v1/")) {
    config.url = rawUrl.replace(/^\/api\/v1/, "");
    return config;
  }

  if (rawUrl.startsWith("/api/")) {
    config.url = rawUrl.replace(/^\/api/, "");
  }

  return config;
});

// This queue will hold promises that should be resolved after the token is refreshed.
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = [];
let isRefreshing = false;

// Extends the default request config to include a custom _retry flag
interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    // Intercept 401 Unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using the refresh token cookie
        await api.post(API.AUTH.REFRESH_TOKEN);

        // Process the queue of failed requests
        processQueue(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        const refreshErr = refreshError as AxiosError;
        processQueue(refreshErr);

        // If refresh fails, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = ROUTES.AUTH.LOG_IN;
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export async function handleApiCall<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError(
        error.response?.data?.message || error.message || "Request failed",
        error.response?.status ?? 500,
        "API_REQUEST_FAILED",
        error.response?.data
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new AppError("An unexpected error occurred.", 500, "UNEXPECTED_ERROR", error);
  }
}



