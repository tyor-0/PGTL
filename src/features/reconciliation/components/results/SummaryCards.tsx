/*
WHAT THIS FILE DOES:
Renders the top-row metric cards showing counts for each discrepancy
category plus total matched transactions.

WHY IT EXISTS:
Summary data comes back on every results response regardless of which
tab is active. These cards are always visible and never need their own
fetch — they read from whatever summary the active tab already loaded.

HOW IT WORKS:
Accepts a ReconciliationSummary object whose keys match the backend
exactly: totalSourceA, totalSourceB, matchedTransactions.
*/

import { ReconciliationSummary } from "../../types";
import { formatNumber, formatPercent } from "../../utils/formatters";
import { cn } from "../../../../lib/utils";

interface SummaryCardsProps {
  summary: ReconciliationSummary;
}

interface MetricCardProps {
  label: string;
  value: number;
  total?: number;
  accent: "green" | "amber" | "red" | "zinc";
  large?: boolean;
}

function MetricCard({ label, value, total, accent, large }: MetricCardProps) {
  const accentStyles: Record<string, string> = {
    green: "border-l-emerald-500 bg-emerald-500/5",
    amber: "border-l-amber-500 bg-amber-500/5",
    red:   "border-l-rose-500 bg-rose-500/5",
    zinc:  "border-l-zinc-600 bg-zinc-800/40",
  };

  const valueStyles: Record<string, string> = {
    green: "text-emerald-300",
    amber: "text-amber-300",
    red:   "text-rose-300",
    zinc:  "text-zinc-300",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 border-l-2 px-5 py-4",
        accentStyles[accent]
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 tabular-nums font-mono font-semibold",
          large ? "text-3xl" : "text-2xl",
          valueStyles[accent]
        )}
      >
        {formatNumber(value)}
      </p>
      {total !== undefined && total > 0 && (
        <p className="mt-0.5 font-mono text-xs text-zinc-600">
          {formatPercent(value, total)} of total
        </p>
      )}
    </div>
  );
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  // Use totalSourceA as the reference denominator for percentages
  const total = summary.totalSourceA;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Matched"
          value={summary.matchedTransactions}
          total={total}
          accent="green"
          large
        />
        <MetricCard
          label="Missing in A"
          value={summary.missingInA}
          total={total}
          accent={summary.missingInA > 0 ? "red" : "zinc"}
          large
        />
        <MetricCard
          label="Missing in B"
          value={summary.missingInB}
          total={total}
          accent={summary.missingInB > 0 ? "red" : "zinc"}
          large
        />
      </div>

      {/* ── Secondary row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap md:grid md:grid-cols-5">
  {/* Your sub-cards like Amount (20), Status (20) go inside here */}

        <MetricCard
          label="Amount"
          value={summary.amountMismatches}
          accent={summary.amountMismatches > 0 ? "amber" : "zinc"}
        />
        <MetricCard
          label="Status"
          value={summary.statusMismatches}
          accent={summary.statusMismatches > 0 ? "amber" : "zinc"}
        />
        <MetricCard
          label="Currency"
          value={summary.currencyMismatches}
          accent={summary.currencyMismatches > 0 ? "amber" : "zinc"}
        />
        <MetricCard
          label="Timestamp"
          value={summary.timestampMismatches}
          accent={summary.timestampMismatches > 0 ? "amber" : "zinc"}
        />
        <MetricCard
          label="Malformed"
          value={summary.malformedRows}
          accent={summary.malformedRows > 0 ? "amber" : "zinc"}
        />
      </div>
    </div>
  );
}