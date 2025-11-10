import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Features from "@/components/Features";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Suppliers from "@/components/Suppliers";
import { ShopProducts } from "@/components/ShopProducts";
import Contact from "@/components/Contact";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Features />
      <About />
      <Gallery />
      <ShopProducts />
      <Suppliers />
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
