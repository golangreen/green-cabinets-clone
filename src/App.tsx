import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";
import Auth from "./pages/Auth";
import Designer from "./pages/Designer";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PerformanceMonitor from "./pages/PerformanceMonitor";
import NotFound from "./pages/NotFound";
import NeighborhoodGalleryAdmin from "./pages/admin/NeighborhoodGalleryAdmin";
import SerpPreviewPage from "./pages/admin/SerpPreviewPage";
import GscIndexingPage from "./pages/admin/GscIndexingPage";
import SeoDashboard from "./pages/admin/SeoDashboard";
import Borough from "./pages/Borough";
import WoodSpecies from "./pages/WoodSpecies";
import WoodSpeciesDetail from "./pages/WoodSpeciesDetail";
import FinishesColors from "./pages/FinishesColors";
import GalleryPage from "./pages/Gallery";
import KitchenRenovationBrooklyn from "./pages/KitchenRenovationBrooklyn";
import About from "./pages/About";
import CaseStudies from "./pages/CaseStudies";
import CaseStudyDetail from "./pages/CaseStudyDetail";
import BestWoodForKitchenCabinets from "./pages/BestWoodForKitchenCabinets";
import CabinetWoodTypesAndCosts from "./pages/CabinetWoodTypesAndCosts";
import NaturalWoodKitchenCabinets from "./pages/NaturalWoodKitchenCabinets";
import DoubleSinkVanityGuide from "./pages/DoubleSinkVanityGuide";
import FloatingBathroomVanity from "./pages/FloatingBathroomVanity";
import SmallBathroomVanityIdeas from "./pages/SmallBathroomVanityIdeas";
import ReachInClosetSystemsNYC from "./pages/ReachInClosetSystemsNYC";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import AdminRoute from "@/components/auth/AdminRoute";
import HashScrollHandler from "@/components/HashScrollHandler";
import LegacyRedirect from "@/components/LegacyRedirect";
import ScrollToTopButton from "@/components/ScrollToTopButton";




const queryClient = new QueryClient();

const App = () => {
  // Initialize performance monitoring
  usePerformanceMonitor();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <HashScrollHandler />
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/performance" element={
              <AdminRoute>
                <PerformanceMonitor />
              </AdminRoute>
            } />
            <Route path="/admin/gallery" element={
              <AdminRoute>
                <NeighborhoodGalleryAdmin />
              </AdminRoute>
            } />
            <Route path="/admin/serp-preview" element={
              <AdminRoute>
                <SerpPreviewPage />
              </AdminRoute>
            } />
            <Route path="/admin/gsc-indexing" element={
              <AdminRoute>
                <GscIndexingPage />
              </AdminRoute>
            } />
            {/* Legacy URL redirects → /custom-kitchen-cabinets-{slug} */}
            <Route path="/neighborhoods/:slug" element={<LegacyRedirect />} />
            <Route path="/neighborhood/:slug" element={<LegacyRedirect />} />
            <Route path="/borough/:slug" element={<LegacyRedirect />} />
            <Route path="/boroughs/:slug" element={<LegacyRedirect />} />
            <Route path="/custom-kitchen-cabinets/:slug" element={<LegacyRedirect />} />
            <Route path="/wood-species" element={<WoodSpecies />} />
            <Route path="/wood-species/:slug" element={<WoodSpeciesDetail />} />
            <Route path="/finishes-colors" element={<FinishesColors />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/kitchen-renovation-brooklyn" element={<KitchenRenovationBrooklyn />} />
            <Route path="/about" element={<About />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/best-wood-for-kitchen-cabinets" element={<BestWoodForKitchenCabinets />} />
            <Route path="/cabinet-wood-types-and-costs" element={<CabinetWoodTypesAndCosts />} />
            <Route path="/natural-wood-kitchen-cabinets" element={<NaturalWoodKitchenCabinets />} />
            <Route path="/double-sink-vanity-guide" element={<DoubleSinkVanityGuide />} />
            <Route path="/floating-bathroom-vanity" element={<FloatingBathroomVanity />} />
            <Route path="/small-bathroom-vanity-ideas" element={<SmallBathroomVanityIdeas />} />
            <Route path="/reach-in-closet-systems-nyc" element={<ReachInClosetSystemsNYC />} />
            <Route path="/:boroughPath" element={<Borough />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTopButton />
          
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
