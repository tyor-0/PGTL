/*
WHAT THIS FILE DOES:
A button that exports the currently loaded rows to a CSV file on click.

WHY IT EXISTS:
Export is a one-liner UI concern — keep it out of DiscrepancyTable.
The button is disabled when there are no rows so the user can never
trigger an empty export.

HOW IT WORKS:
Receives the current rows array and a suggested filename.
Calls exportToCsv() from utils on click.
Shows a brief "Exported!" feedback state for 1.5 seconds.
*/

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { exportToCsv } from "../../utils/exportCsv";
import { AnyRow, } from "../../types";
import { cn } from "../../../../lib/utils";

interface ExportButtonProps {
  rows: AnyRow[];
  filename?: string;
  disabled?: boolean;
}

export function ExportButton({
  rows,
  filename = "reconciliation-export",
  disabled = false,
}: ExportButtonProps) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    if (rows.length === 0 || disabled) return;
    exportToCsv(rows, filename);
    setExported(true);
    setTimeout(() => setExported(false), 1500);
  };

  const isEmpty = rows.length === 0 || disabled;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isEmpty}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5",
        "font-mono text-xs transition-all duration-150",
        isEmpty
          ? "cursor-not-allowed border-zinc-800 text-zinc-700"
          : exported
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 active:scale-95"
      )}
    >
      {exported ? (
        <>
          <Check size={12} />
          Exported
        </>
      ) : (
        <>
          <Download size={12} />
          Export CSV
        </>
      )}
    </button>
  );
}