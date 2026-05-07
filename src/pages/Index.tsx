import { lazy, Suspense } from "react";
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

// Lazy load heavy components
const Gallery = lazy(() => import("@/components/Gallery"));
const ShopProducts = lazy(() => import("@/components/ShopProducts").then(m => ({ default: m.ShopProducts })));

const Index = () => {
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

        {/* LocalBusiness schema is provided site-wide via index.html */}

        {/* Service Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                "@id": "https://greencabinetsny.com/#service-kitchen",
                "serviceType": "Custom Kitchen Cabinets",
                "name": "Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens",
                "description": "Bespoke kitchen cabinetry designed, built, and installed in NYC. Shaker, slim shaker, and modern styles using FSC-certified hardwoods and low-VOC finishes.",
                "provider": { "@type": "LocalBusiness", "@id": "https://greencabinetsny.com" },
                "areaServed": [
                  { "@type": "City", "name": "Brooklyn" },
                  { "@type": "City", "name": "Manhattan" },
                  { "@type": "City", "name": "Queens" }
                ],
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "USD",
                  "price": "350",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "350",
                    "priceCurrency": "USD",
                    "unitText": "linear foot"
                  },
                  "url": "https://greencabinetsny.com/"
                }
              },
              {
                "@type": "Service",
                "@id": "https://greencabinetsny.com/#service-vanity",
                "serviceType": "Custom Bathroom Vanities",
                "name": "Custom Bathroom Vanities NYC",
                "description": "Made-to-measure bathroom vanities with premium materials and hardware, designed and installed throughout NYC.",
                "provider": { "@type": "LocalBusiness", "@id": "https://greencabinetsny.com" },
                "areaServed": [
                  { "@type": "City", "name": "Brooklyn" },
                  { "@type": "City", "name": "Manhattan" },
                  { "@type": "City", "name": "Queens" }
                ],
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "USD",
                  "price": "350",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "350",
                    "priceCurrency": "USD",
                    "unitText": "linear foot"
                  },
                  "url": "https://greencabinetsny.com/"
                }
              },
              {
                "@type": "Service",
                "@id": "https://greencabinetsny.com/#service-closets",
                "serviceType": "Custom Closet Systems",
                "name": "Custom Closet Systems Brooklyn & NYC",
                "description": "Custom closet organization and built-in storage systems engineered for NYC apartments and brownstones.",
                "provider": { "@type": "LocalBusiness", "@id": "https://greencabinetsny.com" },
                "areaServed": [
                  { "@type": "City", "name": "Brooklyn" },
                  { "@type": "City", "name": "Manhattan" },
                  { "@type": "City", "name": "Queens" }
                ]
              }
            ]
          })}
        </script>

        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Custom Shaker Kitchen Cabinets",
            "image": "https://greencabinetsny.com/og-image.jpg",
            "description": "Handcrafted custom shaker kitchen cabinets built in Brooklyn using FSC-certified hardwoods, low-VOC finishes, and Blum/Hettich European hardware.",
            "brand": { "@type": "Brand", "name": "Green Cabinets NY" },
            "category": "Kitchen Cabinets",
            "manufacturer": { "@type": "Organization", "name": "Green Cabinets NY" },
            "offers": {
              "@type": "Offer",
              "url": "https://greencabinetsny.com/",
              "priceCurrency": "USD",
              "price": "350",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "350",
                "priceCurrency": "USD",
                "unitText": "linear foot"
              },
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition",
              "seller": { "@type": "LocalBusiness", "@id": "https://greencabinetsny.com/#localbusiness" }
            },
            "review": [{
              "@type": "Review",
              "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" },
              "author": { "@type": "Person", "name": "Rebecca M." },
              "reviewBody": "Our co-op board is notoriously tough on contractors, but Green Cabinets handled the COI, alteration agreement, and freight elevator scheduling without us lifting a finger. Install was spotless."
            }],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "6",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What makes your custom kitchen cabinets in Brooklyn, Manhattan, and Queens different?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Every project starts with a free in-home consultation across Brooklyn, Manhattan, Queens, and the wider New York area. Our custom kitchen cabinetry is designed, built, and finished in our Bushwick shop using FSC-certified hardwoods, low-VOC finishes, and European hardware."
                }
              },
              {
                "@type": "Question",
                "name": "How much do custom kitchen cabinets in Brooklyn, Manhattan, and Queens cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pricing for our custom cabinetry solutions in Brooklyn, Manhattan, and Queens typically runs $350 per linear foot for full kitchens and vanities, $225/lf for base cabinets, and $125/lf for wall cabinets. A typical NYC kitchen ranges between $8,000 and $25,000+."
                }
              },
              {
                "@type": "Question",
                "name": "How long does a custom kitchen cabinetry project take in NYC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most projects take 4–6 weeks: 1–2 weeks for design, 2–3 weeks of in-shop fabrication, and 3–7 days for installation in your Brooklyn, Manhattan, or Queens home."
                }
              },
              {
                "@type": "Question",
                "name": "Do you handle both kitchens and bathroom vanities?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Many clients who renovate bathrooms also upgrade their kitchens with our custom cabinetry solutions in Brooklyn, Manhattan, and Queens, designed as a coordinated package."
                }
              },
              {
                "@type": "Question",
                "name": "Where do you source your materials?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FSC-certified hardwoods from Northeast mills, formaldehyde-free plywood cores, NYC-area stone slabs, Blum and Hettich hardware, and low-VOC conversion varnish finishes."
                }
              },
              {
                "@type": "Question",
                "name": "What does the fabrication timeline look like?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "4–6 weeks total: design and shop drawings (1–2 weeks), CNC cutting and assembly (2 weeks), spray finishing and QC (1 week), then delivery and installation in your NYC home."
                }
              },
              {
                "@type": "Question",
                "name": "Do you provide Certificates of Insurance (COIs) for condo and co-op buildings?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We carry general liability, workers' comp, and umbrella coverage and routinely issue building-specific COIs and alteration agreements within 48 hours for NYC condos and co-ops."
                }
              },
              {
                "@type": "Question",
                "name": "How do you handle building noise rules and freight elevator scheduling?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Loud work is scheduled within building-permitted hours (typically 9 AM–5 PM weekdays), freight elevators are reserved with the super or managing agent, and quiet finish work is done outside loud-work windows."
                }
              },
              {
                "@type": "Question",
                "name": "Which Brooklyn, Manhattan, and Queens neighborhoods do you serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We work throughout Brooklyn — Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick — across Manhattan (Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem), and Queens (Long Island City, Astoria, Forest Hills), plus the greater NYC metro area."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <Header />
      <SpringPromotion />
      <Hero />
      <Services />
      <LuxuryMillwork />
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
    </div>
  );
};

export default Index;
