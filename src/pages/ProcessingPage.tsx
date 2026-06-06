/*
WHAT THIS FILE DOES:
Renders the processing screen shown while reconciliation is running.

WHY IT EXISTS:
Thin page shell. Pulls jobId from the URL, guards against missing
jobId, and hands off to ProcessingView which owns all logic.

HOW IT WORKS:
useParams extracts jobId from /processing/:jobId.
Missing jobId → redirect to "/" so user can upload again.
Valid jobId → ProcessingView handles polling, progress, failed state.
*/

import { useParams, Navigate } from "react-router-dom";
import { ProcessingView } from "../features/reconciliation/components/processing/ProcessingView";

export function ProcessingPage() {
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Running Reconciliation
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Both files are being streamed and compared. This may take a few minutes
          for large datasets.
        </p>
      </div>

      <ProcessingView jobId={jobId} />
    </div>
  );
}