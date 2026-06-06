/*
WHAT THIS FILE DOES:
Renders the tabbed interface for all 8 discrepancy categories.
Manages active tab, page number, and coordinates useResults fetches.

WHY IT EXISTS:
This is the component that enforces the lazy loading rule.
Only the active tab triggers a fetch. Switching tabs changes the
React Query key which fires a new request — previous tab data is
cached and served instantly if the user returns to it.

HOW IT WORKS:
Local state tracks activeTab (DiscrepancyType) and page (number).
When activeTab changes, page resets to 1 — avoids requesting page 5
of a category that only has 2 pages.

useResults is called once with the current (activeTab, page) pair.
It returns rows, summary, pagination, isFetching.

The summary is passed up to the parent (ResultsDashboard) via the
onSummaryLoaded callback so SummaryCards can render from the first
successful fetch regardless of which tab loaded it.

Tab pills show the count from the last loaded summary so the user
can see at a glance which categories have issues before clicking.
*/

import { useState, useEffect } from "react";
import { useResults } from "../../hooks/useResults";
import { DiscrepancyTable } from "./DiscrepancyTable";
import { ExportButton } from "./ExportButton";
import {
  DiscrepancyType,
  ReconciliationSummary,
} from "../../types";
import { formatNumber } from "../../utils/formatters";
import { cn } from "../../../../lib/utils";

interface TabConfig {
  type: DiscrepancyType;
  label: string;
  countKey: keyof ReconciliationSummary;
}

const TABS: TabConfig[] = [
  { type: "missingInA",          label: "Missing in A",   countKey: "missingInA"          },
  { type: "missingInB",          label: "Missing in B",   countKey: "missingInB"          },
  { type: "amountMismatches",    label: "Amount",         countKey: "amountMismatches"    },
  { type: "statusMismatches",    label: "Status",         countKey: "statusMismatches"    },
  { type: "currencyMismatches",  label: "Currency",       countKey: "currencyMismatches"  },
  { type: "timestampMismatches", label: "Timestamp",      countKey: "timestampMismatches" },
  { type: "duplicateTransactions",label:"Duplicates",     countKey: "duplicateTransactions"},
  { type: "malformedRows",       label: "Malformed",      countKey: "malformedRows"       },
];

interface DiscrepancyTabsProps {
  jobId: string;
  onSummaryLoaded: (summary: ReconciliationSummary) => void;
}

export function DiscrepancyTabs({ jobId, onSummaryLoaded }: DiscrepancyTabsProps) {
  const [activeTab, setActiveTab] = useState<DiscrepancyType>("missingInA");
  const [page, setPage]           = useState(1);
  const [cachedSummary, setCachedSummary] = useState<ReconciliationSummary | null>(null);

  const { rows, summary, pagination, isLoading, isFetching, error } = useResults({
    jobId,
    type: activeTab,
    page,
  });

  // ── Bubble summary up to ResultsDashboard on first successful load ─────────
  useEffect(() => {
    if (summary) {
      setCachedSummary(summary);
      onSummaryLoaded(summary);
    }
  }, [summary, onSummaryLoaded]);

  // ── Reset to page 1 when switching tabs ───────────────────────────────────
  const handleTabChange = (type: DiscrepancyType) => {
    if (type === activeTab) return;
    setActiveTab(type);
    setPage(1);
  };

  const summaryToUse = summary ?? cachedSummary;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Tab strip ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = summaryToUse?.[tab.countKey] ?? 0;
          const isActive = tab.type === activeTab;
          const hasIssues = count > 0;

          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTabChange(tab.type)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2",
                "text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              {tab.label}
              {/* Count pill */}
              {summaryToUse && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-xs tabular-nums",
                    isActive && hasIssues
                      ? "bg-rose-500/20 text-rose-300"
                      : isActive
                      ? "bg-zinc-700 text-zinc-400"
                      : hasIssues
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-zinc-800 text-zinc-600"
                  )}
                >
                  {formatNumber(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-200">
            {TABS.find((t) => t.type === activeTab)?.label}
          </p>
          {pagination && (
            <p className="mt-0.5 font-mono text-xs text-zinc-600">
              {formatNumber(pagination.total)} records ·{" "}
              {pagination.totalPages} pages
            </p>
          )}
        </div>

        <ExportButton
          rows={rows}
          filename={`${activeTab}-page-${page}`}
          disabled={rows.length === 0}
        />
      </div>

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3">
          <p className="text-xs text-rose-400">{error}</p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {!error && (
        <DiscrepancyTable
          rows={rows}
          pagination={pagination}
          isFetching={isLoading || isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}