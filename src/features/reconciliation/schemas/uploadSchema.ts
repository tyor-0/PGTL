/*
WHAT THIS FILE DOES:
Defines Zod validation schema for the upload form inputs.

WHY IT EXISTS:
Validation rules live here, not scattered across components.
If the file size limit changes from 50MB, this is the only file to touch.
The schema is the contract between the user's file selection and
what we're willing to send to the backend.

HOW IT WORKS:
Uses Zod's custom refinements on the File type.
The schema is evaluated in UploadForm before submission fires.
Errors are mapped to per-field messages shown under each dropzone.
*/

import { z } from "zod";

const MAX_SIZE_HARD = 500 * 1024 * 1024;
const MAX_SIZE_WARN = 50 * 1024 * 1024;

const csvFileSchema = z
  .instanceof(File, { message: "Please select a file." })
  .refine(
    (file) => file.name.toLowerCase().endsWith(".csv"),
    { message: "Only .csv files are accepted." }
  )
  .refine(
    (file) => file.size <= MAX_SIZE_HARD,
    { message: "File exceeds the 500MB maximum size." }
  );

export const uploadSchema = z.object({
  sourceA: csvFileSchema,
  sourceB: csvFileSchema,
});

export type UploadFormValues = z.infer<typeof uploadSchema>;

export function isLargeFile(file: File): boolean {
  return file.size > MAX_SIZE_WARN;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}