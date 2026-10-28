import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "soft-close-blum-vs-hettich-nyc",
  title: "Soft-Close Hinges and Slides for NYC Kitchens: Blum vs Hettich",
  meta_description:
    "Blum vs Hettich soft-close hinges and drawer slides for NYC kitchens: which system fits galleys, brownstones, and co-ops, plus install notes.",
  created_at: "2026-10-28T12:00:00-04:00",
  updated_at: "2026-10-28T12:00:00-04:00",
  tags: ["soft-close", "blum", "hettich", "cabinet hardware", "hinges", "drawer slides", "NYC kitchens", "custom millwork"],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/soft-close-blum-vs-hettich-nyc",
  excerpt:
    "How Blum and Hettich soft-close systems compare for NYC apartments: hinge types, drawer runners, load ratings, and what matters in tight spaces.",
};

export const FAQS = [
  {
    q: "Is soft-close worth it in a NYC kitchen?",
    a: "Yes for most. It stops doors and drawers from slamming in apartments where noise travels, and it protects the cabinets over years of use. The premium is modest on a full custom kitchen.",
  },
  {
    q: "Blum or Hettich for soft-close?",
    a: "Both are excellent. Blum is very common in US kitchens and easy to source replacements for. Hettich has strong options for heavier loads and some European styles. We use both depending on the project.",
  },
  {
    q: "Do soft-close hinges need special doors?",
    a: "No. They fit standard frameless or face-frame cabinets with the right mounting plates. We size the reveals and door thickness for the chosen system.",
  },
  {
    q: "Can I add soft-close later?",
    a: "On many drawers yes, by swapping the runners. Hinges are harder once the doors are hung and adjusted; better to decide during design.",
  },
];

const BODY = [
  "<p>Soft-close is the quiet close that keeps doors and drawers from banging shut. In a New York apartment or brownstone, where sound carries through thin walls and prewar plaster, it is one of the upgrades people notice every day.</p>",
  "<p>Green Cabinets NY designs and installs custom kitchens and millwork by appointment across Brooklyn, Manhattan, and Queens. Here is how we choose between Blum and Hettich soft-close systems.</p>",
  "<h2>How soft-close works</h2>",
  "<p>On hinges, a small damper or integrated mechanism slows the last inch of the door so it settles closed. On drawers, the runner has a damper that catches the drawer and pulls it the rest of the way gently. Both systems are adjustable for the exact door weight and drawer load.</p>",
  "<h2>Blum vs Hettich overview</h2>",
  "<p>Blum (Austria) and Hettich (Germany) are the two systems we use most. Both are built for daily commercial-grade use.</p>",
  "<ul><li><strong>Blum</strong> (CLIP top BLUMOTION, TANDEMBOX, LEGRABOX): extremely common in the US, excellent soft-close on both hinges and drawers, wide range of load ratings, easy local support and replacements.</li><li><strong>Hettich</strong> (Sensys, InnoTech, ArciTech): strong European options, some of the highest load ratings on heavy pantry drawers, clean aesthetics on certain styles.</li></ul>",
  "<p>We pick based on the specific door weight, drawer depth, and whether the project already has a preferred hardware family. Neither is “better” overall.</p>",
  "<h2>Hinges: what matters in NYC kitchens</h2>",
  "<p>Most of our cabinets are frameless European-style with full-overlay doors. Soft-close clip-on hinges let us hang doors quickly and adjust three ways after install. In tight galleys we watch the overlay and the gap to adjacent cabinets or walls so the damper has room to work without binding.</p>",
  "<p>For face-frame cabinets (less common for us but sometimes requested), we use the matching plates. Heavy appliance panels or large pantry doors get the higher-load hinge variants. See our <a href=\"https://greencabinetsny.com/blog/face-frame-vs-frameless-cabinets-nyc\">face-frame vs frameless</a> comparison for how that affects reveals.</p>",
  "<h2>Drawer slides: depths and loads</h2>",
  "<p>Full-extension soft-close runners are standard. Common lengths are 450mm, 500mm, 550mm, and 600mm. In NYC apartments we often need the shorter ones because of narrow rooms or radiators. Load ratings run from about 30 kg (light) to 70+ kg (heavy pantry or trash pull-outs). We match the rating to what will actually go in the drawer: dishes, pots, or a trash bin with recycling.</p>",
  "<p>Our <a href=\"https://greencabinetsny.com/blog/pull-out-trash-recycling-nyc\">pull-out trash and recycling</a> guide shows how the runner choice affects the bin size and soft-close feel.</p>",
  "<h2>Prewar walls, humidity, and long-term use</h2>",
  "<p>Prewar plaster walls move. Soft-close systems are forgiving because the final close is controlled, but we still scribe fillers and leave proper reveals so nothing binds after a season of humidity. Low-VOC finishes on the cabinets pair well with the metal hardware; the soft-close itself needs no special care beyond occasional cleaning.</p>",
  "<h2>Cost and lead time</h2>",
  "<p>Soft-close is a small percentage of a custom kitchen. Specifying it early means the doors and drawers are built for the exact hinge and runner. Lead times for Blum and Hettich are usually a few weeks for standard parts; specialty colors or very high loads can take longer. We order them with the millwork so everything arrives together.</p>",
  "<h2>Quick facts</h2>",
  "<p>Green Cabinets NY is a custom millwork company serving Brooklyn, Manhattan, and Queens since 2009 (15+ years), home-based in Bushwick and working by appointment only. We design and install custom kitchen cabinets, vanities, closets, and built-ins, including Blum and Hettich soft-close hardware. Phone (718) 804-5488. Email orders@greencabinetsny.com. Website https://greencabinetsny.com. See finished work in our <a href=\"https://greencabinetsny.com/case-studies\">case studies</a>.</p>",
  "<h2>FAQ</h2>",
  FAQS.map((f) => `<h3>${f.q}</h3><p>${f.a}</p>`).join(""),
  "<h2>Get a quote</h2>\n<p>Planning a kitchen in Brooklyn, Manhattan, or Queens and want soft-close done right? Email <a href=\"mailto:orders@greencabinetsny.com\">orders@greencabinetsny.com</a> or call <a href=\"tel:+17188045488\">(718) 804-5488</a>. Tell us your borough and rough size. Read more <a href=\"https://greencabinetsny.com/about\">about us</a> or browse the <a href=\"https://greencabinetsny.com/blog\">blog</a>.</p>",
];

export const softCloseBlumVsHettichNycPost: BlogArticle = {
  id: META.slug,
  external_id: null,
  slug: META.slug,
  title: META.title,
  content_html: BODY.join("\n"),
  excerpt: META.excerpt,
  meta_title: "Soft-Close Hinges & Slides: Blum vs Hettich for NYC",
  meta_description: META.meta_description,
  tags: META.tags,
  image_url: null,
  content_image_urls: META.content_image_urls,
  canonical_url: META.canonical_url,
  created_at: META.created_at,
  updated_at: META.updated_at,
  faqs: FAQS,
};
