/*
WHAT THIS FILE DOES:
Browser Web Worker that reads the first 50KB of a CSV file and parses
the first 5 data rows plus the header row for preview purposes.

WHY IT EXISTS:
File.text() on a large CSV blocks the main thread — the UI freezes
while the browser reads hundreds of megabytes. Running it in a Worker
means the main thread stays completely free and the UI stays responsive.

HOW IT WORKS:
The main thread posts a File object via postMessage.
This worker reads only the first 50KB using file.slice(0, 50_000).
It then splits by newline, parses the header row, and maps the next
5 rows into objects keyed by header name.
It posts back a CsvPreviewResult on success or an error string on failure.
*/

import type { CsvPreviewResult } from "../types/index";

interface WorkerInput {
  file: File;
}

interface WorkerSuccess {
  type: "success";
  payload: CsvPreviewResult;
}

interface WorkerError {
  type: "error";
  message: string;
}

type WorkerOutput = WorkerSuccess | WorkerError;

self.onmessage = async (event: MessageEvent<WorkerInput>) => {
  const { file } = event.data;

  try {
    const slice = file.slice(0, 50_000);
    const text = await slice.text();

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      const output: WorkerOutput = {
        type: "error",
        message: "File appears to be empty.",
      };
      self.postMessage(output);
      return;
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    const dataLines = lines.slice(1, 6);
    const rows: Record<string, string>[] = dataLines.map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] ?? "";
      });
      return row;
    });

    const result: CsvPreviewResult = {
      headers,
      rows,
      totalBytesRead: slice.size,
      fileName: file.name,
    };

    const output: WorkerOutput = { type: "success", payload: result };
    self.postMessage(output);

  } catch (err) {
    const output: WorkerOutput = {
      type: "error",
      message: err instanceof Error ? err.message : "Failed to read file.",
    };
    self.postMessage(output);
  }
};