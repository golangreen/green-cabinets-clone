import { Suspense, type ComponentType, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import HashScrollHandler from "@/components/layout/HashScrollHandler";
import SkipLink from "@/components/layout/SkipLink";
import CanonicalManager from "@/components/seo/CanonicalManager";
import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import ChunkErrorBoundary from "@/components/system/ChunkErrorBoundary";
import AppRoutes from "./AppRoutes";

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-busy="true" />
);

interface AppProps {
  /** Router to use. The browser uses BrowserRouter; the build-time
   *  pre-render (src/entry-server.tsx) passes a StaticRouter so the
   *  server HTML matches what the browser hydrates. */
  Router?: ComponentType<{ children?: ReactNode }>;
}

const App = ({ Router = BrowserRouter }: AppProps) => {
  usePerformanceMonitor();


  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <SkipLink />
        <HashScrollHandler />
        <CanonicalManager />
        <ChunkErrorBoundary fallback={<RouteFallback />}>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </ChunkErrorBoundary>
        <ScrollToTopButton />
      </Router>
    </TooltipProvider>
  );
};

export default App;
