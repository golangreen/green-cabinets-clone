import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { spawnSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Green Cabinets - Custom Cabinetry NYC',
        short_name: 'Green Cabinets',
        description: 'Premium custom cabinetry for kitchens, bathrooms, and closets in Brooklyn, NYC since 2009',
        theme_color: '#2dd4bf',
        background_color: '#030303',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
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
