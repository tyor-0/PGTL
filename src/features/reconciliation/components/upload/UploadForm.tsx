/*
WHAT THIS FILE DOES:
Composes both DropZones, manages file state and Web Worker previews, validates inputs, and fires the upload mutation on submit.

WHY IT EXISTS:
This is the only component that knows about both files simultaneously.
It coordinates the relationship between sourceA and sourceB — ensuring both are present before the submit button is enabled, and clearing both if the user wants to start over.

HOW IT WORKS:
Local state holds UploadedFileState for each file slot.
When a file is dropped, a Web Worker is spawned to generate the preview.
The worker posts back a CsvPreviewResult which updates the local state.
On submit, the zod schema validates both files before calling useUpload.
useUpload fires the mutation and navigates to /processing/:jobId on success.

Worker lifecycle: a new worker is created per file drop and terminated after it posts its result. Workers are never reused across files.
*/

import { useState, useCallback } from "react";
import { DropZone } from "./DropZone";
import { FileCard } from "./FileCard";
import { useUpload } from "../../hooks/useUpload";
import { uploadSchema } from "../../schemas/uploadSchema";
import type { UploadedFileState, CsvPreviewResult } from "../../types";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../../../../lib/utils";

// ── Empty file slot ─────────────────────────────────────────────────────────
const emptySlot = (): UploadedFileState & { file: null } => ({
  file: null,
  preview: null,
  previewLoading: false,
  previewError: null,
});

type FileSlot =
  | { file: null; preview: null; previewLoading: false; previewError: null }
  | UploadedFileState;

export function UploadForm() {
  const [slotA, setSlotA] = useState<FileSlot>(emptySlot());
  const [slotB, setSlotB] = useState<FileSlot>(emptySlot());
  const [validationErrors, setValidationErrors] = useState<{
    sourceA?: string;
    sourceB?: string;
  }>({});

  const { submit, isPending, error: uploadError, reset } = useUpload();

  // ── Spawn a worker to generate preview for a file ─────────────────────────
  const runPreviewWorker = useCallback(
    (file: File, setSlot: React.Dispatch<React.SetStateAction<FileSlot>>) => {
      // Mark as loading immediately
      setSlot({ file, preview: null, previewLoading: true, previewError: null });

      const worker = new Worker(
        new URL("../../workers/csvPreview.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.postMessage({ file });

      worker.onmessage = (
        event: MessageEvent<
          | { type: "success"; payload: CsvPreviewResult }
          | { type: "error"; message: string }
        >
      ) => {
        const msg = event.data;

        if (msg.type === "success") {
          setSlot({
            file,
            preview: msg.payload,
            previewLoading: false,
            previewError: null,
          });
        } else {
          setSlot({
            file,
            preview: null,
            previewLoading: false,
            previewError: msg.message,
          });
        }

        // Terminate worker — it's done, no reason to keep it alive
        worker.terminate();
      };

      worker.onerror = (err) => {
        setSlot({
          file,
          preview: null,
          previewLoading: false,
          previewError: err.message ?? "Worker failed.",
        });
        worker.terminate();
      };
    },
    []
  );

  // ── File select handlers ───────────────────────────────────────────────────
  const handleSelectA = useCallback(
    (file: File) => {
      setValidationErrors((e) => ({ ...e, sourceA: undefined }));
      runPreviewWorker(file, setSlotA);
    },
    [runPreviewWorker]
  );

  const handleSelectB = useCallback(
    (file: File) => {
      setValidationErrors((e) => ({ ...e, sourceB: undefined }));
      runPreviewWorker(file, setSlotB);
    },
    [runPreviewWorker]
  );

  const handleRemoveA = useCallback(() => {
    setSlotA(emptySlot());
    setValidationErrors((e) => ({ ...e, sourceA: undefined }));
    reset();
  }, [reset]);

  const handleRemoveB = useCallback(() => {
    setSlotB(emptySlot());
    setValidationErrors((e) => ({ ...e, sourceB: undefined }));
    reset();
  }, [reset]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // Validate with zod before touching the network
    const result = uploadSchema.safeParse({
      sourceA: slotA.file,
      sourceB: slotB.file,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setValidationErrors({
        sourceA: fieldErrors.sourceA?.[0],
        sourceB: fieldErrors.sourceB?.[0],
      });
      return;
    }

    setValidationErrors({});
    submit(result.data.sourceA, result.data.sourceB);
  }, [slotA.file, slotB.file, submit]);

  const bothReady = !!slotA.file && !!slotB.file;
  const canSubmit = bothReady && !isPending;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Dropzone row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <DropZone
            label="System A"
            sublabel="sourceA"
            file={slotA.file}
            onFileSelect={handleSelectA}
            onFileRemove={handleRemoveA}
            error={validationErrors.sourceA}
            disabled={isPending}
          />
          {slotA.file && (
            <FileCard fileState={slotA as UploadedFileState} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <DropZone
            label="System B"
            sublabel="sourceB"
            file={slotB.file}
            onFileSelect={handleSelectB}
            onFileRemove={handleRemoveB}
            error={validationErrors.sourceB}
            disabled={isPending}
          />
          {slotB.file && (
            <FileCard fileState={slotB as UploadedFileState} />
          )}
        </div>
      </div>

      {/* ── Upload error from backend ──────────────────────────────────────── */}
      {uploadError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-400" />
          <div>
            <p className="text-sm font-medium text-rose-300">Upload failed</p>
            <p className="mt-0.5 text-xs text-rose-400/80">{uploadError}</p>
          </div>
        </div>
      )}

      {/* ── Submit row ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-600">
          {!slotA.file && !slotB.file && "Upload both CSV files to begin."}
          {slotA.file && !slotB.file && "Now add System B to continue."}
          {!slotA.file && slotB.file && "Now add System A to continue."}
          {bothReady && !isPending && "Ready — click Run Reconciliation."}
          {isPending && "Uploading files to server…"}
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5",
            "text-sm font-medium transition-all duration-150",
            canSubmit
              ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-95"
              : "cursor-not-allowed bg-zinc-800 text-zinc-600"
          )}
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              Run Reconciliation
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}