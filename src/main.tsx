/*
WHAT THIS FILE DOES:
Mounts the React application into the DOM.

WHY IT EXISTS:
Vite's entry point. Kept as minimal as possible — all setup
logic lives in AppProviders and AppRouter.

HOW IT WORKS:
Wraps AppRouter in AppProviders so every route has access to
QueryClient and any future providers added to AppProviders.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/providers/AppProviders";
import App from "./App";
// @ts-ignore: CSS side-effect import declaration is not available in this TS config
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);