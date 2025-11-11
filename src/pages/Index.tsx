import { Header, Footer } from "@/components/layout";
import { Hero, Services, Features, About, Gallery, Suppliers, CTA } from "@/components/marketing";
import { ShopProducts } from "@/features/product-catalog";
import { Contact } from "@/features/quote-request";
import { Chatbot } from "@/features/chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Features />
      <About />
      <Gallery />
      <Suppliers />
      <ShopProducts />
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
