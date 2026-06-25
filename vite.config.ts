import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { spawnSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";

// Runs the LocalBusiness JSON-LD validator at build start. Fails the build on errors.
function validateJsonLdPlugin(): Plugin {
  return {
    name: "validate-localbusiness-jsonld",
    apply: "build",
    buildStart() {
      const result = spawnSync(
        process.execPath,
        [path.resolve(__dirname, "scripts/validate-localbusiness-jsonld.mjs")],
        { stdio: "inherit" }
      );
      if (result.status !== 0) {
        this.error("LocalBusiness JSON-LD validation failed — aborting build.");
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    validateJsonLdPlugin(),
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', '@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
