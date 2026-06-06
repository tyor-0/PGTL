/*
WHAT THIS FILE DOES:
Provides the TanStack QueryClient to the entire React tree.

WHY IT EXISTS:
QueryClientProvider must wrap every component that uses useQuery or
useMutation. Isolating it here keeps AppProviders clean and makes
the QueryClient easy to swap in tests.

HOW IT WORKS:
Imports the configured queryClient from lib/react-query.ts and wraps
children with QueryClientProvider. ReactQueryDevtools is included only
in development builds — Vite's import.meta.env.DEV strips it from prod.
*/

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "../../lib/reactQuery";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}