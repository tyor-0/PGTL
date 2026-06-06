/*
WHAT THIS FILE DOES:
Manages the upload form submission — sends both CSV files to the backend
and navigates to the processing screen on success.

WHY IT EXISTS:
Keeps upload logic out of the UploadForm component. The component only
calls submit(sourceA, sourceB) and reacts to isPending / error states.
All the HTTP, error handling, and navigation logic lives here.

HOW IT WORKS:
Uses useMutation (not useQuery) because this is a write operation.
On success, the returned jobId is pushed into the URL via React Router.
The ProcessingPage will pick it up from useParams and start polling.
mutation.retry is 0 (set in QueryClient defaults) — never re-upload.
*/

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { uploadFiles } from "../api/reconcile";

export function useUpload() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ sourceA, sourceB }: { sourceA: File; sourceB: File }) =>
      uploadFiles(sourceA, sourceB),

    onSuccess: (data) => {
      // Navigate to the processing screen with the jobId in the URL.
      // The ProcessingPage reads it from useParams — no global state needed.
      navigate(`/processing/${data.jobId}`);
    },

    // onError is handled in the component via mutation.error
  });

  return {
    submit: (sourceA: File, sourceB: File) =>
      mutation.mutate({ sourceA, sourceB }),
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}