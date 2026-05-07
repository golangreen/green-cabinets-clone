import {
  Hammer,
  Wrench,
  Palette,
  SlidersHorizontal,
  TreePine,
  Factory,
  Ruler,
  Building2,
} from "lucide-react";

const pillars = [
  {
    icon: Hammer,
    title: "Cabinet Construction Quality",
    description:
      "Solid plywood boxes, dadoed joinery, and dovetailed drawers built to outlast the building they're installed in.",
  },
  {
    icon: Wrench,
    title: "Hardware",
    description:
      "Blum and Hettich soft-close hinges, slides, and lift mechanisms — the same hardware specified by top European cabinetmakers.",
  },
  {
    icon: Palette,
    title: "Finishes",
    description:
      "Low-VOC conversion varnishes, hand-rubbed stains, and factory-grade lacquers in any custom color or sheen.",
  },
  {
    icon: SlidersHorizontal,
    title: "Drawers & Slides",
    description:
      "Full-extension undermount slides rated for 100+ lbs, with optional servo-drive push-to-open on handle-less designs.",
  },
  {
    icon: TreePine,
    title: "Material Sourcing",
    description:
      "FSC-certified hardwoods, formaldehyde-free plywood cores, and stone slabs hand-selected from NYC-area yards.",
  },
  {
    icon: Factory,
    title: "Fabrication Process",
    description:
      "CNC-cut precision combined with hand-finishing in our Bushwick shop — every panel inspected before it ships.",
  },
  {
    icon: Ruler,
    title: "Installation Precision",
    description:
      "Laser-leveled scribes to crooked pre-war walls, shimmed bases, and seamless filler work for a built-in-from-day-one fit.",
  },
  {
    icon: Building2,
    title: "NYC Condo & Co-op Expertise",
    description:
      "We handle COIs, alteration agreements, freight elevator scheduling, and quiet-hours compliance for boards across NYC.",
  },
];

const QualityCraftsmanship = () => {
  return (
    <section
      id="quality-craftsmanship"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Built Right, From Sourcing to Install
          </h2>
          <p className="text-lg text-[#555555] leading-relaxed">
            Eight pillars of craftsmanship behind every Green Cabinets project — engineered for NYC homes, buildings, and timelines.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-2">
                {p.title}
              </h3>
              <p className="text-[#666666] text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QualityCraftsmanship;
