import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ThemeProvider } from "@/contexts";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import VanityDesigner from "./pages/VanityDesigner";
import AdminSecurity from "./pages/AdminSecurity";
import RoomScan from "./pages/RoomScan";
import DocsAuth from "./pages/DocsAuth";
import DocsGettingStarted from "./pages/DocsGettingStarted";
import DocsAPI from "./pages/DocsAPI";
import DocsTroubleshooting from "./pages/DocsTroubleshooting";
import NotFound from "./pages/NotFound";
import SplashScreen from "./components/SplashScreen";

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/product/:handle" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/designer" element={<VanityDesigner />} />
                <Route path="/admin/security" element={<AdminSecurity />} />
                <Route path="/room-scan" element={<RoomScan />} />
                <Route path="/docs/auth" element={<DocsAuth />} />
                <Route path="/docs/getting-started" element={<DocsGettingStarted />} />
                <Route path="/docs/api" element={<DocsAPI />} />
                <Route path="/docs/troubleshooting" element={<DocsTroubleshooting />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
