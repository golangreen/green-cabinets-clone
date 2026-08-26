import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { X } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const FAQS = [
  {
    q: "How much does a custom bathroom vanity cost in NYC?",
    a: "Our custom vanities start around $225 per linear foot for base cabinets and $350 per linear foot for a full vanity, depending on the panel brand, hardware and drawer configuration. The designer shows a live price as you change dimensions and finishes, so you see the number before you ever talk to us.",
  },
  {
    q: "Can you build a vanity to an exact, non-standard size?",
    a: "Yes — everything is built to the inch. Prewar Brooklyn and Manhattan bathrooms are rarely square, so we cut width, depth and height to your measurements and notch the top drawer around the P-trap, S-trap or bottle trap you select.",
  },
  {
    q: "Which areas do you serve?",
    a: "Brooklyn, Manhattan and Queens, by appointment. We design and specify with vetted millwork suppliers, then measure and install on site — there is no walk-in showroom.",
  },
  {
    q: "What do I get after I submit my design?",
    a: "You get an emailed quote with a rendering of your vanity, an itemized price, and the U-cut spec sheet with plumbing notch measurements and trap diagrams — the same drawings used to build it. You can also print the spec sheet directly from the tool.",
  },
  {
    q: "Do I have to buy anything to use the designer?",
    a: "No. The 3D designer is free and requires no account. You only share your name, email, phone and borough when you ask us to email you the quote.",
  },
];

const IFRAME_SRC = "/vanity-designer.html";

const VanityDesignerEmbed = () => {
  const isMobile = useIsMobile();
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Custom Bathroom Vanity Designer NYC | Live Price | Green Cabinets</title>
        <meta
          name="description"
          content="Design a custom bathroom vanity built to the inch, with a live price. Real panel finishes, plumbing U-cut specs. Brooklyn, Manhattan & Queens by appointment."
        />
        <link rel="canonical" href="https://greencabinetsny.com/designer" />
        <meta property="og:title" content="Custom Bathroom Vanity Designer NYC | Live Price" />
        <meta
          property="og:description"
          content="Free 3D vanity designer: built to the inch, real finishes, instant pricing. Brooklyn, Manhattan & Queens by appointment."
        />
        <meta property="og:url" content="https://greencabinetsny.com/designer" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index,follow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#d5d5d5]">
        <Header />
        <main className="flex-1 pt-[96px] sm:pt-[128px] md:pt-[160px] pb-10">
          <div className="container mx-auto px-4">
            {/* Crawlable intro */}
            <section className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-foreground">
                Custom Bathroom Vanity Designer — NYC
              </h1>
              <p className="mt-4 text-base sm:text-lg text-foreground/80 leading-relaxed">
                Design your own custom bathroom vanity, built to the inch for your New York
                bathroom, and watch the <strong>live price</strong> update as you go. Pick real
                panel finishes from Tafisa, Egger, Shinnoki, Wilsonart and AGT, set exact width,
                depth and height, choose doors or drawers, and see the plumbing notch cut around
                your P-trap, S-trap or bottle trap.
              </p>
              <p className="mt-4 text-base text-foreground/80 leading-relaxed">
                Every vanity is designed and specified with vetted millwork suppliers, then measured
                and installed on site in <strong>Brooklyn, Manhattan and Queens — by appointment</strong>.
                No showroom visit, no sales pressure: finish your design, email yourself the quote,
                and keep the printable U-cut spec sheet with full build measurements.
              </p>
              <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2 text-sm text-foreground/80">
                <li>• Built to the inch — non-standard prewar sizes welcome</li>
                <li>• Live pricing per linear foot, itemized</li>
                <li>• 200+ real panel colors and wood finishes</li>
                <li>• Shop drawings with plumbing U-cut measurements</li>
              </ul>
            </section>

            {/* Tool */}
            <section className="mt-10" aria-label="3D vanity designer">
              {isMobile ? (
                <div className="mx-auto max-w-xl rounded-2xl border border-border bg-background p-6 text-center shadow-xl">
                  <h2 className="text-xl font-semibold text-foreground">Open the 3D designer</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The designer opens full screen on your phone so it scrolls and rotates properly.
                    Tap the X to come back to this page.
                  </p>
                  <Button
                    size="lg"
                    className="mt-5 w-full"
                    onClick={() => setFullscreen(true)}
                  >
                    Launch vanity designer
                  </Button>
                </div>
              ) : (
                <div className="mx-auto max-w-[1280px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
                  <iframe
                    src={IFRAME_SRC}
                    title="Custom bathroom vanity 3D designer"
                    className="block w-full border-0"
                    style={{ height: "calc(100vh - 200px)", minHeight: 680 }}
                    allow="clipboard-write; fullscreen"
                  />
                </div>
              )}
            </section>

            {/* FAQ */}
            <section className="mx-auto mt-14 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">
                Vanity designer FAQ
              </h2>
              <div className="mt-6 space-y-3">
                {FAQS.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-xl border border-border bg-background p-5"
                  >
                    <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:hidden">
                      {f.q}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile fullscreen tool */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-background">
          <iframe
            src={IFRAME_SRC}
            title="Custom bathroom vanity 3D designer"
            className="h-full w-full border-0"
            style={{ height: "100dvh" }}
            allow="clipboard-write; fullscreen"
          />
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close the vanity designer"
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default VanityDesignerEmbed;
