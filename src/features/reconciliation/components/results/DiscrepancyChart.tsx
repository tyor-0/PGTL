/*
WHAT THIS FILE DOES:
Renders a donut chart showing the ratio of matched transactions
to total discrepancies, with a breakdown legend.

WHY IT EXISTS:
Numbers alone don't communicate proportion well. A visual ratio
of "94% matched, 6% discrepant" lands faster than reading 8 numbers.
The chart uses summary data that's already loaded — no extra fetch.

HOW IT WORKS:
Uses recharts PieChart in a donut configuration (innerRadius set).
The center label renders as a custom label component showing the
match rate percentage.
The legend below maps each discrepancy type to its count so the chart
and table tabs tell the same story in different formats.
*/

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReconciliationSummary } from "../../types";
import { formatNumber, formatPercent } from "../../utils/formatters";

interface DiscrepancyChartProps {
  summary: ReconciliationSummary;
}

const CHART_COLORS = {
  matched:    "#10b981", // emerald-500
  missingInA: "#f43f5e", // rose-500
  missingInB: "#fb7185", // rose-400
  amount:     "#f59e0b", // amber-500
  status:     "#fbbf24", // amber-400
  currency:   "#fcd34d", // amber-300
  timestamp:  "#a3e635", // lime-400
  malformed:  "#94a3b8", // slate-400
};

interface LegendItemProps {
  color: string;
  label: string;
  value: number;
  total: number;
}

function LegendItem({ color, label, value, total }: LegendItemProps) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate text-xs text-zinc-400">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-xs text-zinc-300">
          {formatNumber(value)}
        </span>
        <span className="font-mono text-xs text-zinc-600">
          {formatPercent(value, total)}
        </span>
      </div>
    </div>
  );
}

export function DiscrepancyChart({ summary }: DiscrepancyChartProps) {
  const total = summary.totalSourceA;
  const totalDiscrepant =
    summary.missingInA +
    summary.missingInB +
    summary.amountMismatches +
    summary.statusMismatches +
    summary.currencyMismatches +
    summary.timestampMismatches +
    summary.malformedRows;

  const chartData = [
    { name: "Matched",        value: summary.matchedTransactions, color: CHART_COLORS.matched    },
    { name: "Missing in A",   value: summary.missingInA,          color: CHART_COLORS.missingInA },
    { name: "Missing in B",   value: summary.missingInB,          color: CHART_COLORS.missingInB },
    { name: "Amount",         value: summary.amountMismatches,    color: CHART_COLORS.amount     },
    { name: "Status",         value: summary.statusMismatches,    color: CHART_COLORS.status     },
    { name: "Currency",       value: summary.currencyMismatches,  color: CHART_COLORS.currency   },
    { name: "Timestamp",      value: summary.timestampMismatches, color: CHART_COLORS.timestamp  },
    { name: "Malformed",      value: summary.malformedRows,       color: CHART_COLORS.malformed  },
  ].filter((d) => d.value > 0);

  const matchRate = total > 0 ? Math.round((summary.matchedTransactions / total) * 100) : 0;

  return (
    // Added 'w-full min-w-0 mx-auto' to lock outer container layout constraints securely
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6 w-full min-w-0">
      <p className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
        Match Rate
      </p>

      {/* ── UPDATED CONTAINER BEHAVIOR ─────────────────────────────────────── */}
      {/* Changed to flex-col (vertical stack) on mobile, sm:flex-row (horizontal alignment) on desktop */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 w-full min-w-0">
        
        {/* ── Donut chart (Explicitly centered layout inside the stack) ── */}
        <div className="relative h-40 w-40 shrink-0 mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e4e4e7",
                }}
                formatter={(value: unknown) => [formatNumber(Number(value ?? 0)), ""]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-semibold text-zinc-100">
              {matchRate}%
            </span>
            <span className="text-xs text-zinc-600">matched</span>
          </div>
        </div>

        {/* ── Legend (Updated to safely span full available space on mobile grid) ── */}
        <div className="flex flex-1 flex-col gap-2 w-full min-w-0">
          <LegendItem
            color={CHART_COLORS.matched}
            label="Matched"
            value={summary.matchedTransactions}
            total={total}
          />
          <LegendItem
            color={CHART_COLORS.missingInA}
            label="Missing in A"
            value={summary.missingInA}
            total={total}
          />
          <LegendItem
            color={CHART_COLORS.missingInB}
            label="Missing in B"
            value={summary.missingInB}
            total={total}
          />
          <LegendItem
            color={CHART_COLORS.amount}
            label="Amount mismatches"
            value={summary.amountMismatches}
            total={total}
          />
          <LegendItem
            color={CHART_COLORS.status}
            label="Status mismatches"
            value={summary.statusMismatches}
            total={total}
          />

          {totalDiscrepant === 0 && (
            <p className="text-xs text-emerald-400 text-center sm:text-left">
              ✓ No discrepancies found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}