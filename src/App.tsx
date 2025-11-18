import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ThemeProvider } from "@/contexts";
import { ProtectedRoute } from "@/components/auth";
import { AdminRoute } from "@/components/auth";
import { ROUTES } from "@/constants/routes";
import { FeatureErrorBoundary, ConfigValidationAlert, SplashScreen } from "@/components/layout";
import { PreloadManager } from "@/features/product-catalog";
import { CACHE_CONFIG } from "@/config";
import { createQueryClient } from "@/config/reactQuery";
import { SkipLink } from "@/components/accessibility";

// Lazy load all pages for code-splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const VanityDesigner = lazy(() => import("./pages/VanityDesigner"));
const AdminSecurity = lazy(() => import("./pages/AdminSecurity"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog"));
const AdminCache = lazy(() => import("./pages/AdminCache"));
const AdminConfig = lazy(() => import("./pages/AdminConfig"));
const AdminPerformance = lazy(() => import("./pages/AdminPerformance"));
const AdminEmailSettings = lazy(() => import("./pages/AdminEmailSettings"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const StorageAnalyzerPage = lazy(() => import("./pages/StorageAnalyzerPage"));
const RoomScan = lazy(() => import("./pages/RoomScan"));
const DocsAuth = lazy(() => import("./pages/DocsAuth"));
const DocsGettingStarted = lazy(() => import("./pages/DocsGettingStarted"));
const DocsConfiguration = lazy(() => import("./pages/DocsConfiguration"));
const DocsAPI = lazy(() => import("./pages/DocsAPI"));
const DocsAPIReference = lazy(() => import("./pages/DocsAPIReference"));
const DocsTroubleshooting = lazy(() => import("./pages/DocsTroubleshooting"));
const DocsSecurity = lazy(() => import("./pages/DocsSecurity"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = createQueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if this is a mobile app environment (Capacitor)
    const isMobileApp = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    // Only show splash on mobile app or first visit
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (!isMobileApp && hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      <SkipLink />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
              
              {/* Configuration validation alert */}
              <ConfigValidationAlert />
              
              {/* Background product preloader wrapped in error boundary */}
              <FeatureErrorBoundary
                featureName="Product Preloader"
                featureTag="product-preload"
                fallbackRoute="/"
              >
              <PreloadManager
                prefetchCount={CACHE_CONFIG.PRELOAD_COUNT}
                autoRefreshInterval={CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL}
              />
              </FeatureErrorBoundary>

              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/product/:handle" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/designer" 
                    element={<VanityDesigner />} 
                  />
                  <Route 
                    path="/admin/security" 
                    element={
                      <AdminRoute>
                        <AdminSecurity />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path={ROUTES.ADMIN_USERS}
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path={ROUTES.ADMIN_AUDIT_LOG}
                    element={
                      <AdminRoute>
                        <AdminAuditLog />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path={ROUTES.ADMIN_CACHE}
                    element={
                      <AdminRoute>
                        <AdminCache />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/config"
                    element={
                      <AdminRoute>
                        <AdminConfig />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/performance"
                    element={
                      <AdminRoute>
                        <AdminPerformance />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path={ROUTES.ADMIN_EMAIL_SETTINGS}
                    element={
                      <AdminRoute>
                        <AdminEmailSettings />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path={ROUTES.ADMIN_GALLERY}
                    element={
                      <AdminRoute>
                        <AdminGallery />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/storage-analyzer"
                    element={
                      <AdminRoute>
                        <StorageAnalyzerPage />
                      </AdminRoute>
                    } 
                  />
                  <Route path="/room-scan" element={<RoomScan />} />
                  <Route path="/docs/auth" element={<DocsAuth />} />
                  <Route path="/docs/getting-started" element={<DocsGettingStarted />} />
                  <Route path="/docs/configuration" element={<DocsConfiguration />} />
                  <Route path="/docs/api" element={<DocsAPI />} />
                  <Route path="/docs/api-reference" element={<DocsAPIReference />} />
                  <Route path="/docs/security" element={<DocsSecurity />} />
                  <Route path="/docs/troubleshooting" element={<DocsTroubleshooting />} />
                  <Route path="/accessibility" element={<AccessibilityStatement />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
