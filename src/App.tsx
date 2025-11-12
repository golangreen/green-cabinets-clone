import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ThemeProvider } from "@/contexts";
import { ProtectedRoute } from "@/components/auth";
import { AdminRoute } from "@/components/auth";
import { ROUTES } from "@/constants/routes";
import { FeatureErrorBoundary, ConfigValidationAlert } from "@/components/layout";
import { PreloadManager } from "@/features/product-catalog";
import { CACHE_CONFIG } from "@/config";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import VanityDesigner from "./pages/VanityDesigner";
import AdminSecurity from "./pages/AdminSecurity";
import AdminUsers from "./pages/AdminUsers";
import AdminAuditLog from "./pages/AdminAuditLog";
import AdminCache from "./pages/AdminCache";
import AdminConfig from "./pages/AdminConfig";
import RoomScan from "./pages/RoomScan";
import DocsAuth from "./pages/DocsAuth";
import DocsGettingStarted from "./pages/DocsGettingStarted";
import DocsConfiguration from "./pages/DocsConfiguration";
import DocsAPI from "./pages/DocsAPI";
import DocsTroubleshooting from "./pages/DocsTroubleshooting";
import DocsSecurity from "./pages/DocsSecurity";
import NotFound from "./pages/NotFound";
import { SplashScreen } from "@/components/layout";

const queryClient = new QueryClient();

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
                <Route path="/room-scan" element={<RoomScan />} />
                <Route path="/docs/auth" element={<DocsAuth />} />
                <Route path="/docs/getting-started" element={<DocsGettingStarted />} />
                <Route path="/docs/configuration" element={<DocsConfiguration />} />
                <Route path="/docs/api" element={<DocsAPI />} />
                <Route path="/docs/security" element={<DocsSecurity />} />
                <Route path="/docs/troubleshooting" element={<DocsTroubleshooting />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
