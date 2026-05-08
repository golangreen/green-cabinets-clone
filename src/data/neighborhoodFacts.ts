// Cool facts + map queries for each NYC neighborhood we serve.
// Used by NeighborhoodDialog to give visitors a small "wow" moment when
// they tap a neighborhood name.

export interface NeighborhoodInfo {
  name: string;
  borough: "Brooklyn" | "Manhattan" | "Queens";
  fact: string;
  /** Query string passed to Google Maps embed. */
  mapQuery: string;
}

const make = (
  name: string,
  borough: NeighborhoodInfo["borough"],
  fact: string,
): NeighborhoodInfo => ({
  name,
  borough,
  fact,
  mapQuery: `${name}, ${borough}, NY`,
});

export const NEIGHBORHOOD_FACTS: Record<string, NeighborhoodInfo> = {
  // Brooklyn
  "Park Slope": make(
    "Park Slope",
    "Brooklyn",
    "Park Slope's brownstone-lined blocks were built largely between 1880 and 1900 — many of the original kitchens were tucked into the garden level, which is why so many renovations today open them up to the parlor floor.",
  ),
  Williamsburg: make(
    "Williamsburg",
    "Brooklyn",
    "Once the largest brewing district in the U.S., Williamsburg's old factory lofts now house some of the city's most ambitious open-plan kitchens — perfect for oversized islands and floor-to-ceiling cabinetry.",
  ),
  DUMBO: make(
    "DUMBO",
    "Brooklyn",
    "DUMBO stands for 'Down Under the Manhattan Bridge Overpass.' Its converted warehouse condos often have 12-foot ceilings, which we love for double-stacked upper cabinets.",
  ),
  "Brooklyn Heights": make(
    "Brooklyn Heights",
    "Brooklyn",
    "Brooklyn Heights was NYC's first designated Historic District (1965). Many of its 19th-century townhouses still have original plaster moldings — we mill cabinet face frames to match them.",
  ),
  "Carroll Gardens": make(
    "Carroll Gardens",
    "Brooklyn",
    "Carroll Gardens is named for Charles Carroll, the only Catholic signer of the Declaration of Independence. Its signature deep front gardens mean kitchens often face the rear yard — a designer's dream for natural light.",
  ),
  Bushwick: make(
    "Bushwick",
    "Brooklyn",
    "Bushwick is home to our shop. Founded by the Dutch in 1638, today it's NYC's mural capital — and the place every Green Cabinets cabinet is hand-built before installation.",
  ),
  Greenpoint: make(
    "Greenpoint",
    "Brooklyn",
    "Greenpoint was a 19th-century shipbuilding hub — the USS Monitor was launched here in 1862. The neighborhood's narrow row-house kitchens are ideal showcases for our slim shaker cabinetry.",
  ),
  "Cobble Hill": make(
    "Cobble Hill",
    "Brooklyn",
    "Cobble Hill's tight, three-story brick row houses date to the 1840s. Their tiny galley kitchens are some of our favorite challenges — every inch counts.",
  ),

  // Manhattan
  Tribeca: make(
    "Tribeca",
    "Manhattan",
    "Tribeca ('Triangle Below Canal') has the highest concentration of cast-iron loft buildings in the world. Their column-free spans let us design true 14-foot-long galley runs.",
  ),
  SoHo: make(
    "SoHo",
    "Manhattan",
    "SoHo's cast-iron façades were a 19th-century trick: cheap to mass-produce, easy to paint to imitate stone. We love echoing that craft in custom inset shaker doors.",
  ),
  "West Village": make(
    "West Village",
    "Manhattan",
    "The West Village's crooked street grid predates the 1811 Commissioners' Plan — which is why no two kitchens here are ever quite square. Custom cabinetry is basically required.",
  ),
  "Upper East Side": make(
    "Upper East Side",
    "Manhattan",
    "The Upper East Side's pre-war co-ops average 9–10 ft ceilings and full-height service kitchens — perfect for the inset, painted hardwood cabinets we're known for.",
  ),
  "Upper West Side": make(
    "Upper West Side",
    "Manhattan",
    "Many Upper West Side classic-six apartments still have their original maid's room off the kitchen. We've turned dozens into pantries with floor-to-ceiling cabinetry.",
  ),
  Harlem: make(
    "Harlem",
    "Manhattan",
    "Harlem's brownstones were built in a 20-year boom from 1880 to 1900. Their generous parlor floors let us design eat-in kitchens with 10-ft islands.",
  ),
  Chelsea: make(
    "Chelsea",
    "Manhattan",
    "Chelsea was named after the Royal Hospital Chelsea in London. Today its converted gallery lofts are some of our favorite canvases for two-tone painted cabinetry.",
  ),
  "Financial District": make(
    "Financial District",
    "Manhattan",
    "FiDi's tower-conversion condos often have unusual angled walls (the buildings were designed as offices). We custom-mill every cabinet to fit — no fillers.",
  ),

  // Queens
  "Long Island City": make(
    "Long Island City",
    "Queens",
    "LIC has the fastest skyline growth in NYC — over 40 new towers since 2010. Their open-plan layouts pair beautifully with waterfall-edge islands and handle-less cabinetry.",
  ),
  Astoria: make(
    "Astoria",
    "Queens",
    "Astoria is one of the most ethnically diverse zip codes in the United States. Its rowhouse kitchens often need to host extended family — we design for ovens, ovens, and more ovens.",
  ),
  "Forest Hills": make(
    "Forest Hills",
    "Queens",
    "Forest Hills Gardens (1909) was one of America's first planned 'garden suburbs', modeled after English villages. Its Tudor-style homes look stunning with leaded-glass cabinet doors.",
  ),
  Sunnyside: make(
    "Sunnyside",
    "Queens",
    "Sunnyside Gardens (1924) was NYC's first planned community designed around shared green courtyards. The compact rowhouse kitchens are perfect for our space-saving custom pantries.",
  ),
  Ridgewood: make(
    "Ridgewood",
    "Queens",
    "Ridgewood has more historic-district-protected blocks than any other Queens neighborhood — over 2,900 buildings, mostly yellow-brick rowhouses with original kitchen footprints we lovingly modernize.",
  ),
  "Jackson Heights": make(
    "Jackson Heights",
    "Queens",
    "Jackson Heights invented the term 'garden apartment' in the 1920s. The original co-op buildings still have their hidden interior gardens — and pre-war kitchens ready for a refresh.",
  ),
  "Rego Park": make(
    "Rego Park",
    "Queens",
    "'Rego' comes from REal GOod Construction Company, which built much of the neighborhood in the 1920s. Their solid masonry homes hold custom cabinetry beautifully — no warping, no settling.",
  ),
  Bayside: make(
    "Bayside",
    "Queens",
    "Bayside sits on the shore of Little Neck Bay. Its waterfront single-family homes often feature open kitchens designed around the view — we love using clear-finished walnut to echo the water and sky.",
  ),
};

export const getNeighborhoodInfo = (name: string): NeighborhoodInfo | null =>
  NEIGHBORHOOD_FACTS[name] ?? null;
