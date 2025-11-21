import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "@/lib/queryClient";

// Dark mode detection and initialization
const initDarkMode = () => {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const applyDarkMode = (matches: boolean) => {
    if (matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply initial dark mode
  applyDarkMode(darkModeQuery.matches);

  // Listen for changes
  darkModeQuery.addEventListener('change', (e) => applyDarkMode(e.matches));
};

// Initialize dark mode before render
initDarkMode();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
