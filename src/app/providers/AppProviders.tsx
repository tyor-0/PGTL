/*
WHAT THIS FILE DOES:
Composes all React context providers into a single wrapper component.

WHY IT EXISTS:
main.tsx should be as simple as <AppProviders><App /></AppProviders>.
As new providers are added (toast, theme, auth), they go here — not
scattered across the component tree.

HOW IT WORKS:
Renders providers in the correct nesting order. QueryProvider is
outermost because routing components may need to trigger queries.
*/

import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}