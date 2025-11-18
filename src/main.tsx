import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initSentry } from "./lib/sentry";
import { ErrorFallback } from "./components/layout";
import { setupBackgroundSync } from "./lib/backgroundSync";
import { useCartStore } from "./features/shopping-cart/stores/cartStore";
import { initPerformanceMonitoring } from "./lib/performance";

// Initialize Sentry for production error tracking
initSentry();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}

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
