export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job {
  jobId: string;
  status: JobStatus;
  progress: number;
  rowsProcessed: number;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
}

// ─── Upload ────────────────────────────────────────────────────────────────────
export interface UploadResponse {
  jobId: string;
  status: Extract<JobStatus, "pending">;
  progress: 0;
}

// ─── Transaction row ───────────────────────────────────────────────────────────
// All tabs return this same flat shape — the tab type filters which
// rows come back, not the structure of each row.
export interface TransactionRow {
  transactionId: string;
  timestamp: string;
  amount: number | string;
  currency: string;
  status: string;
}

// Kept for reference but backend currently returns flat TransactionRow for all types
export interface MismatchedRow {
  transactionId: string;
  field: "amount" | "status" | "currency" | "timestamp";
  valueInA: string;
  valueInB: string;
}

export interface MalformedRow {
  rowNumber: number;
  reason: string;
  rawData: Record<string, string>;
}

// ─── Discrepancy types ─────────────────────────────────────────────────────────
export type DiscrepancyType =
  | "missingInA"
  | "missingInB"
  | "amountMismatches"
  | "statusMismatches"
  | "currencyMismatches"
  | "timestampMismatches"
  | "duplicateTransactions"
  | "malformedRows";

// ─── Results ───────────────────────────────────────────────────────────────────
// Keys match the actual backend response exactly.
// Backend returns: totalSourceA, totalSourceB, matchedTransactions
export interface ReconciliationSummary {
  totalSourceA: number;
  totalSourceB: number;
  matchedTransactions: number;
  missingInA: number;
  missingInB: number;
  amountMismatches: number;
  statusMismatches: number;
  currencyMismatches: number;
  timestampMismatches: number;
  duplicateTransactions: number;
  malformedRows: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Mismatch rows have nested sourceA/sourceB — what backend actually returns
// for amountMismatches, statusMismatches, currencyMismatches, timestampMismatches
export interface NestedMismatchRow {
  sourceA: TransactionRow;
  sourceB: TransactionRow;
}

// The backend returns either flat rows (missing tabs) or nested rows (mismatch tabs)
export type AnyRow = TransactionRow | NestedMismatchRow;

// Rows are always flat TransactionRow objects regardless of tab type.
// The backend filters which rows are returned by type — not the row shape.
export interface ResultsResponse {
  summary: ReconciliationSummary;
  rows: AnyRow[];           // ← was TransactionRow[], now reflects reality
  pagination: Pagination;
}

// ─── API wrapper ───────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ─── CSV Preview (Web Worker output) ──────────────────────────────────────────
export interface CsvPreviewResult {
  headers: string[];
  rows: Record<string, string>[];
  totalBytesRead: number;
  fileName: string;
}

// ─── Upload form state ─────────────────────────────────────────────────────────
export interface UploadedFileState {
  file: File | null;
  preview: CsvPreviewResult | null;
  previewLoading: boolean;
  previewError: string | null;
}


