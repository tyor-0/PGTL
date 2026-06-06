/*WHAT THIS FILE DOES:
Renders a full error state card when the reconciliation job fails,
showing the error message from the server and a button to start over.

WHY IT EXISTS:
The failed state has distinct UI — it's not just a red progress bar.
It needs a clear explanation, an error message, and a recovery action.
Isolating it here keeps ProcessingView clean and this state testable.

HOW IT WORKS:
Receives the error string from the Job object (job.error).
The "Start Over" button navigates to "/" — clearing the URL so
the user returns to a fresh upload screen with no stale jobId.
useNavigate is called here directly since this component owns
the recovery action.
*/

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FailedCardProps {
  error: string | null;
  jobId: string;
}

export function FailedCard({ error, jobId }: FailedCardProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8">
      {/* ── Icon + heading ────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Reconciliation failed
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            The job could not complete. See the error below.
          </p>
        </div>
      </div>

      {/* ── Error message ─────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/15 bg-rose-950/40 px-4 py-3">
          <p className="font-mono text-xs leading-relaxed text-rose-300">
            {error}
          </p>
        </div>
      )}

      {/* ── Job ID for debugging ──────────────────────────────────────────── */}
      <p className="mb-6 font-mono text-xs text-zinc-700">
        job_id: {jobId}
      </p>

      {/* ── Recovery action ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate("/", { replace: true })}
        className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 active:scale-95"
      >
        <RotateCcw size={13} />
        Start Over
      </button>
    </div>
  );
}