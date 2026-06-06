/*
WHAT THIS FILE DOES:
Renders an animated progress bar with a numeric percentage label
and a formatted rows-processed counter below it.

WHY IT EXISTS:
Progress bar animation and number formatting are visual concerns that
belong here, not in the parent ProcessingView. This component is
purely presentational — it receives numbers and renders them.

HOW IT WORKS:
The bar fill width is driven by the `progress` prop (0–100).
CSS transition on the width creates the smooth fill animation —
no JS animation library needed for this.
rowsProcessed is formatted with toLocaleString() so 450000 renders
as "450,000" — much more readable in a dashboard context.
*/

import { cn } from "../../../../lib/utils";

interface ProgressBarProps {
  progress: number;       // 0–100
  rowsProcessed: number;
  className?: string;
}

export function ProgressBar({
  progress,
  rowsProcessed,
  className,
}: ProgressBarProps) {
  // Clamp to 0–100 defensively — backend should never send outside this range
  // but we never want the bar to overflow its container
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── Percentage label ──────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <span className="font-mono text-4xl font-semibold tabular-nums text-zinc-100">
          {clamped}
          <span className="ml-0.5 text-2xl text-zinc-500">%</span>
        </span>

        {rowsProcessed > 0 && (
          <span className="mb-1 font-mono text-xs text-zinc-500">
            {rowsProcessed.toLocaleString()} rows processed
          </span>
        )}
      </div>

      {/* ── Track ─────────────────────────────────────────────────────────── */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        {/* Animated fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />

        {/* Shimmer overlay — only visible when actively processing */}
        {clamped > 0 && clamped < 100 && (
          <div
            className="absolute inset-y-0 rounded-full"
            style={{ width: `${clamped}%` }}
          >
            <div className="animate-shimmer absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}