import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Note: Config values imported at build time from src/config/pwa.ts
const PWA_CACHE_CONFIG = {
  SHOPIFY_API_MAX_AGE_SECONDS: 60 * 60 * 24, // 24 hours
  SHOPIFY_IMAGES_MAX_AGE_SECONDS: 60 * 60 * 24 * 30, // 30 days
  SHOPIFY_API_MAX_ENTRIES: 50,
  SHOPIFY_IMAGES_MAX_ENTRIES: 100,
  NETWORK_TIMEOUT_SECONDS: 10,
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Reduce build output verbosity to prevent truncation in Lovable
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Manual chunks for better code-splitting
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Three.js and 3D libraries
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Data fetching and state
            if (id.includes('@tanstack') || id.includes('zustand')) {
              return 'state-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Other vendors
            return 'vendor';
          }
          
          // Feature-based splitting
          if (id.includes('src/features/vanity-designer')) {
            return 'vanity-designer';
          }
          if (id.includes('src/features/admin-')) {
            return 'admin-features';
          }
          if (id.includes('src/features/product-catalog') || id.includes('src/features/shopping-cart')) {
            return 'shop-features';
          }
        },
        // Suppress detailed asset reporting
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    // Minimize build output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
      }
    }
  },
  // Reduce logging verbosity
  logLevel: mode === 'production' ? 'warn' : 'info',
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      includeAssets: ['logo.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      workbox: {
        // Increase max file size for large app bundle (3.85MB+)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.myshopify\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'shopify-api-cache',
              expiration: {
                maxEntries: PWA_CACHE_CONFIG.SHOPIFY_API_MAX_ENTRIES,
                maxAgeSeconds: PWA_CACHE_CONFIG.SHOPIFY_API_MAX_AGE_SECONDS,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: PWA_CACHE_CONFIG.NETWORK_TIMEOUT_SECONDS,
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.shopify\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'shopify-images-cache',
              expiration: {
                maxEntries: PWA_CACHE_CONFIG.SHOPIFY_IMAGES_MAX_ENTRIES,
                maxAgeSeconds: PWA_CACHE_CONFIG.SHOPIFY_IMAGES_MAX_AGE_SECONDS,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Green Cabinets - Custom Cabinetry NYC',
        short_name: 'Green Cabinets',
        description: 'Premium custom cabinetry for kitchens, bathrooms, and closets in Brooklyn, NYC since 2009',
        theme_color: '#1e7b5f',
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
}));
