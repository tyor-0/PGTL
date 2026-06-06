/*
WHAT THIS FILE DOES:
Fetches the current status and progress of a reconciliation job.

WHY IT EXISTS:
Isolates the job polling HTTP call. The useJobPolling hook calls this
function on an interval — the hook manages timing, this function
only manages the HTTP request itself.

HOW IT WORKS:
Takes a jobId string, GETs /api/v1/jobs/:jobId, returns the Job object.
Called every 2 seconds by useJobPolling until status is completed/failed.
*/

import { apiClient } from "../../../lib/axios";
import { ApiResponse, Job } from "../types";

export async function getJob(jobId: string): Promise<Job> {
  const response = await apiClient.get<ApiResponse<Job>>(
    `/jobs/${jobId}` );
    
  //     console.log("RAW RESPONSE:", response.data);        // full envelope
  // console.log("DATA LAYER:", response.data.data);     // what we return
  // console.log("STATUS:", response.data.data?.status); // what the hook reads


  return response.data.data;
}