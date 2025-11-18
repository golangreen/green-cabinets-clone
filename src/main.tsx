import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "@/lib/queryClient";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

// Wrapper component to initialize performance monitoring
function AppWithMonitoring() {
  usePerformanceMonitor();
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithMonitoring />
    </QueryClientProvider>
  </StrictMode>
);
