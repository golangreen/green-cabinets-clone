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
        // Phase 35b: Advanced manual chunks for optimal code-splitting
        manualChunks: (id) => {
          // Vendor libraries - fine-grained splitting
          if (id.includes('node_modules')) {
            // React core (most critical)
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            // React Router (lazy loaded)
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Three.js core
            if (id.includes('three/')) {
              return 'three-core';
            }
            // React Three Fiber (3D framework)
            if (id.includes('@react-three/fiber')) {
              return 'three-fiber';
            }
            // React Three Drei (3D helpers)
            if (id.includes('@react-three/drei')) {
              return 'three-drei';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            // Charting library (heavy, admin only)
            if (id.includes('recharts')) {
              return 'charts';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            // Zustand (state management)
            if (id.includes('zustand')) {
              return 'zustand';
            }
            // Supabase client
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-client';
            }
            // Sentry (error tracking)
            if (id.includes('@sentry/react')) {
              return 'sentry';
            }
            // Other vendors
            return 'vendor-misc';
          }
          
          // Feature-based splitting (granular)
          // Vanity Designer - split by module type
          if (id.includes('src/features/vanity-designer')) {
            if (id.includes('/3d/')) {
              return 'vanity-3d';
            }
            if (id.includes('/components/') && !id.includes('/3d/')) {
              return 'vanity-ui';
            }
            if (id.includes('/services/') || id.includes('/hooks/')) {
              return 'vanity-logic';
            }
            return 'vanity-designer';
          }
          
          // Admin features - split by area
          if (id.includes('src/features/admin-security')) {
            return 'admin-security';
          }
          if (id.includes('src/pages/Admin')) {
            if (id.includes('AdminUsers')) {
              return 'admin-users';
            }
            if (id.includes('AdminAudit')) {
              return 'admin-audit';
            }
            if (id.includes('AdminPerformance')) {
              return 'admin-performance';
            }
            if (id.includes('AdminCache') || id.includes('AdminGallery') || id.includes('AdminEmail')) {
              return 'admin-tools';
            }
            return 'admin-pages';
          }
          
          // Shop features
          if (id.includes('src/features/product-catalog')) {
            return 'shop-catalog';
          }
          if (id.includes('src/features/shopping-cart')) {
            return 'shop-cart';
          }
          
          // Brand-specific code (lazy load by brand)
          if (id.includes('tafisaColors')) {
            return 'brand-tafisa';
          }
          if (id.includes('eggerColors')) {
            return 'brand-egger';
          }
          
          // Core utilities and services
          if (id.includes('src/services/')) {
            return 'services';
          }
          if (id.includes('src/lib/') && !id.includes('src/lib/utils')) {
            return 'lib-utils';
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
        
        // CRITICAL: Force immediate activation of new service worker
        skipWaiting: true,
        
        // CRITICAL: Take control of all open tabs immediately
        clientsClaim: true,
        
        // CRITICAL: Delete outdated caches from previous deployments
        cleanupOutdatedCaches: true,
        
        // CRITICAL: Fallback for SPA routing (use '/' not '/index.html')
        navigateFallback: '/',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        navigateFallbackDenylist: [/^\/api\//, /\.(?:png|jpg|jpeg|svg|gif|webp|ico|js|css|woff|woff2|ttf)$/],
        
        runtimeCaching: [
          // Shopify API - NetworkFirst with timeout
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
          // Shopify CDN images - CacheFirst
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
          // Phase 35a: Supabase API caching
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Phase 35a: Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Phase 35a: Local images and assets
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Phase 35a: JS and CSS assets
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
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
