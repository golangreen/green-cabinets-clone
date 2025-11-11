import { Header, Footer, FeatureErrorBoundary, OfflineBanner, SyncStatusIndicator } from "@/components/layout";
import { Hero, Services, Features, About, Gallery, Suppliers, CTA } from "@/components/marketing";
import { ShopProducts } from "@/features/product-catalog";
import { Contact } from "@/features/quote-request";
import { Chatbot } from "@/features/chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <SyncStatusIndicator />
      <Header />
      <Hero />
      <div className="bg-[#fafafa]">
        <Services />
        <Features />
        <About />
      </div>
      <Gallery />
      <div className="bg-[#fafafa]">
        <FeatureErrorBoundary
          featureName="Product Catalog"
          featureTag="shop-products"
          fallbackRoute="/"
        >
          <ShopProducts />
        </FeatureErrorBoundary>
        <Suppliers />
        <Contact />
      </div>
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
