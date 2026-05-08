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
  // Brooklyn — additional
  "Bedford-Stuyvesant": make(
    "Bedford-Stuyvesant",
    "Brooklyn",
    "Bed-Stuy has the largest concentration of intact Victorian-era brownstones in the country — over 8,800 of them. Their original parlor-floor layouts make for showstopping eat-in kitchens.",
  ),
  "Crown Heights": make(
    "Crown Heights",
    "Brooklyn",
    "Crown Heights sits on the second-highest natural elevation in Brooklyn — hence the 'Crown.' The neighborhood's limestone rowhouses pair beautifully with painted inset cabinetry.",
  ),
  "Fort Greene": make(
    "Fort Greene",
    "Brooklyn",
    "Fort Greene is named for a Revolutionary War fort once commanded by Nathanael Greene. Today its leafy blocks are full of 1860s Italianate brownstones with original kitchen hearths.",
  ),
  "Prospect Heights": make(
    "Prospect Heights",
    "Brooklyn",
    "Prospect Heights is one of NYC's smallest historic districts — just 13 blocks. The tight footprint means every inch of cabinetry has to earn its keep.",
  ),
  "Clinton Hill": make(
    "Clinton Hill",
    "Brooklyn",
    "Clinton Hill was Brooklyn's 'Gold Coast' in the 1880s — Charles Pratt's mansions still line the avenues. Their original butler's pantries inspire a lot of our two-tone designs.",
  ),
  "Boerum Hill": make(
    "Boerum Hill",
    "Brooklyn",
    "Boerum Hill's blocks of Greek Revival rowhouses (1840s–60s) are some of the oldest in Brooklyn. We routinely match new face frames to 175-year-old door casings.",
  ),
  Gowanus: make(
    "Gowanus",
    "Brooklyn",
    "Gowanus's converted industrial lofts have some of the largest open kitchen footprints in Brooklyn — perfect for double islands and 12-foot pantry walls.",
  ),
  "Red Hook": make(
    "Red Hook",
    "Brooklyn",
    "Red Hook's Civil War-era warehouses have brick walls up to 24 inches thick. We mount cabinets on custom French cleats so nothing has to anchor through historic masonry.",
  ),
  "Sunset Park": make(
    "Sunset Park",
    "Brooklyn",
    "Sunset Park's hilltop offers one of the best skyline views in NYC. Its limestone rowhouses often have galley kitchens crying out for floor-to-ceiling cabinetry.",
  ),
  "Bay Ridge": make(
    "Bay Ridge",
    "Brooklyn",
    "Bay Ridge has more single-family homes than almost any Brooklyn neighborhood — many with original 1920s breakfast nooks we love restoring with bench seating and built-ins.",
  ),
  Flatbush: make(
    "Flatbush",
    "Brooklyn",
    "Flatbush's Victorian Flatbush district has over 2,000 freestanding wood-frame Victorians — the largest concentration in the U.S. Their big country kitchens are a dream to build for.",
  ),
  "Windsor Terrace": make(
    "Windsor Terrace",
    "Brooklyn",
    "Windsor Terrace was nearly bulldozed for the Prospect Expressway in the 1950s. The rowhouses that survived have unusually deep backyards — many of our clients knock through to garden-facing kitchens.",
  ),

  // Manhattan — additional
  "East Village": make(
    "East Village",
    "Manhattan",
    "The East Village's tenement buildings (1880s–1900s) were originally built without kitchens at all — cooking happened in the airshaft. Modernizing one is half history project, half puzzle.",
  ),
  "Lower East Side": make(
    "Lower East Side",
    "Manhattan",
    "The LES once housed over 700 people per acre — denser than modern Mumbai. Its tenement kitchens are tiny, which is exactly why custom-milled cabinetry pays for itself fast.",
  ),
  "Greenwich Village": make(
    "Greenwich Village",
    "Manhattan",
    "Greenwich Village has the city's largest historic district — over 2,000 protected buildings. Many original Federal-style houses still have working fireplaces in the kitchen.",
  ),
  NoHo: make(
    "NoHo",
    "Manhattan",
    "NoHo ('North of Houston') has just 125 buildings in its historic district — and the highest concentration of cast-iron architecture left in the world after SoHo.",
  ),
  Nolita: make(
    "Nolita",
    "Manhattan",
    "Nolita ('North of Little Italy') was carved out of Little Italy only in the 1990s. Its narrow tenement kitchens are perfect canvases for custom slim-shaker cabinetry.",
  ),
  Gramercy: make(
    "Gramercy",
    "Manhattan",
    "Gramercy Park is one of only two private parks in NYC — keys go to surrounding residents only. The pre-war co-ops around it have classic-six layouts ideal for inset cabinetry.",
  ),
  "Murray Hill": make(
    "Murray Hill",
    "Manhattan",
    "Murray Hill is named for Robert Murray, an 18th-century merchant whose wife famously stalled British troops with tea so American forces could escape. Its prewar kitchens have history baked in.",
  ),
  Midtown: make(
    "Midtown",
    "Manhattan",
    "Midtown has more office-to-residential conversions in progress than any neighborhood in NYC. The unusual floor plates produce kitchens we have to design from scratch — every time.",
  ),
  "Hell's Kitchen": make(
    "Hell's Kitchen",
    "Manhattan",
    "Hell's Kitchen got its name from a 19th-century police officer's quip about the rough tenement blocks. Today's converted lofts have soaring ceilings — we love double-stacked uppers here.",
  ),
  "Morningside Heights": make(
    "Morningside Heights",
    "Manhattan",
    "Morningside Heights sits on the site of the 1776 Battle of Harlem Heights. Its grand pre-war co-ops near Columbia have full butler's pantries we routinely modernize without losing the architecture.",
  ),
  "Washington Heights": make(
    "Washington Heights",
    "Manhattan",
    "Washington Heights has the highest natural elevation in Manhattan (265 ft). Its 1920s Art Deco apartments still have original kitchen tile we love designing cabinetry to complement.",
  ),
  "Battery Park City": make(
    "Battery Park City",
    "Manhattan",
    "Battery Park City was built on landfill from the original World Trade Center excavation. Its newer condos give us clean, square layouts — a rare luxury in Manhattan.",
  ),

  // Queens — additional
  Flushing: make(
    "Flushing",
    "Queens",
    "Flushing's 1657 Flushing Remonstrance was one of the earliest American calls for religious freedom. Today it's home to NYC's largest Asian community — and some of our most ambitious wok-friendly kitchen designs.",
  ),
  Woodside: make(
    "Woodside",
    "Queens",
    "Woodside grew up around the Long Island Rail Road in the 1860s. Its compact wood-frame homes have charming original kitchen footprints we modernize without losing the proportions.",
  ),
  Elmhurst: make(
    "Elmhurst",
    "Queens",
    "Elmhurst is one of the most linguistically diverse zip codes on Earth — over 130 languages spoken. The kitchens here have to handle every cooking tradition, and we love that challenge.",
  ),
  Maspeth: make(
    "Maspeth",
    "Queens",
    "Maspeth is one of the oldest continuously settled places in NYC — Dutch settlers arrived in 1642. The neighborhood's brick rowhouses hold custom cabinetry beautifully.",
  ),
  Glendale: make(
    "Glendale",
    "Queens",
    "Glendale was named after Glendale, Ohio, by a developer hoping to attract Midwest buyers in the 1860s. Its detached homes give us rare freestanding-island opportunities in NYC.",
  ),
  "Kew Gardens": make(
    "Kew Gardens",
    "Queens",
    "Kew Gardens was designed in 1910 as one of America's first planned 'garden communities,' modeled after Kew, England. Its Tudor and Colonial homes look stunning with leaded-glass uppers.",
  ),
  "Middle Village": make(
    "Middle Village",
    "Queens",
    "Middle Village got its name as the midway stop on the old Williamsburg–Jamaica turnpike. Its postwar brick homes have remarkably consistent kitchen layouts — a custom designer's dream.",
  ),
  Whitestone: make(
    "Whitestone",
    "Queens",
    "Whitestone is named for a large white limestone boulder once visible from the East River. Its waterfront homes pair gorgeously with clear-finished walnut and stone-toned painted cabinetry.",
  ),
  "College Point": make(
    "College Point",
    "Queens",
    "College Point was a 19th-century rubber-manufacturing hub built by German immigrant Conrad Poppenhusen — who also founded America's first free kindergarten here in 1870.",
  ),
  Briarwood: make(
    "Briarwood",
    "Queens",
    "Briarwood was developed in the 1920s as 'Briar-Wood-on-the-Hill' — a marketing flourish for the modest hilltop slope. Its mid-century co-ops are perfect for our space-efficient pantry walls.",
  ),
  "Richmond Hill": make(
    "Richmond Hill",
    "Queens",
    "Richmond Hill was home to the largest Victorian planned community in Queens. Many homes still have original wraparound porches — and original 1890s kitchens we lovingly bring into this century.",
  ),
  "Howard Beach": make(
    "Howard Beach",
    "Queens",
    "Howard Beach sits on Jamaica Bay — much of it built on filled-in marshland in the 1920s. Its waterfront ranch homes get our coastal-friendly painted cabinetry treatment.",
  ),
};

export const getNeighborhoodInfo = (name: string): NeighborhoodInfo | null =>
  NEIGHBORHOOD_FACTS[name] ?? null;
