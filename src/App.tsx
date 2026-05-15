import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import AdminRoute from "@/components/auth/AdminRoute";
import HashScrollHandler from "@/components/HashScrollHandler";
import LegacyRedirect from "@/components/LegacyRedirect";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Shop = lazy(() => import("./pages/Shop"));
const Auth = lazy(() => import("./pages/Auth"));
const Designer = lazy(() => import("./pages/Designer"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PerformanceMonitor = lazy(() => import("./pages/PerformanceMonitor"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NeighborhoodGalleryAdmin = lazy(() => import("./pages/admin/NeighborhoodGalleryAdmin"));
const SerpPreviewPage = lazy(() => import("./pages/admin/SerpPreviewPage"));
const GscIndexingPage = lazy(() => import("./pages/admin/GscIndexingPage"));
const SeoDashboard = lazy(() => import("./pages/admin/SeoDashboard"));
const Borough = lazy(() => import("./pages/Borough"));
const WoodSpecies = lazy(() => import("./pages/WoodSpecies"));
const WoodSpeciesDetail = lazy(() => import("./pages/WoodSpeciesDetail"));
const FinishesColors = lazy(() => import("./pages/FinishesColors"));
const GalleryPage = lazy(() => import("./pages/Gallery"));
const KitchenRenovationBrooklyn = lazy(() => import("./pages/KitchenRenovationBrooklyn"));
const About = lazy(() => import("./pages/About"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));
const BestWoodForKitchenCabinets = lazy(() => import("./pages/BestWoodForKitchenCabinets"));
const CabinetWoodTypesAndCosts = lazy(() => import("./pages/CabinetWoodTypesAndCosts"));
const NaturalWoodKitchenCabinets = lazy(() => import("./pages/NaturalWoodKitchenCabinets"));
const DoubleSinkVanityGuide = lazy(() => import("./pages/DoubleSinkVanityGuide"));
const FloatingBathroomVanity = lazy(() => import("./pages/FloatingBathroomVanity"));
const SmallBathroomVanityIdeas = lazy(() => import("./pages/SmallBathroomVanityIdeas"));
const ReachInClosetSystemsNYC = lazy(() => import("./pages/ReachInClosetSystemsNYC"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-busy="true" />
);

const App = () => {
  usePerformanceMonitor();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HashScrollHandler />
        <Suspense fallback={<RouteFallback />}>
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
            <Route path="/admin/seo" element={
              <AdminRoute>
                <SeoDashboard />
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
        </Suspense>
        <ScrollToTopButton />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
