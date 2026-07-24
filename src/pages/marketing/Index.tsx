import { Suspense, useEffect } from "react";
import { lazyWithReload as lazy } from "@/lib/lazyWithReload";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Features from "@/components/home/Features";
import About from "@/components/home/About";
import Suppliers from "@/components/home/Suppliers";
import Contact from "@/components/home/Contact";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";

import FAQ from "@/components/home/FAQ";
import NeighborhoodsServed from "@/components/home/NeighborhoodsServed";
import LuxuryMillwork from "@/components/home/LuxuryMillwork";
import LuxuryMillworkGallery from "@/components/home/LuxuryMillworkGallery";
import QualityCraftsmanship from "@/components/home/QualityCraftsmanship";
import Testimonials from "@/components/home/Testimonials";
import WoodSpeciesTeaser from "@/components/home/WoodSpeciesTeaser";
import FinishesColorsSection from "@/components/home/FinishesColorsSection";


// Lazy load heavy components
const Gallery = lazy(() => import("@/components/home/Gallery"));
const ShopProducts = lazy(() => import("@/components/shop/ShopProducts").then(m => ({ default: m.ShopProducts })));

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add("snap-home");
    return () => document.documentElement.classList.remove("snap-home");
  }, []);
  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Custom Cabinets Brooklyn & NYC | Green Cabinets NY</title>
        <meta name="title" content="Custom Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets" />
        <meta name="description" content="Custom kitchen cabinets in Brooklyn, Manhattan & Queens since 2009. Vanities, closets & sustainable millwork built in Bushwick. Free consult: (718) 804-5488." />
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
      <main>
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
      </main>
      <Footer />
      
    </div>
  );
};

export default Index;
