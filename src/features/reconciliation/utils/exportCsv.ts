/*
WHAT THIS FILE DOES:
Converts the currently loaded rows array into a downloadable CSV file
and triggers a browser download.

WHY IT EXISTS:
Export logic lives here, not inside ExportButton. ExportButton is a
presentational component — it calls this function and renders the button.
If the export format ever changes (e.g. add a BOM for Excel compatibility),
this is the only file to touch.

HOW IT WORKS:
Takes an array of row objects and an optional filename.
Extracts headers from the first row's keys.
Serialises each row to a comma-separated line, quoting values that
contain commas or newlines so the file opens correctly in Excel.
Creates a Blob, builds an object URL, clicks a hidden <a> tag, then
revokes the URL to free memory. No external library needed.
*/
import { AnyRow, NestedMismatchRow, TransactionRow } from "../types";

function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  // Wrap in quotes if the value contains a comma, newline, or double-quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}


export function exportToCsv(rows: AnyRow[], filename = "reconciliation-export"): void {
  if (rows.length === 0) return;

  // Flatten nested rows into plain records before exporting
  const records: Record<string, unknown>[] = rows.map((row) => {
    if (typeof row === "object" && row !== null && "sourceA" in row) {
      const nested = row as NestedMismatchRow;
      return {
        transactionId: nested.sourceA.transactionId,
        "sourceA.timestamp": nested.sourceA.timestamp,
        "sourceA.amount": nested.sourceA.amount,
        "sourceA.currency": nested.sourceA.currency,
        "sourceA.status": nested.sourceA.status,
        "sourceB.timestamp": nested.sourceB.timestamp,
        "sourceB.amount": nested.sourceB.amount,
        "sourceB.currency": nested.sourceB.currency,
        "sourceB.status": nested.sourceB.status,
      };
    }
    return { ...(row as TransactionRow) } as Record<string, unknown>;
  });

  const headers = Object.keys(records[0]);
  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = records.map((record) =>
    headers.map((h) => escapeCell(record[h])).join(",")
  );

  const csv = [headerLine, ...dataLines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}.csv`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(url), 100);
}