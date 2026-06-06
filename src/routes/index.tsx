import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { UploadPage } from "../pages/UploadPage";
import { ProcessingPage } from "../pages/ProcessingPage";
import { ResultsPage } from "../pages/ResultsPage";
// import { NotFoundPage } from "../pages/NotFoundPage";

/*
WHAT THIS FILE DOES:
Defines every client-side route in the application using React Router v6.

WHY IT EXISTS:
Centralising routes here means the full routing map is readable in one
place. Adding a new page is one entry here + one new Page component.

HOW IT WORKS:
Uses createBrowserRouter (the v6 data router API).
RootLayout is the parent route — its Outlet renders the active child.

Route structure:
  /                        → UploadPage (default, fresh start)
  /processing/:jobId       → ProcessingPage (polls job status)
  /results/:jobId          → ResultsPage (paginated discrepancy results)
  *                        → NotFoundPage (catch-all)

Why jobId in the URL:
  - Survives browser refresh — polling resumes automatically
  - Shareable — paste the /results/:jobId URL and it loads correctly
  - No global state needed to pass jobId between pages
*/



const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <UploadPage />,
      },
      {
        path: "processing/:jobId",
        element: <ProcessingPage />,
      },
      {
        path: "results/:jobId",
        element: <ResultsPage />,
      },
      {
        // Redirect bare /results with no jobId back to upload
        path: "results",
        element: <Navigate to="/" replace />,
      },
      // {
      //   path: "*",
      //   element: <NotFoundPage />,
      // },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}