/*
WHAT THIS FILE DOES:
A single drag-and-drop file input zone for one CSV file.

WHY IT EXISTS:
UploadForm renders this component twice — once for sourceA, once for sourceB.
All drag state, rejection handling, and visual feedback is self-contained here
so UploadForm stays clean and both zones behave identically.

HOW IT WORKS:
Uses react-dropzone's useDropzone hook. Accepts only .csv files.
Calls onFileSelect(file) when a valid file is dropped or selected.
Calls onFileRemove() when the user removes the current file.
Visual state: idle → drag-over → file selected.
If react-dropzone rejects the file (wrong type, too many), shows an error.
*/

import { useCallback, useState } from "react";
import { useDropzone, } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import { cn } from "../../../../lib/utils";

interface DropZoneProps {
  label: string;
  sublabel: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string | null;
  disabled?: boolean;
}

export function DropZone({
  label,
  sublabel,
  file,
  onFileSelect,
  onFileRemove,
  error,
  disabled = false,
}: DropZoneProps) {
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setDropError(null);

      if (rejections.length > 0) {
        const reason = rejections[0].errors[0]?.message ?? "Invalid file.";
        setDropError(reason);
        return;
      }

      if (accepted[0]) {
        onFileSelect(accepted[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: disabled || !!file,
    multiple: false,
  });

  const displayError = error ?? dropError;
  const hasFile = !!file;

  return (
    <div className="flex flex-col gap-2">
      {/* ── Zone label ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-zinc-100">{label}</span>
          <span className="ml-2 font-mono text-xs text-zinc-500">{sublabel}</span>
        </div>
        {hasFile && (
          <button
            type="button"
            onClick={onFileRemove}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
          >
            <X size={12} />
            Remove
          </button>
        )}
      </div>

      {/* ── Drop area ────────────────────────────────────────────────────── */}
      {!hasFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3",
            "h-44 rounded-xl border-2 border-dashed cursor-pointer",
            "transition-all duration-200",
            isDragActive
              ? "border-emerald-400 bg-emerald-400/5 scale-[1.01]"
              : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900",
            displayError && "border-rose-500/60 bg-rose-500/5",
            disabled && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          <input {...getInputProps()} />

          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "transition-colors duration-200",
              isDragActive
                ? "bg-emerald-400/15 text-emerald-400"
                : "bg-zinc-800 text-zinc-400"
            )}
          >
            <UploadCloud size={20} />
          </div>

          <div className="text-center">
            {isDragActive ? (
              <p className="text-sm font-medium text-emerald-400">
                Drop to load
              </p>
            ) : (
              <>
                <p className="text-sm text-zinc-300">
                  Drop CSV here or{" "}
                  <span className="text-emerald-400 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  .csv only · max 500MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-3 h-44 rounded-xl border",
            "border-emerald-500/30 bg-emerald-500/5 px-5"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <FileText size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">
              {file.name}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        </div>
      )}

      {/* ── Error message ─────────────────────────────────────────────────── */}
      {displayError && (
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <AlertCircle size={12} className="shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}