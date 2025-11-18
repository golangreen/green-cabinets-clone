import { PublicLayout, FeatureErrorBoundary } from "@/components/layout";
import { Hero, Services, Features, About, Gallery, Suppliers, CTA } from "@/features/marketing";
import { ShopProducts } from "@/features/product-catalog";
import { Contact } from "@/features/quote-request";
import { Chatbot } from "@/features/chatbot";

const Index = () => {
  return (
    <PublicLayout>
      <Hero />
      <div className="bg-brand-gray">
        <Services />
        <Features />
        <About />
      </div>
      <Gallery />
      <div className="bg-brand-gray">
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
      <Chatbot />
    </PublicLayout>
  );
};

export default Index;
