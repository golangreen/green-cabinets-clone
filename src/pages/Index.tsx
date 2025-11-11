import { Header, Footer, FeatureErrorBoundary, OfflineBanner } from "@/components/layout";
import { Hero, Services, Features, About, Gallery, Suppliers, CTA } from "@/components/marketing";
import { ShopProducts } from "@/features/product-catalog";
import { Contact } from "@/features/quote-request";
import { Chatbot } from "@/features/chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <OfflineBanner />
      <Header />
      <Hero />
      <Services />
      <Features />
      <About />
      <Gallery />
      <Suppliers />
      <FeatureErrorBoundary
        featureName="Product Catalog"
        featureTag="shop-products"
        fallbackRoute="/"
      >
        <ShopProducts />
      </FeatureErrorBoundary>
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
