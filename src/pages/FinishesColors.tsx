/**
 * /finishes-colors — dedicated page for browsing real partner-brand panels
 * (Tafisa, Shinnoki, plus Egger & Wilsonart coming soon). Visitors can
 * tap to add finishes to a personal selection, then share the link, email
 * picks to themselves, or send them to Green Cabinets for a quote.
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaterialsBrowser from "@/components/wood/MaterialsBrowser";
import SelectionDrawer from "@/components/wood/SelectionDrawer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

const FinishesColors = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Finishes & Colors — Real Cabinet Panels | Green Cabinets NY</title>
        <meta
          name="description"
          content="Browse real laminate, veneer & stone panels from Tafisa, Shinnoki, Egger, Wilsonart, AGT & Raphael Stone. Save favorites and request a quote."
        />
        <link rel="canonical" href="https://greencabinetsny.com/finishes-colors" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to Choose Cabinet Finishes and Colors",
          description:
            "A 5-step process for picking laminate, melamine, veneer, or painted finishes for custom kitchen and vanity cabinets — using real partner panels from Tafisa, Shinnoki, Egger, Wilsonart, AGT, and Raphael Stone.",
          totalTime: "PT45M",
          tool: [
            { "@type": "HowToTool", name: "Real partner-brand sample panels" },
            { "@type": "HowToTool", name: "Selection drawer (save, share, send for quote)" },
          ],
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Decide on the finish category",
              text: "Laminate (TFL/HPL) is the most durable and budget-friendly. Veneer gives real wood grain over a stable substrate. Painted maple is classic for shaker kitchens. Stone-look panels (Raphael Stone, AGT) work for modern slab fronts.",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Pick a color temperature that matches your light",
              text: "North-facing NYC apartments read cooler — warm whites, oak, and walnut compensate. South-facing rooms can handle cool greys, true whites, and high-contrast palettes. View samples in your actual kitchen at morning and evening.",
              url: "https://greencabinetsny.com/finishes-colors",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Limit yourself to 2–3 finishes per kitchen",
              text: "Most successful kitchens use one dominant finish (perimeter), one accent (island or tall pantry), and an optional third for open shelving or interiors. More than three reads busy fast.",
            },
            {
              "@type": "HowToStep",
              position: 4,
              name: "Save favorites and compare side-by-side",
              text: "Tap the + on any panel to add it to your selection drawer, then open the drawer to compare picks side by side. You can share the link with a partner or designer before committing.",
              url: "https://greencabinetsny.com/finishes-colors",
            },
            {
              "@type": "HowToStep",
              position: 5,
              name: "Send your shortlist for pricing and physical samples",
              text: "Email your saved selection to Green Cabinets NY for accurate per-linear-foot pricing and to request physical sample panels shipped to your address before final approval.",
              url: "https://greencabinetsny.com/",
            },
          ],
        })}</script>
      </Helmet>

      <Header />

      <main className="pt-32 sm:pt-36 md:pt-40">
        {/* Back link — sticky on mobile so it's always reachable */}
        <div className="sticky top-24 sm:top-32 md:top-40 z-40 bg-background/85 backdrop-blur-md border-b border-border/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-2 md:py-3">
            <button
              type="button"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")}
              className="inline-flex items-center gap-2 text-sm text-[#5C7650] hover:text-[#445339] font-medium transition-colors active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-[#d5d5d5] py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
              Real Panels · Real Codes · Real Samples
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
              Finishes &amp; Colors
            </h1>
            <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
              Browse the actual laminate, melamine, and veneer panels we order from. Tap{" "}
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#5C7650] text-white text-xs">+</span>{" "}
              to save favorites, then share the link with anyone — or send your picks to us for pricing.
            </p>
          </div>
        </section>

        {/* Browser */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <MaterialsBrowser />
          </div>
        </section>

        {/* Cross-link to wood species */}
        <section className="py-12 sm:py-16 bg-[#f5f5f5]">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-3">
              Looking for solid hardwood?
            </h2>
            <p className="text-[#555] mb-5">
              See our full guide to oak, maple, walnut and other solid wood species.
            </p>
            <Button asChild className="bg-[#5C7650] hover:bg-[#445339]">
              <Link to="/wood-species">
                Explore Wood Species
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SelectionDrawer />
      <Footer />
    </div>
  );
};

export default FinishesColors;
