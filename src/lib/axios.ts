/*
WHAT THIS FILE DOES:
Creates and exports a configured axios instance used by every API call
in the application.

WHY IT EXISTS:
Centralises base URL, headers, and error handling in one place.
If the API base URL changes or auth headers are added later, this is the only file that needs to change.

HOW IT WORKS:
Reads VITE_API_BASE_URL from the environment at startup.
Attaches a response interceptor that normalises errors into a consistent shape so hooks never have to handle raw axios errors.
*/

import axios, { AxiosError, AxiosResponse } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";
//property env does nto exist on type importmeta
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000, // 30s — upload requests for large files may take time
  headers: {
    Accept: "application/json",
  },
});

// ─── Response interceptor ──────────────────────────────────────────────────────
// Unwraps the outer { success, data } envelope so callers get data directly.
// On error, throws a plain Error with a human-readable message.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const serverMessage =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(serverMessage));
  }
);