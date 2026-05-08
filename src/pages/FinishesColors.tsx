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
          content="Browse real laminate, melamine, and veneer panels from Tafisa, Shinnoki, Egger & Wilsonart. Save your favorites, share with friends, and request a quote."
        />
        <link rel="canonical" href="https://greencabinetsny.com/finishes-colors" />
      </Helmet>

      <Header />

      <main className="pt-32 sm:pt-36 md:pt-40">
        {/* Back link */}
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-2 pb-4">
          <Link
            to="/#finishes-colors"
            className="inline-flex items-center gap-2 text-sm text-[#5C7650] hover:text-[#445339] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
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
