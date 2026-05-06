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
        <meta name="keywords" content="custom kitchen cabinets in Brooklyn, custom kitchen cabinets Manhattan, custom kitchen cabinets Queens, bathroom vanities NYC, custom cabinetry Brooklyn, kitchen cabinets New York, closet systems Brooklyn, cabinet maker Brooklyn, sustainable cabinets NYC" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://greencabinetsny.com/" />
        <meta property="og:title" content="Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY" />
        <meta property="og:description" content="Custom kitchen cabinets in Brooklyn, Manhattan, and Queens. Premium bathroom vanities & sustainable millwork. Expert craftsmanship since 2009." />
        <meta property="og:image" content="https://greencabinetsny.com/images/green-cabinets-og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://greencabinetsny.com/" />
        <meta property="twitter:title" content="Custom Kitchen Cabinets in Brooklyn, Manhattan & Queens | Green Cabinets NY" />
        <meta property="twitter:description" content="Custom kitchen cabinets in Brooklyn, Manhattan, and Queens. Premium bathroom vanities & sustainable millwork since 2009." />
        <meta property="twitter:image" content="https://greencabinetsny.com/images/green-cabinets-twitter-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://greencabinetsny.com/" />

        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://greencabinetsny.com",
            "name": "Green Cabinets NY",
            "image": "https://greencabinetsny.com/images/logo.jpg",
            "description": "Premium custom kitchen cabinets, bathroom vanities, and closet systems in Brooklyn, NYC. Eco-friendly materials and expert craftsmanship since 2009.",
            "url": "https://greencabinetsny.com",
            "telephone": "+1-718-804-5488",
            "email": "orders@greencabinetsny.com",
            "priceRange": "$$-$$$",
            "foundingDate": "2009",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1160 Broadway",
              "addressLocality": "Brooklyn",
              "addressRegion": "NY",
              "postalCode": "11221",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "40.6782",
              "longitude": "-73.9442"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "18:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "09:00",
                "closes": "15:00"
              }
            ],
            "sameAs": [
              "https://www.instagram.com/greencabinetsny"
            ],
            "areaServed": [
              { "@type": "City", "name": "Brooklyn" },
              { "@type": "City", "name": "Manhattan" },
              { "@type": "City", "name": "Queens" }
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Custom Cabinetry Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Custom Kitchen Cabinets",
                    "description": "Professional custom kitchen cabinet design and installation for Brooklyn and NYC homes"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Bathroom Vanities",
                    "description": "Custom bathroom vanity design and installation with premium materials"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Closet Systems",
                    "description": "Custom closet organization systems for maximum storage efficiency"
                  }
                }
              ]
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
