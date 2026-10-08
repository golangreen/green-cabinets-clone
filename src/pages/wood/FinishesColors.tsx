/**
 * /finishes-colors — dedicated page for browsing real partner-brand panels
 * (Tafisa, Shinnoki, plus Egger & Wilsonart coming soon). Visitors can
 * tap to add finishes to a personal selection, then share the link, email
 * picks to themselves, or send them to Green Cabinets for a quote.
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MaterialsBrowser from "@/components/wood/MaterialsBrowser";
import SelectionDrawer from "@/components/wood/SelectionDrawer";
import PageHero from "@/components/lux/PageHero";
import ContactCta from "@/components/home/lux/ContactCta";
import { useLuxPage } from "@/hooks/useLuxPage";

const FinishesColors = () => {
  useLuxPage();
  return (
    <div className="min-h-dvh bg-ink text-ivory">
      <Helmet>
        <title>Finishes & Colors — Real Cabinet Panels | Green Cabinets NY</title>
        <meta
          name="description"
          content="Browse real laminate, veneer & stone panels from Tafisa, Shinnoki, Egger, Wilsonart, AGT & Raphael Stone. Save favorites and request a quote."
        />
        <link rel="canonical" href="https://greencabinetsny.com/finishes-colors" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://greencabinetsny.com/finishes-colors" />
        <meta property="og:title" content="Cabinet Finishes & Colors — Real Panels | Green Cabinets NY" />
        <meta property="og:description" content="Browse real laminate, veneer & stone panels from Tafisa, Shinnoki, Egger, Wilsonart, AGT & Raphael Stone. Save favorites and request a quote." />
        <meta property="og:image" content="https://greencabinetsny.com/og-cover.jpg" />
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

      <main>
        <PageHero
          crumbs={[{ label: "Home", to: "/" }, { label: "Materials", to: "/wood-species" }, { label: "Finishes & colors" }]}
          eyebrow="Real panels · real codes · real samples"
          title={
            <>
              Finishes you can <em className="italic text-brass">hold</em>.
            </>
          }
          lede={
            <>
              <p>
                The actual laminate, melamine and veneer panels we order from. Tap{" "}
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brass align-[-3px] text-xs text-ink">+</span>{" "}
                to save favorites, share the list with anyone, or send it to us for pricing. We bring the physical samples to you.
              </p>
              <p className="mt-5 text-sm">
                <Link to="/wood-species" className="lux-link text-ivory">Looking for solid hardwood? See the wood library</Link>
              </p>
            </>
          }
        />

        <section aria-labelledby="panels-title" className="border-t border-white/10">
          <h2 id="panels-title" className="sr-only">Finish panels</h2>
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-10" data-reveal="up">
            <MaterialsBrowser />
          </div>
        </section>

        <ContactCta />
      </main>

      <SelectionDrawer />
      <Footer />
    </div>
  );
};

export default FinishesColors;
