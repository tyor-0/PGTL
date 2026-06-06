/*
WHAT THIS FILE DOES:
The main processing screen component. Orchestrates the polling hook,
routes between loading / processing / failed states, and renders
ProgressBar, StatusBadge, and FailedCard appropriately.

WHY IT EXISTS:
ProcessingPage is a thin shell that just passes jobId here.
All the state branching and composition lives in this component
so the page file stays clean and this component stays testable
in isolation with a mock jobId.

HOW IT WORKS:
useJobPolling drives everything. Three states to handle:

1. isLoading (first fetch not yet returned):
   Shows a skeleton — prevents layout shift when data arrives.

2. job.status === "failed":
   Shows FailedCard with the error from job.error.

3. job.status === "pending" | "processing":
   Shows the full progress UI — StatusBadge, ProgressBar, animated
   steps, and the elapsed time counter.

The hook handles navigation to /results/:jobId automatically when
status becomes "completed" — this component never sees that state.

Elapsed time is calculated from job.createdAt using a local 1-second
interval. It's a UI-only concern so it lives in local state here,
not in the hook.
*/

import { useEffect, useState } from "react";
import { useJobPolling } from "../../hooks/useJobPolling";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { FailedCard } from "./FailedCard";
import { FileSearch, ShieldCheck, GitCompare, Layers } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface ProcessingViewProps {
  jobId: string;
}

// ── Processing steps shown below the progress bar ────────────────────────────
// These give the user a sense of what is happening inside the black box.
// They activate progressively based on the current progress percentage.
const STEPS = [
  { icon: FileSearch,  label: "Streaming CSV files",        threshold: 0  },
  { icon: Layers,      label: "Building transaction index", threshold: 25 },
  { icon: GitCompare,  label: "Cross-referencing records",  threshold: 50 },
  { icon: ShieldCheck, label: "Compiling discrepancy report", threshold: 80 },
];

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function ProcessingView({ jobId }: ProcessingViewProps) {
  const { job, isLoading, error } = useJobPolling(jobId);
  const [elapsed, setElapsed] = useState(0);

  // ── Elapsed timer — ticks every second while job is active ───────────────
  useEffect(() => {
    if (!job?.createdAt) return;

    const start = new Date(job.createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    // Stop ticking when job reaches a terminal state
    if (job.status === "completed" || job.status === "failed") {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [job?.createdAt, job?.status]);

  // ── Network/polling error (not the same as job failure) ──────────────────
  if (error && !job) {
    return (
      <div className="mx-auto max-w-xl pt-16 text-center">
        <p className="text-sm text-rose-400">
          Could not reach the server. Check your connection and refresh.
        </p>
        <p className="mt-2 font-mono text-xs text-zinc-700">{error}</p>
      </div>
    );
  }

  // ── Initial skeleton — first poll hasn't returned yet ────────────────────
  if (isLoading || !job) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10">
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-4 w-24 rounded bg-zinc-800" />
            <div className="h-10 w-16 rounded bg-zinc-800" />
            <div className="h-2 w-full rounded-full bg-zinc-800" />
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 w-48 rounded bg-zinc-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Failed state ──────────────────────────────────────────────────────────
  if (job.status === "failed") {
    return (
      <div className="mx-auto max-w-2xl pt-4">
        <FailedCard error={job.error} jobId={jobId} />
      </div>
    );
  }

  // ── Active processing state (pending | processing) ────────────────────────
  const activeStepIndex = [...STEPS]
    .reverse()
    .findIndex((s) => job.progress >= s.threshold);
  const currentStepIndex =
    activeStepIndex === -1 ? 0 : STEPS.length - 1 - activeStepIndex;

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10">

        {/* ── Header row ──────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
              Reconciliation Job
            </p>
            <p className="font-mono text-xs text-zinc-700 break-all">
              {jobId}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <ProgressBar
          progress={job.progress}
          rowsProcessed={job.rowsProcessed}
          className="mb-10"
        />

        {/* ── Steps ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = job.progress > step.threshold && i < currentStepIndex;
            const isActive = i === currentStepIndex;
            const isPending = i > currentStepIndex;

            return (
              <div
                key={step.label}
                className={cn(
                  "flex items-center gap-3 transition-opacity duration-300",
                  isPending && "opacity-30"
                )}
              >
                {/* Step icon */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    "transition-colors duration-300",
                    isDone && "bg-emerald-500/20 text-emerald-400",
                    isActive && "bg-zinc-700 text-zinc-200",
                    isPending && "bg-zinc-800 text-zinc-600"
                  )}
                >
                  <Icon size={13} />
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isDone && "text-zinc-500 line-through decoration-zinc-700",
                    isActive && "font-medium text-zinc-100",
                    isPending && "text-zinc-600"
                  )}
                >
                  {step.label}
                </span>

                {/* Active pulse */}
                {isActive && (
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-xs text-zinc-600">
                    <span className="inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                    running
                  </span>
                )}

                {isDone && (
                  <span className="ml-auto font-mono text-xs text-zinc-700">
                    done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-5">
          <p className="font-mono text-xs text-zinc-700">
            elapsed{" "}
            <span className="text-zinc-500">{formatElapsed(elapsed)}</span>
          </p>
          <p className="font-mono text-xs text-zinc-700">
            polling every 2s
          </p>
        </div>
      </div>

      {/* ── Below card hint ───────────────────────────────────────────────── */}
      <p className="mt-4 text-center text-xs text-zinc-700">
        You will be redirected automatically when the job completes.
      </p>
    </div>
  );
}