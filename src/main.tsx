import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { ErrorFallback } from "./components/layout";

// Initialize Sentry for production error tracking
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary 
      fallback={ErrorFallback}
      showDialog={false}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
