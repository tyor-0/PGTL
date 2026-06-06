/*
WHAT THIS FILE DOES:
Renders a small pill badge showing the current job status with an
appropriate colour and animated indicator for active states.

WHY IT EXISTS:
Status colouring logic lives here once. Every component that needs
to show "PROCESSING" or "FAILED" imports this — no duplicated
className conditionals scattered across the codebase.

HOW IT WORKS:
Accepts a JobStatus string. Maps it to a colour token and label.
"pending" and "processing" get a pulsing dot to signal liveness.
"completed" gets green. "failed" gets red. Static, no side effects.
*/

import { JobStatus } from "../../types";
import { cn } from "../../../../lib/utils";

interface StatusBadgeProps {
  status: JobStatus;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; dot: string; bg: string; text: string; pulse: boolean }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    text: "text-amber-300",
    pulse: true,
  },
  processing: {
    label: "Processing",
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    text: "text-emerald-300",
    pulse: true,
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    text: "text-emerald-300",
    pulse: false,
  },
  failed: {
    label: "Failed",
    dot: "bg-rose-400",
    bg: "bg-rose-400/10 border-rose-400/20",
    text: "text-rose-300",
    pulse: false,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {config.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-1.5 w-1.5 rounded-full",
            config.dot
          )}
        />
      </span>
      {config.label}
    </span>
  );
}