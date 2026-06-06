/*
WHAT THIS FILE DOES:
Renders a server-paginated table for one discrepancy type using
TanStack Table with TanStack Virtual for row virtualisation.

WHY IT EXISTS:
Results can be hundreds of thousands of rows per type. Rendering all
of them into the DOM at once causes browser frame drops and eventual
tab crashes. TanStack Virtual renders only the rows visible in the
viewport — typically 12–18 rows — regardless of total dataset size.

HOW IT WORKS:
The backend returns two row shapes depending on the discrepancy type:

1. Flat rows (missingInA, missingInB):
   { transactionId, timestamp, amount, currency, status }

2. Nested rows (amountMismatches, statusMismatches, etc.):
   { sourceA: { transactionId, ... }, sourceB: { transactionId, ... } }

This component detects which shape is present and flattens nested rows
into a side-by-side column structure before passing to TanStack Table.
*/

import { useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pagination, AnyRow, NestedMismatchRow, TransactionRow } from "../../types";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { formatNumber } from "../../utils/formatters";


// ── Detect if the backend returned nested { sourceA, sourceB } rows ───────────
function isNestedRow(row: AnyRow): row is NestedMismatchRow {
  return (
    row !== null &&
    typeof row === "object" &&
    "sourceA" in row &&
    "sourceB" in row
  );
}

function flattenRow(row: AnyRow): Record<string, unknown> {
  if (!isNestedRow(row)) {
    return { ...(row as TransactionRow) } as Record<string, unknown>;
  }

  const result: Record<string, unknown> = {};

  result["transactionId"] = row.sourceA.transactionId;

  const fields: (keyof TransactionRow)[] = ["timestamp", "amount", "currency", "status"];

  fields.forEach((key) => {
    result[`sourceA_${key}`] = row.sourceA[key];
    result[`sourceB_${key}`] = row.sourceB[key];
  });

  return result;
}

// ── Format a column key into a readable header ────────────────────────────────
// "sourceA_amount" → "Source A · Amount"
// "transactionId"  → "Transaction Id"
function formatHeader(key: string): string {
  if (key.startsWith("sourceA_")) {
    const field = key.replace("sourceA_", "");
    return `Source A · ${field.charAt(0).toUpperCase() + field.slice(1)}`;
  }
  if (key.startsWith("sourceB_")) {
    const field = key.replace("sourceB_", "");
    return `Source B · ${field.charAt(0).toUpperCase() + field.slice(1)}`;
  }
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

// ── Detect if a value changed between sourceA and sourceB ─────────────────────
// Used to highlight the differing field in mismatch rows
function getMismatchKey(flatRow: Record<string, unknown>): string | null {
  const fields = ["amount", "status", "currency", "timestamp"];
  for (const field of fields) {
    const a = flatRow[`sourceA_${field}`];
    const b = flatRow[`sourceB_${field}`];
    if (a !== undefined && b !== undefined && String(a) !== String(b)) {
      return field;
    }
  }
  return null;
}

interface DiscrepancyTableProps {
  rows: AnyRow[];           // ← was TransactionRow[]
  pagination: Pagination | null;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 14;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

export function DiscrepancyTable({
  rows,
  pagination,
  isFetching,
  onPageChange,
}: DiscrepancyTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // ── Flatten all rows into a uniform shape ─────────────────────────────────
const flatRows = useMemo(
  () => rows.map(flattenRow),  // ← remove the (rows as BackendRow[]) cast
  [rows]
);

  //conversion of type TransactionRow to type BackendRow may be a mistake because neither type suffeciciently overlaps withthe ther, if this was intentional...

  // ── Detect mismatch field for highlighting ────────────────────────────────
  const mismatchKey = flatRows.length > 0 ? getMismatchKey(flatRows[0]) : null;

  // ── Build columns dynamically from first flattened row ────────────────────
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    if (flatRows.length === 0) return [];

    return Object.keys(flatRows[0]).map((key) => ({
      accessorKey: key,
      header: formatHeader(key),
      cell: (info) => {
        const val = info.getValue();
        if (val === null || val === undefined) return "—";
        return String(val);
      },
      size: key === "transactionId" ? 180 : 140,
    }));
  }, [flatRows]);

  const table = useReactTable({
    data: flatRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const tableRows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalVirtualHeight = virtualizer.getTotalSize();

  // ── Empty state ───────────────────────────────────────────────────────────
  if (rows.length === 0 && !isFetching) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-zinc-800">
        <p className="text-sm text-zinc-600">No records for this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-xl border border-zinc-800">
        {isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[1px]">
            <Loader2 size={18} className="animate-spin text-zinc-400" />
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    // Highlight the mismatched field header
                    const key = header.column.id;
                    const isMismatchCol =
                      mismatchKey !== null &&
                      (key === `sourceA_${mismatchKey}` ||
                        key === `sourceB_${mismatchKey}`);

                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className={cn(
                          "px-4 py-3 text-xs font-medium uppercase tracking-widest whitespace-nowrap",
                          isMismatchCol
                            ? "text-amber-500"
                            : "text-zinc-500"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>

        {/* ── Virtualised body ─────────────────────────────────────────────── */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: `${CONTAINER_HEIGHT}px` }}
        >
          <div style={{ height: `${totalVirtualHeight}px`, position: "relative" }}>
            <table className="w-full min-w-max text-left">
              <tbody>
                {virtualItems.map((virtualRow) => {
                  const row = tableRows[virtualRow.index];
                  const flatRow = flatRows[virtualRow.index];

                  return (
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${ROW_HEIGHT}px`,
                      }}
                      className={cn(
                        "border-b border-zinc-800/60 transition-colors",
                        virtualRow.index % 2 === 0
                          ? "bg-zinc-900/20"
                          : "bg-zinc-900/50",
                        "hover:bg-zinc-800/60"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const key = cell.column.id;
                        const isMismatchCol =
                          mismatchKey !== null &&
                          (key === `sourceA_${mismatchKey}` ||
                            key === `sourceB_${mismatchKey}`);

                        // Check if this specific cell's value differs from its counterpart
                        const isChanged =
                          isMismatchCol &&
                          flatRow[`sourceA_${mismatchKey}`] !==
                            flatRow[`sourceB_${mismatchKey}`];

                        return (
                          <td
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                            className={cn(
                              "overflow-hidden text-ellipsis whitespace-nowrap px-4 font-mono text-xs",
                              isChanged
                                ? "text-amber-300"
                                : "text-zinc-300"
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-zinc-600">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {formatNumber(pagination.total)} total records
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isFetching}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors duration-100",
                pagination.page <= 1 || isFetching
                  ? "cursor-not-allowed border-zinc-800 text-zinc-700"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              )}
            >
              <ChevronLeft size={13} />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const startPage = Math.max(
                1,
                Math.min(pagination.page - 2, pagination.totalPages - 4)
              );
              const pageNum = startPage + i;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  disabled={isFetching}
                  className={cn(
                    "flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2",
                    "font-mono text-xs transition-colors duration-100",
                    pageNum === pagination.page
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isFetching}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors duration-100",
                pagination.page >= pagination.totalPages || isFetching
                  ? "cursor-not-allowed border-zinc-800 text-zinc-700"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              )}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}