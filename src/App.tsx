import { Suspense } from "react";
import { lazyWithReload as lazy } from "@/lib/lazyWithReload";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useCompatibilityRulesSync } from "@/hooks/useCompatibilityRulesSync";
import AdminRoute from "@/components/auth/AdminRoute";
import HashScrollHandler from "@/components/layout/HashScrollHandler";
import LegacyRedirect from "@/components/layout/LegacyRedirect";
import ScrollToTopButton from "@/components/layout/ScrollToTopButton";
import ChunkErrorBoundary from "@/components/system/ChunkErrorBoundary";

const Index = lazy(() => import("./pages/marketing/Index"));
const Landing = lazy(() => import("./pages/marketing/Landing"));
const About = lazy(() => import("./pages/marketing/About"));
const GalleryPage = lazy(() => import("./pages/marketing/Gallery"));
const CaseStudies = lazy(() => import("./pages/marketing/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/marketing/CaseStudyDetail"));
const Blog = lazy(() => import("./pages/blog/Blog"));
const BlogArticle = lazy(() => import("./pages/blog/BlogArticle"));

const Shop = lazy(() => import("./pages/shop/Shop"));
const ProductDetail = lazy(() => import("./pages/shop/ProductDetail"));
const Checkout = lazy(() => import("./pages/shop/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/shop/PaymentSuccess"));

const Auth = lazy(() => import("./pages/auth/Auth"));
const Designer = lazy(() => import("./pages/designer/Designer"));
const VanityDesignerEmbed = lazy(() => import("./pages/designer/VanityDesignerEmbed"));
const Estimator = lazy(() => import("./pages/estimator/Estimator"));
const EstimatorSavedQuotes = lazy(() => import("./pages/estimator/SavedQuotes"));
const VanityConfiguratorPage = lazy(() => import("./pages/vanity/VanityConfiguratorPage"));
const NotFound = lazy(() => import("./pages/system/NotFound"));

const PerformanceMonitor = lazy(() => import("./pages/admin/PerformanceMonitor"));
const NeighborhoodGalleryAdmin = lazy(() => import("./pages/admin/NeighborhoodGalleryAdmin"));
const SerpPreviewPage = lazy(() => import("./pages/admin/SerpPreviewPage"));
const GscIndexingPage = lazy(() => import("./pages/admin/GscIndexingPage"));
const SeoDashboard = lazy(() => import("./pages/admin/SeoDashboard"));
const CompatibilityRulesAdmin = lazy(() => import("./pages/admin/CompatibilityRulesAdmin"));
const EstimatorFailuresAdmin = lazy(() => import("./pages/admin/EstimatorFailuresAdmin"));

const Borough = lazy(() => import("./pages/locations/Borough"));

const WoodSpecies = lazy(() => import("./pages/wood/WoodSpecies"));
const WoodSpeciesDetail = lazy(() => import("./pages/wood/WoodSpeciesDetail"));
const FinishesColors = lazy(() => import("./pages/wood/FinishesColors"));

const KitchenRenovationBrooklyn = lazy(() => import("./pages/guides/KitchenRenovationBrooklyn"));
const KitchenRenovationManhattan = lazy(() => import("./pages/guides/KitchenRenovationManhattan"));
const KitchenCabinetsStatenIsland = lazy(() => import("./pages/guides/KitchenCabinetsStatenIsland"));
const CustomKitchenCabinetsQueens = lazy(() => import("./pages/guides/CustomKitchenCabinetsQueens"));
const BestWoodForKitchenCabinets = lazy(() => import("./pages/guides/BestWoodForKitchenCabinets"));
const CabinetWoodTypesAndCosts = lazy(() => import("./pages/guides/CabinetWoodTypesAndCosts"));
const NaturalWoodKitchenCabinets = lazy(() => import("./pages/guides/NaturalWoodKitchenCabinets"));
const DoubleSinkVanityGuide = lazy(() => import("./pages/guides/DoubleSinkVanityGuide"));
const FloatingBathroomVanity = lazy(() => import("./pages/guides/FloatingBathroomVanity"));
const SmallBathroomVanityIdeas = lazy(() => import("./pages/guides/SmallBathroomVanityIdeas"));
const ReachInClosetSystemsNYC = lazy(() => import("./pages/guides/ReachInClosetSystemsNYC"));
const CustomVsSemiCustomCabinets = lazy(() => import("./pages/guides/CustomVsSemiCustomCabinets"));
const ShakerVsSlimShakerCabinets = lazy(() => import("./pages/guides/ShakerVsSlimShakerCabinets"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center" aria-busy="true" />
);

const App = () => {
  usePerformanceMonitor();
  useCompatibilityRulesSync();


  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HashScrollHandler />
        <ChunkErrorBoundary fallback={<RouteFallback />}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/designer" element={<VanityDesignerEmbed />} />
            <Route path="/room-designer" element={<Designer />} />
            <Route path="/estimator" element={<Estimator />} />
            <Route path="/estimator/quotes" element={<EstimatorSavedQuotes />} />
            <Route path="/vanity-configurator" element={<VanityConfiguratorPage />} />
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
            <Route path="/admin/compatibility" element={
              <AdminRoute>
                <CompatibilityRulesAdmin />
              </AdminRoute>
            } />
            <Route path="/admin/estimator-failures" element={
              <AdminRoute>
                <EstimatorFailuresAdmin />
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
            <Route path="/kitchen-renovation-manhattan" element={<KitchenRenovationManhattan />} />
            <Route path="/kitchen-cabinets-staten-island" element={<KitchenCabinetsStatenIsland />} />
            <Route path="/custom-kitchen-cabinets-queens" element={<CustomKitchenCabinetsQueens />} />

            <Route path="/custom-vs-semi-custom-cabinets" element={<CustomVsSemiCustomCabinets />} />
            <Route path="/shaker-vs-slim-shaker-cabinets" element={<ShakerVsSlimShakerCabinets />} />
            <Route path="/about" element={<About />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
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
        </ChunkErrorBoundary>
        <ScrollToTopButton />
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
