/*
WHAT THIS FILE DOES:
Root application component — renders the router.

WHY IT EXISTS:
Vite's default entry point expects an App component.
Keeps main.tsx clean — it mounts App, App renders the router.

HOW IT WORKS:
AppRouter contains all route definitions and the RouterProvider.
AppProviders (QueryClient, etc.) wrap App in main.tsx, so every
route rendered by AppRouter has access to all providers.
*/

import { AppRouter } from "@/routes/index";

export default function App() {
  return <AppRouter />;
}