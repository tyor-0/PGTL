/*WHAT THIS FILE DOES:
Persistent shell around every page — top bar and content area.

WHY IT EXISTS:
React Router nested routing renders Outlet as the active child page.
The top bar lives here so it renders once and never remounts between routes.

HOW IT WORKS:
Parent route element in the router config. All child routes render into <Outlet />.
*/

import { Outlet, NavLink } from "react-router-dom";
import { GitCompare } from "lucide-react";
// import { cn } from "@/lib/utils";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
              <GitCompare size={15} />
            </div>
            <span className="font-mono text-sm font-medium text-emerald-400">
              Transaction Reconciliation
            </span>
          </NavLink>

          <div className="flex items-center gap-1">
            <span className="font-mono text-xs text-zinc-700">v1.0</span>
          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}