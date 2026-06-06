/*
WHAT THIS FILE DOES:
Calls POST /api/v1/reconcile with two CSV files and returns a jobId.

WHY IT EXISTS:
Keeps the raw HTTP call separate from the hook that manages its state.
If the endpoint URL or FormData shape changes, only this file changes.

HOW IT WORKS:
Accepts two File objects, builds a FormData payload, POSTs to the backend. Returns the UploadResponse which contains only jobId + status.
The multipart Content-Type header is set automatically by the browser when FormData is passed to axios.
*/

import { apiClient } from "../../../lib/axios";
import { ApiResponse, UploadResponse } from "../types";

export async function uploadFiles(
  sourceA: File,
  sourceB: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("sourceA", sourceA);
  formData.append("sourceB", sourceB);

  const response = await apiClient.post<ApiResponse<UploadResponse>>(
    "/reconcile",
    formData
    // No Content-Type header here — letting the browser set it automatically
    // includes the multipart boundary that the server needs to parse the body.
  );

  return response.data.data;
}