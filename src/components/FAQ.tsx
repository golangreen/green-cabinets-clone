import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import QuoteForm from "@/components/QuoteForm";

const faqs = [
  {
    q: "What makes your custom kitchen cabinets in Brooklyn, Manhattan, and Queens different?",
    a: "Every project starts with a free in-home consultation across Brooklyn, Manhattan, Queens, and the wider New York area. Our custom kitchen cabinetry — from classic shaker and modern slim shaker to flat-panel — is designed, built, and finished in our Bushwick shop using FSC-certified hardwoods, low-VOC finishes, and European hardware, so you get a true one-of-a-kind kitchen that fits your space exactly.",
  },
  {
    q: "Do you build shaker and slim shaker cabinet doors?",
    a: "Yes. Shaker and slim shaker are two of our most-requested door styles for custom kitchen cabinets in Brooklyn, Manhattan, and Queens. Traditional shaker uses a wider 2.25\" rail and stile for a timeless look, while slim shaker uses a narrower ~1.5\" frame for a cleaner, more modern profile — both available in painted, stained, or natural finishes.",
  },
  {
    q: "How much do custom kitchen cabinets in Brooklyn, Manhattan, and Queens cost?",
    a: "Pricing for our custom cabinetry solutions in Brooklyn, Manhattan, and Queens typically runs $350 per linear foot for full kitchens and vanities (shaker, slim shaker, or flat-panel), $225/lf for base cabinets, and $125/lf for wall cabinets. A typical NYC kitchen ranges between $8,000 and $25,000+ depending on size, materials, and finishes.",
  },
  {
    q: "How long does a custom kitchen cabinetry project take in NYC?",
    a: "Most projects take 4–6 weeks from design approval to installation: 1–2 weeks for design and material selection, 2–3 weeks of in-shop fabrication, and 3–7 days for installation in your Brooklyn, Manhattan, or Queens home. We provide a clear timeline up front and keep you updated at every stage.",
  },
  {
    q: "Do you handle both kitchens and bathroom vanities?",
    a: "Yes. Many clients who renovate bathrooms also upgrade their kitchens with our custom cabinetry solutions in Brooklyn, Manhattan, and Queens. We design both as a coordinated package — matching shaker, slim shaker, or flat-panel doors — so finishes, hardware, and woodwork stay consistent across your home.",
  },
  {
    q: "Where do you source your materials?",
    a: "We source FSC-certified hardwoods (white oak, walnut, maple, cherry) from regional mills in the Northeast, formaldehyde-free plywood cores from North American manufacturers, and stone slabs hand-selected from NYC-area yards in Brooklyn and Queens. Hardware comes from Blum and Hettich, and finishes are low-VOC conversion varnishes — all chosen for durability, sustainability, and long-term performance in NYC homes.",
  },
  {
    q: "What does the fabrication timeline look like week by week?",
    a: "Week 1–2: design, material selection, and shop drawings. Week 3: CNC cutting of cabinet boxes and door components in our Bushwick shop. Week 4: assembly, sanding, and joinery. Week 5: spray finishing, drying, and final QC inspection. Week 6: delivery and installation in your Brooklyn, Manhattan, or Queens home. Most kitchens are complete 4–6 weeks from approved drawings.",
  },
  {
    q: "Do you provide Certificates of Insurance (COIs) for condo and co-op buildings?",
    a: "Yes. We carry general liability, workers' comp, and umbrella coverage and routinely issue building-specific COIs naming the building, managing agent, and board as additional insureds. We also handle alteration agreements, contractor registrations, and any building-required documentation across NYC condos and co-ops — typically turned around within 48 hours of request.",
  },
  {
    q: "How do you handle building noise rules and freight elevator scheduling?",
    a: "We schedule all loud work (drilling, sawing, anchoring) within your building's permitted hours — typically 9 AM to 5 PM weekdays — and coordinate freight elevator reservations directly with your super or managing agent. Quiet finish work (hardware, alignment, touch-ups) is done outside loud-work hours so we keep neighbors happy and stay on schedule.",
  },
  {
    q: "Which Brooklyn, Manhattan, and Queens neighborhoods do you serve?",
    a: "We work throughout Brooklyn — Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick — across Manhattan (Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem), and Queens (Long Island City, Astoria, Forest Hills), plus the greater NYC metro area.",
  },
];

const FAQ = () => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 md:py-24 bg-[#d5d5d5]"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#555555]">
              Answers about our custom kitchen cabinets in Brooklyn, Manhattan, and Queens, New York — pricing, timelines, and process.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-background rounded-lg border border-border px-5"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-[#1a1a1a] hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#555555] text-base leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-[#555555] mb-4">Still have questions about your project?</p>
            <Button
              size="lg"
              onClick={() => setQuoteOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
            >
              Request a Quote
            </Button>
          </div>
        </div>
      </div>

      <QuoteForm isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </section>
  );
};

export default FAQ;
