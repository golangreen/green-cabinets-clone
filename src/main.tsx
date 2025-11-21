import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "@/lib/queryClient";

// Initialize theme on first load
const initTheme = () => {
  const stored = localStorage.getItem('theme');
  const root = document.documentElement;
  
  if (stored === 'dark') {
    root.classList.add('dark');
  } else if (stored === 'light') {
    root.classList.remove('dark');
  } else {
    // System preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeQuery.matches) {
      root.classList.add('dark');
    }
  }
};

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
