/*
WHAT THIS FILE DOES:
Renders the results dashboard after reconciliation completes.

WHY IT EXISTS:
Thin page shell. Extracts jobId from the URL, guards against
missing jobId, and hands off to ResultsDashboard.

HOW IT WORKS:
useParams extracts jobId from /results/:jobId.
Missing jobId → redirect to "/" for a clean restart.
Valid jobId → ResultsDashboard owns all data fetching and layout.
*/

import { useParams, Navigate } from "react-router-dom";
import { ResultsDashboard } from "../features/reconciliation/components/results/ResultsDashboard";

export function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return <Navigate to="/" replace />;
  }

  return <ResultsDashboard jobId={jobId} />;
}