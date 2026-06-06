/*
WHAT THIS FILE DOES:
Creates and exports the TanStack QueryClient with production-appropriate
defaults for this application's data access patterns.

WHY IT EXISTS:
Different queries in this app have very different staleness needs.
Job status must always be fresh (staleTime: 0).
Completed results never change (staleTime: 5 min).
Setting these defaults here means individual hooks don't have to
re-specify them every time, but can still override when needed.

HOW IT WORKS:
Exports a QueryClient instance that is passed to QueryClientProvider
in AppProviders. The devtools import is conditional on dev mode.
*/

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ── Staleness ──────────────────────────────────────────────────────────
      // 1 minute default. Job status and results override this individually.
      staleTime: 60_000,

      // ── Retries ────────────────────────────────────────────────────────────
      // Retry once on network blip. Polling hooks override this to 1.
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),

      // ── Refetch behaviour ──────────────────────────────────────────────────
      // Don't refetch when user alt-tabs back — results dashboard would
      // scroll back to top if React Query invalidated while user was reading.
      refetchOnWindowFocus: false,

      // ── Error handling ─────────────────────────────────────────────────────
      // Errors propagate to the component via the error state.
      // No global error handler here — each feature handles its own errors.
      throwOnError: false,
    },
    mutations: {
      retry: 0, // Never retry mutations — don't double-submit a file upload
    },
  },
});