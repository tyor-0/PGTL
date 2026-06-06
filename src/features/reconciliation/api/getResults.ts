/*
WHAT THIS FILE DOES:
Fetches one page of reconciliation results for a specific discrepancy type.

WHY IT EXISTS:
Keeps the HTTP call separate from the hook that manages its state.
If the endpoint or params change, only this file changes.

HOW IT WORKS:
The backend returns summary + rows + pagination on the jobs endpoint.
The ?type= param filters which discrepancy category rows are returned.
Summary is always present so SummaryCards never need a separate fetch.
*/

import { apiClient } from "../../../lib/axios";
import { ApiResponse, DiscrepancyType, ResultsResponse } from "../types";

export interface GetResultsParams {
  jobId: string;
  type: DiscrepancyType;
  page: number;
  limit: number;
}

export async function getResults(
  params: GetResultsParams
): Promise<ResultsResponse> {
  const { jobId, type, page, limit } = params;

  const response = await apiClient.get<ApiResponse<ResultsResponse>>(
    `/jobs/${jobId}/results`,
    {
      params: { type, page, limit },
    }
  );

  // Backend wraps everything in data: { jobId, status, summary, rows, pagination }
  // We only need the ResultsResponse-shaped fields from it
  const raw = response.data.data as ResultsResponse & Record<string, unknown>;

  return {
    summary: raw.summary,
    rows: raw.rows,
    pagination: raw.pagination,
  };
}