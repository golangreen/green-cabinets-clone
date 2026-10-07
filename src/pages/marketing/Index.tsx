import { useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FAQ from "@/components/home/FAQ";
import SelectedWork from "@/components/home/lux/SelectedWork";
import Audiences from "@/components/home/lux/Audiences";
import Process from "@/components/home/lux/Process";
import Pricing from "@/components/home/lux/Pricing";
import Buildings from "@/components/home/lux/Buildings";
import Materials from "@/components/home/lux/Materials";
import Areas from "@/components/home/lux/Areas";
import ContactCta from "@/components/home/lux/ContactCta";
import MobileActionBar from "@/components/home/lux/MobileActionBar";
import { useReveal } from "@/hooks/useReveal";

const Index = () => {
  // Dark luxury theme for this page (layout effect: no light flash on load)
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-lux");
    return () => root.classList.remove("theme-lux");
  }, []);
  useReveal();
  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Bespoke European Cabinetry NYC | Green Cabinets NY</title>
        <meta name="title" content="Bespoke European Cabinetry & Luxury Kitchens NYC | Green Cabinets" />
        <meta name="description" content="Bespoke European cabinetry and luxury custom kitchens for Brooklyn, Manhattan & Queens. Designed in Bushwick since 2009 — vanities, closets, millwork. Free design consult." />

        <meta name="keywords" content="custom kitchen cabinets in Brooklyn, custom kitchen cabinets Manhattan, custom kitchen cabinets Queens, shaker cabinets NYC, slim shaker cabinets, shaker kitchen cabinets Brooklyn, bathroom vanities NYC, custom cabinetry Brooklyn, kitchen cabinets New York, closet systems Brooklyn, cabinet maker Brooklyn, sustainable cabinets NYC" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Green Cabinets NY" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://greencabinetsny.com/" />
        <meta property="og:title" content="Bespoke European Cabinetry & Luxury Kitchens in NYC | Green Cabinets NY" />
        <meta property="og:description" content="Bespoke European cabinetry, luxury custom kitchens, vanities and millwork designed in Bushwick for Brooklyn, Manhattan and Queens homes since 2009." />
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
        <meta name="twitter:description" content="Custom shaker & slim shaker kitchen cabinets, bathroom vanities & millwork designed in Bushwick for NYC homes since 2009." />
        <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />
        <meta name="twitter:image:alt" content="Sage green shaker kitchen cabinets with marble countertops in a Brooklyn brownstone — Green Cabinets NY" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://greencabinetsny.com/" />

        {/* LocalBusiness, Service, and Product schemas are provided site-wide via index.html */}

      </Helmet>
      <Header />
      <main>
        <Hero />
        <SelectedWork />
        <Audiences />
        <Process />
        <Pricing />
        <Buildings />
        <Materials />
        <Areas />
        <FAQ />
        <ContactCta />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
};

export default Index;
