import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Features from "@/components/Features";
import About from "@/components/About";
import Suppliers from "@/components/Suppliers";
import Contact from "@/components/Contact";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

// Lazy load heavy components
const Gallery = lazy(() => import("@/components/Gallery"));
const ShopProducts = lazy(() => import("@/components/ShopProducts").then(m => ({ default: m.ShopProducts })));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Green Cabinets | Custom Kitchen & Bathroom Millwork Brooklyn, NY</title>
        <meta name="description" content="Custom kitchen cabinets, bathroom vanities & sustainable millwork in Bushwick, Brooklyn. European-quality craftsmanship with eco-friendly materials. Free quotes available." />
        <link rel="canonical" href="https://greencabinetsny.com" />
        <meta property="og:title" content="Green Cabinets | Custom Kitchen & Bathroom Millwork Brooklyn, NY" />
        <meta property="og:description" content="Custom kitchen cabinets, bathroom vanities & sustainable millwork in Bushwick, Brooklyn." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://greencabinetsny.com" />
      </Helmet>
      <Header />
      <Hero />
      <Services />
      <Features />
      <About />
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <Gallery />
      </Suspense>
      <Suppliers />
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <ShopProducts />
      </Suspense>
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
