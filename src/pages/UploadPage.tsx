/*
WHAT THIS FILE DOES:
Renders the upload screen — application entry point.

WHY IT EXISTS:
Thin page shell. Composes the UploadForm feature component
into a page layout. All logic lives in features/.

HOW IT WORKS:
Renders a header section and the UploadForm.
UploadForm handles everything from file selection to navigation.
*/

import { UploadForm } from "../features/reconciliation/components/upload/UploadForm";

export function UploadPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-emerald-400">
            reconciliation engine
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Transaction Reconciliation
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Upload two CSV transaction exports. The engine will stream both files,
          cross-reference every transaction, and surface all discrepancies.
        </p>
      </div>

      {/* ── Upload form ───────────────────────────────────────────────────── */}
      <UploadForm />
    </div>
  );
}
