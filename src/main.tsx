import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { ErrorFallback } from "./components/layout";
import { setupBackgroundSync } from "./lib/backgroundSync";
import { useCartStore } from "./features/shopping-cart/stores/cartStore";

// Initialize Sentry for production error tracking
initSentry();

// Setup background sync for offline cart operations with cart actions provider
setupBackgroundSync(() => useCartStore.getState());

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
