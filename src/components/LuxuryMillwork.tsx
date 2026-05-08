import { ChefHat, DoorOpen, Layers, Building2, DraftingCompass, Building } from "lucide-react";

const offerings = [
  {
    icon: ChefHat,
    title: "Kitchens",
    description:
      "Bespoke shaker, slim shaker, and modern flat-panel kitchens built for Brooklyn brownstones, Manhattan condos, and Queens family homes.",
  },
  {
    icon: DoorOpen,
    title: "Closets",
    description:
      "Walk-in and reach-in closet systems with custom interiors, soft-close hardware, and integrated lighting.",
  },
  {
    icon: Layers,
    title: "Built-ins",
    description:
      "Living room media walls, home offices, libraries, and window seats designed to fit your space exactly.",
  },
  {
    icon: Building2,
    title: "Commercial Millwork",
    description:
      "Hospitality, retail, and office millwork — reception desks, paneling, and fixtures fabricated to spec.",
  },
  {
    icon: DraftingCompass,
    title: "Designers & Architects",
    description:
      "Trade pricing, shop drawings, and dependable lead times for design firms and architectural studios across NYC.",
  },
  {
    icon: Building,
    title: "Condo & Co-op Projects",
    description:
      "Building-approved installations with COIs, freight elevator scheduling, and tenant-friendly site protection.",
  },
];

const LuxuryMillwork = () => {
  return (
    <section
      id="luxury-millwork"
      className="py-16 sm:py-20 md:py-24 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            Luxury Custom Cabinets &amp; Millwork in NYC
          </h2>
          <p className="text-xl text-[#666666] leading-relaxed">
            From shaker and slim shaker kitchens to full commercial millwork
            packages, Green Cabinets delivers premium craftsmanship across
            Brooklyn, Manhattan, and Queens.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1a1a1a] mb-3">
                {item.title}
              </h3>
              <p className="text-[#666666] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryMillwork;
