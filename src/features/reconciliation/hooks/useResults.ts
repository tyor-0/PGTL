/*
WHAT THIS FILE DOES:
Fetches one page of results for one discrepancy type from a completed job.

WHY IT EXISTS:
Results are lazily loaded — only the active tab's data is ever fetched.
This hook encapsulates the query key structure that makes tab switching
trigger the correct new fetch automatically.

HOW IT WORKS:
The query key includes [jobId, type, page] — when any of these change,
React Query sees a new query and fetches fresh data.

staleTime: 5 minutes — completed job results never change on the server.
Cached pages are served instantly when the user navigates back to a tab.

placeholderData: keepPreviousData — the table stays populated with the
previous page's data while the next page loads. No blank flash.

The hook is only enabled when a jobId and type are both present.
This prevents it from firing prematurely on page mount.
*/

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getResults } from "../api/getResults";
import { DiscrepancyType } from "../types";

interface UseResultsParams {
  jobId: string;
  type: DiscrepancyType;
  page: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;

export function useResults({
  jobId,
  type,
  page,
  limit = DEFAULT_LIMIT,
}: UseResultsParams) {
  const query = useQuery({
    queryKey: ["results", jobId, type, page, limit],
    queryFn: () => getResults({ jobId, type, page, limit }),

    // 5 minutes — completed job results are immutable on the server
    staleTime: 5 * 60 * 1000,

    // Keep previous page data visible while next page loads.
    // Without this the table goes blank during every pagination click.
    placeholderData: keepPreviousData,

    // Only fetch when we have both a jobId and a type selected
    enabled: Boolean(jobId && type),
  });

 return {
  summary: query.data?.summary ?? null,
  rows: query.data?.rows ?? [],      // now typed as AnyRow[]
  pagination: query.data?.pagination ?? null,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  error: query.error?.message ?? null,
};
}