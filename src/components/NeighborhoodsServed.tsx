import { MapPin } from "lucide-react";

const boroughs = [
  {
    name: "Brooklyn",
    tagline: "Custom kitchen cabinets in Brooklyn",
    neighborhoods: [
      "Park Slope",
      "Williamsburg",
      "DUMBO",
      "Brooklyn Heights",
      "Carroll Gardens",
      "Bushwick",
    ],
  },
  {
    name: "Manhattan",
    tagline: "Custom kitchen cabinets in Manhattan",
    neighborhoods: [
      "Tribeca",
      "SoHo",
      "West Village",
      "Upper East Side",
      "Upper West Side",
      "Harlem",
    ],
  },
  {
    name: "Queens",
    tagline: "Custom kitchen cabinets in Queens",
    neighborhoods: [
      "Long Island City",
      "Astoria",
      "Forest Hills",
      "Sunnyside",
      "Ridgewood",
      "Jackson Heights",
    ],
  },
];

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToContact = () => scrollToId("contact");

const NeighborhoodsServed = () => {
  return (
    <section
      id="neighborhoods"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-4">
            Neighborhoods We Serve
          </h2>
          <p className="text-lg text-[#555555]">
            Designed in Bushwick, installed across NYC. We build custom kitchen
            cabinetry for homes throughout Brooklyn, Manhattan, and Queens.
          </p>

          <nav
            aria-label="Jump to borough"
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {boroughs.map((b) => (
              <button
                key={`link-${b.name}`}
                onClick={() => scrollToId(`borough-${b.name.toLowerCase()}`)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-[#d5d5d5] text-[#1a1a1a] hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {b.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {boroughs.map((borough) => (
            <div
              key={borough.name}
              id={`borough-${borough.name.toLowerCase()}`}
              className="scroll-mt-24 bg-[#d5d5d5] rounded-xl p-6 sm:p-8 flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-primary" />
                <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">
                  {borough.name}
                </h3>
              </div>
              <p className="text-sm text-[#555555] mb-5">{borough.tagline}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {borough.neighborhoods.map((n) => (
                  <li
                    key={n}
                    className="text-[#1a1a1a] text-sm border-b border-background/60 pb-1"
                  >
                    {n}
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToContact}
                className="mt-auto inline-flex items-center justify-center text-sm font-semibold text-primary hover:text-[#445339] transition-colors"
              >
                Get a free quote in {borough.name} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodsServed;
