/*
WHAT THIS FILE DOES:
Shows a preview card below each DropZone after a file is loaded —
filename, size, large-file warning, and the first 5 rows of CSV data.

WHY IT EXISTS:
Separates preview rendering from the drop interaction.
DropZone handles how you get the file. FileCard handles what you see about it.
The preview data comes from the Web Worker, not from loading the full file,
so this component never causes a performance problem regardless of file size.

HOW IT WORKS:
Receives UploadedFileState — which contains the File plus the worker output.
While the worker is running, shows a skeleton loader.
Once preview is available, renders headers as table columns and rows as data.
If the file is over 50MB, shows a soft amber warning (not an error).
*/

import { AlertTriangle, Loader2 } from "lucide-react";
import type { UploadedFileState } from "../../types/index";
import { isLargeFile, formatFileSize } from "../../schemas/uploadSchema";
import { cn } from "../../../../lib/utils";

interface FileCardProps {
  fileState: UploadedFileState;
}

export function FileCard({ fileState }: FileCardProps) {
  const { file, preview, previewLoading, previewError } = fileState;
  const large = file ? isLargeFile(file) : false;
  
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* ── Card header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-zinc-300 truncate">
            {file?.name}
          </span>
        </div>
        <span className="ml-3 flex-shrink-0 text-xs text-zinc-500">
          {formatFileSize(file?.size ?? 0)}
        </span>
      </div>

      {/* ── Large file warning ───────────────────────────────────────────── */}
      {large && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-2">
          <AlertTriangle size={12} className="flex-shrink-0 text-amber-400" />
          <span className="text-xs text-amber-300">
            Large file — processing may take several minutes.
          </span>
        </div>
      )}

      {/* ── Preview content ──────────────────────────────────────────────── */}
      <div className="px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
          Preview · first 5 rows
        </p>

        {/* Loading state while worker runs */}
        {previewLoading && (
          <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
            <Loader2 size={12} className="animate-spin" />
            Reading file…
          </div>
        )}

        {/* Worker error */}
        {previewError && !previewLoading && (
          <p className="py-2 text-xs text-rose-400">{previewError}</p>
        )}

        {/* Preview table */}
        {preview && !previewLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {preview.headers.map((h) => (
                    <th
                      key={h}
                      className="pb-2 pr-4 text-xs font-medium text-zinc-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-t border-zinc-800/60",
                      i % 2 === 0 ? "bg-transparent" : "bg-zinc-800/20"
                    )}
                  >
                    {preview.headers.map((h) => (
                      <td
                        key={h}
                        className="py-1.5 pr-4 font-mono text-xs text-zinc-400 whitespace-nowrap"
                      >
                        {row[h] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-right text-xs text-zinc-700">
              Showing first {preview.rows.length} rows of{" "}
              {formatFileSize(preview.totalBytesRead)} read
            </p>
          </div>
        )}
      </div>
    </div>
  );
}