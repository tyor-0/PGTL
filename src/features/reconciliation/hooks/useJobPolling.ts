/*
WHAT THIS FILE DOES:
Polls GET /api/v1/jobs/:jobId every 2 seconds and stops automatically
when the job reaches a terminal state (completed or failed).

WHY IT EXISTS:
Polling logic belongs in a hook, not a component. The ProcessingPage
just reads { job, isPolling, error } — it doesn't manage any timers.

HOW IT WORKS:
Uses useQuery with refetchInterval. When the callback returns false,
React Query stops scheduling refetches — no manual clearInterval needed.

staleTime: 0 — job status is always considered stale so every poll
actually hits the server rather than returning cached data.

retry: 1 — if the status endpoint errors once, try once more.
After that, surface the error so the user knows something is wrong.

The hook also navigates to the results page automatically when the
job reaches "completed" so the user never has to click anything.
*/

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJob } from "../api/getJob";
import { Job } from "../types";

const TERMINAL_STATUSES: Job["status"][] = ["completed", "failed"];
const POLL_INTERVAL_MS = 2000;

export function useJobPolling(jobId: string) {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId),
    staleTime: 0,
    retry: 1,

    // refetchInterval accepts a function that receives the current query state.
    // Return false to stop polling, a number (ms) to keep going.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return POLL_INTERVAL_MS;
      return TERMINAL_STATUSES.includes(status) ? false : POLL_INTERVAL_MS;
    },
  });

  // Navigate to results when job completes
  useEffect(() => {
    if (query.data?.status === "completed") {
      navigate(`/results/${jobId}`, { replace: true });
    }
  }, [query.data?.status, jobId, navigate]);

  const isPolling =
    query.data?.status !== undefined &&
    !TERMINAL_STATUSES.includes(query.data.status);

  return {
    job: query.data ?? null,
    isPolling,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}