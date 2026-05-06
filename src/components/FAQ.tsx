import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What makes your custom kitchen cabinets in Brooklyn, Manhattan, and Queens different?",
    a: "Every project starts with a free in-home consultation across Brooklyn, Manhattan, Queens, and the wider New York area. Our custom kitchen cabinetry is designed, built, and finished in our Bushwick shop using FSC-certified hardwoods, low-VOC finishes, and European hardware — so you get a true one-of-a-kind kitchen that fits your space exactly.",
  },
  {
    q: "How much do custom kitchen cabinets in Brooklyn, Manhattan, and Queens cost?",
    a: "Pricing for our custom cabinetry solutions in Brooklyn, Manhattan, and Queens typically runs $350 per linear foot for full kitchens and vanities, $225/lf for base cabinets, and $125/lf for wall cabinets. A typical NYC kitchen ranges between $8,000 and $25,000+ depending on size, materials, and finishes.",
  },
  {
    q: "How long does a custom kitchen cabinetry project take in NYC?",
    a: "Most projects take 4–6 weeks from design approval to installation: 1–2 weeks for design and material selection, 2–3 weeks of in-shop fabrication, and 3–7 days for installation in your Brooklyn, Manhattan, or Queens home. We provide a clear timeline up front and keep you updated at every stage.",
  },
  {
    q: "Do you handle both kitchens and bathroom vanities?",
    a: "Yes. Many clients who renovate bathrooms also upgrade their kitchens with our custom cabinetry solutions in Brooklyn, Manhattan, and Queens. We design both as a coordinated package so finishes, hardware, and woodwork stay consistent across your home.",
  },
  {
    q: "Which Brooklyn, Manhattan, and Queens neighborhoods do you serve?",
    a: "We work throughout Brooklyn — Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick — across Manhattan (Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem), and Queens (Long Island City, Astoria, Forest Hills), plus the greater NYC metro area.",
  },
];

const FAQ = () => {
  return (
    <section
      id="faq"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#555555]">
              Answers about our custom kitchen cabinets in Brooklyn and Manhattan, New York — pricing, timelines, and process.
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
        </div>
      </div>
    </section>
  );
};

export default FAQ;
