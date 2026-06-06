/*
WHAT THIS FILE DOES:
The main results screen component. Holds the summary state, renders
SummaryCards, DiscrepancyChart, and DiscrepancyTabs in the correct layout.

WHY IT EXISTS:
ResultsPage is a thin shell — this component owns the results layout
and the one piece of shared state: the ReconciliationSummary.

HOW IT WORKS:
Summary state starts as null. DiscrepancyTabs fires the first useResults
fetch (for "missingInA" tab by default). When that fetch returns, it calls
onSummaryLoaded() which sets the summary here. SummaryCards and
DiscrepancyChart both receive it and render.

This means SummaryCards and the chart render as soon as the first tab's
data arrives — no separate fetch, no extra loading state.

The "New Reconciliation" button navigates to "/" so the user can run
another job without losing access to this results URL via back button.
*/

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SummaryCards } from "./SummaryCards";
import { DiscrepancyChart } from "./DiscrepancyChart";
import { DiscrepancyTabs } from "./DiscrepancyTabs";
import { ReconciliationSummary } from "../../types";
import { Plus } from "lucide-react";

interface ResultsDashboardProps {
  jobId: string;
}

export function ResultsDashboard({ jobId }: ResultsDashboardProps) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);

  // useCallback so the reference is stable and doesn't re-trigger
  // the useEffect in DiscrepancyTabs on every render
  const handleSummaryLoaded = useCallback((s: ReconciliationSummary) => {
    setSummary(s);
  }, []);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-emerald-400">completed</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Reconciliation Report
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-600 break-all">
            {jobId}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
        >
          <Plus size={14} />
          New Reconciliation
        </button>
      </div>

      {/* ── Summary cards — render once summary is available ──────────────── */}
      {summary ? (
        <SummaryCards summary={summary} />
      ) : (
        // Skeleton while first tab loads
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
            />
          ))}
        </div>
      )}

      {/* ── Chart + Tabs row ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-8">
        {/* Chart only renders once we have summary data */}
        {summary && <DiscrepancyChart summary={summary} />}

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-800" />

        {/* ── Discrepancy tabs — always renders, drives the first data load── */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Discrepancy Details
          </p>
          <DiscrepancyTabs
            jobId={jobId}
            onSummaryLoaded={handleSummaryLoaded}
          />
        </div>
      </div>
    </div>
  );
}