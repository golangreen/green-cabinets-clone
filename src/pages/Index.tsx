import { lazy, Suspense, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SpringPromotion from "@/components/SpringPromotion";
import Services from "@/components/Services";
import Features from "@/components/Features";
import About from "@/components/About";
import Suppliers from "@/components/Suppliers";
import Contact from "@/components/Contact";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import FAQ from "@/components/FAQ";
import NeighborhoodsServed from "@/components/NeighborhoodsServed";
import LuxuryMillwork from "@/components/LuxuryMillwork";
import LuxuryMillworkGallery from "@/components/LuxuryMillworkGallery";
import QualityCraftsmanship from "@/components/QualityCraftsmanship";
import Testimonials from "@/components/Testimonials";
import WoodSpeciesTeaser from "@/components/WoodSpeciesTeaser";
import FinishesColorsSection from "@/components/FinishesColorsSection";
import ScrollEnhancements from "@/components/ScrollEnhancements";

// Lazy load heavy components
const Gallery = lazy(() => import("@/components/Gallery"));
const ShopProducts = lazy(() => import("@/components/ShopProducts").then(m => ({ default: m.ShopProducts })));

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add("snap-home");
    return () => document.documentElement.classList.remove("snap-home");
  }, []);
  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY</title>
        <meta name="title" content="Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY" />
        <meta name="description" content="Custom kitchen cabinets in Brooklyn, Manhattan, and Queens since 2009. Premium bathroom vanities, closet systems & sustainable millwork for NYC homeowners, architects & developers. Free consultation: (718) 804-5488." />
        <meta name="keywords" content="custom kitchen cabinets in Brooklyn, custom kitchen cabinets Manhattan, custom kitchen cabinets Queens, shaker cabinets NYC, slim shaker cabinets, shaker kitchen cabinets Brooklyn, bathroom vanities NYC, custom cabinetry Brooklyn, kitchen cabinets New York, closet systems Brooklyn, cabinet maker Brooklyn, sustainable cabinets NYC" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Green Cabinets NY" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://greencabinetsny.com/" />
        <meta property="og:title" content="Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY" />
        <meta property="og:description" content="Custom shaker & slim shaker kitchen cabinets in Brooklyn, Manhattan, and Queens since 2009. Premium bathroom vanities, closets & millwork built in Bushwick. Free consultation." />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://greencabinetsny.com/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1216" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content="Sage green shaker kitchen cabinets with marble countertops in a Brooklyn brownstone — Green Cabinets NY" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@GreenGr63406" />
        <meta name="twitter:creator" content="@GreenGr63406" />
        <meta name="twitter:domain" content="greencabinetsny.com" />
        <meta name="twitter:url" content="https://greencabinetsny.com/" />
        <meta name="twitter:title" content="Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY" />
        <meta name="twitter:description" content="Custom shaker & slim shaker kitchen cabinets, bathroom vanities & millwork built in Bushwick for NYC homes since 2009." />
        <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="Sage green shaker kitchen cabinets with marble countertops in a Brooklyn brownstone — Green Cabinets NY" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://greencabinetsny.com/" />

        {/* LocalBusiness, Service, and Product schemas are provided site-wide via index.html */}

      </Helmet>
      <Header />
      <SpringPromotion />
      <Hero />
      <Services />
      <LuxuryMillwork />
      <FinishesColorsSection />
      <LuxuryMillworkGallery />
      <QualityCraftsmanship />
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
      <WoodSpeciesTeaser />
      <NeighborhoodsServed />
      <Testimonials />
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <ShopProducts />
      </Suspense>
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
      <ScrollEnhancements />
    </div>
  );
};

export default Index;
