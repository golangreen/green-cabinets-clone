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

// Lazy load heavy components
const Gallery = lazy(() => import("@/components/Gallery"));
const ShopProducts = lazy(() => import("@/components/ShopProducts").then(m => ({ default: m.ShopProducts })));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Custom Kitchen Cabinets Brooklyn NYC | Green Cabinets NY</title>
        <meta name="title" content="Custom Kitchen Cabinets Brooklyn NYC | Green Cabinets NY" />
        <meta name="description" content="Premium custom kitchen cabinets, bathroom vanities & closet systems in Brooklyn, NYC. Expert craftsmanship since 2009. Eco-friendly materials. Serving developers, architects & homeowners. Free consultation (718) 804-5488." />
        <meta name="keywords" content="custom kitchen cabinets Brooklyn, bathroom vanities NYC, custom cabinetry Brooklyn, kitchen cabinets New York, closet systems Brooklyn, cabinet maker Brooklyn, sustainable cabinets NYC" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://greencabinetsny.com/" />
        <meta property="og:title" content="Custom Kitchen Cabinets Brooklyn NYC | Green Cabinets NY" />
        <meta property="og:description" content="Premium custom kitchen cabinets, bathroom vanities & closet systems in Brooklyn, NYC. Expert craftsmanship since 2009." />
        <meta property="og:image" content="https://greencabinetsny.com/images/green-cabinets-og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://greencabinetsny.com/" />
        <meta property="twitter:title" content="Custom Kitchen Cabinets Brooklyn NYC | Green Cabinets NY" />
        <meta property="twitter:description" content="Premium custom kitchen cabinets, bathroom vanities & closet systems in Brooklyn, NYC." />
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
                "name": "How much do custom kitchen cabinets cost in Brooklyn?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Custom kitchen cabinets in Brooklyn typically range from $8,000 to $25,000+ depending on materials, size, and design complexity. We offer free consultations to provide accurate quotes based on your specific needs and budget."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to install custom cabinets?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Custom cabinet installation typically takes 2-4 weeks from design approval to completion. This includes manufacturing time (1-2 weeks) and professional installation (3-7 days). Timeline may vary based on project complexity."
                }
              },
              {
                "@type": "Question",
                "name": "Do you offer eco-friendly cabinet materials?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We specialize in sustainable cabinetry using FSC-certified hardwoods, low-VOC finishes, bamboo, and recycled materials. All our products prioritize environmental responsibility without compromising quality."
                }
              },
              {
                "@type": "Question",
                "name": "What areas in NYC do you serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We serve all of Brooklyn including Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, and surrounding neighborhoods. We also work in Manhattan, Queens, and throughout the NYC metro area."
                }
              },
              {
                "@type": "Question",
                "name": "Do you work with architects and developers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! We have extensive experience collaborating with architects, interior designers, and developers on residential and commercial projects throughout Brooklyn and NYC. We provide detailed drawings and work closely with your team."
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
