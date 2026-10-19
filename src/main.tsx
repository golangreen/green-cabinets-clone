import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "@/lib/queryClient";
import { initDeploymentReload } from "@/lib/deploymentReload";
import { isApp } from "@/lib/platform";

// The app ships its own copy of the site, so it has no new deploys to watch for.
if (!isApp()) initDeploymentReload();

const app = (
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);

const rootEl = document.getElementById("root")!;

if (rootEl.hasAttribute("data-prerendered")) {
  // The page arrived with static HTML from the build-time pre-render
  // (scripts/prerender.mjs, same component tree as src/entry-server.tsx).
  // Hydrate it in place so the visible content is reused, not repainted.
  // If something doesn't match, React recovers by re-rendering that part.
  hydrateRoot(rootEl, app, {
    onRecoverableError: (err) => {
      if (import.meta.env.DEV) console.warn("[hydrate]", err);
    },
  });
} else {
  createRoot(rootEl).render(app);
}

// App: drop the launch screen as soon as the page shows real content (a
// heading), checking each frame; the native 6 s auto-hide is the backstop.
if (isApp()) {
  const started = performance.now();
  const ready = () => {
    if (document.querySelector("main h1, main h2") || performance.now() - started > 6000) {
      import("@capacitor/splash-screen").then(({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 250 }));
      return;
    }
    requestAnimationFrame(ready);
  };
  requestAnimationFrame(ready);
}
