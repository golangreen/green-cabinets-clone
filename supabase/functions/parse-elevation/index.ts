import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { guardAiRequest, validateImagesInput } from "../_shared/aiGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KNOWN_MODELS = [
  "W0612","W0912","W1212","W1512","W1812","W2112","W2412","W2712","W3012","W3312","W3612","W3912",
  "W0915","W1215","W1515","W1815","W2115","W2415","W2715","W3015","W3315","W3615","W1536",
  "W0918","W1218","W1518","W1818","W2118","W2418","W2718","W3018","W3318","W3618",
  "W0624","W0924","W1224","W1524","W1824","W2124","W2424","W2724","W3024","W3324","W3624",
  "W0930","W1230","W1530","W1830","W2130","W2430","W2730","W3030","W3330","W3630",
  "W0936","W1236","W1536","W1836","W2136","W2436","W2736","W3036","W3336","W3636",
  "W0942","W1242","W1542","W1842","W2142","W2442","W2742","W3042","W3342","W3642",
  "WDC2442","WBC2742","WDC2430","WDC2436","WBC2730","WBC2736",
  "WD2430L","WD2430R","WD2436L","WD2436R","WD2442L","WD2442R","WD2736R",
  "B09","B12","B15","B18","B21","B24","B27","B30","B33","B36","B39","B42","B48",
  "SB24","SB27","SB30","SB33","SB36","SB39","SB42","SB48","SBA36",
  "DB12","DB15","DB18","DB21","DB24","DB30","DB33","DB36",
  "PC1584","PC1590","PC1596","PC1884","PC1890","PC1896","PC2484","PC2490","PC2496",
  "PC2784","PC2790","PC2796","PC3084","PC3090","PC3096",
  "WMC3030","WMC3036","WMC3042",
  "OVD3084","OVD3090","OVD3096","OVD3384","OVD3390","OVD3396",
  "OC3084","OC3096",
  "BSR09",
  "BLB36","BLB39","BLB42","BLB45","BLB48","BB36L","BB36R",
  "BLW2730","BLW3030","BLW3036","BLW3336","BLW3642","BLW4236","BLW4536",
  "CW2430","CW2436","CW2442",
  "WSQ2430","WSQ2436","WSQ2442",
  "WEC1230","WEC1236","WEC1242",
  "MCB3024","MCB3084","MCB3384","MCB3630",
  "MW3015","MW3018","MW3024","MW3030",
  "V24","V24DL","V24DR","V30","V36","V48","V60",
  "UC1884","UC1890","UC1896","UC2484","UC2490","UC2496","UC2784","UC2790","UC2796","UC3084","UC3090","UC3096",
  "CSB36","CSB42",
  "LSB36","LSB42",
  "EZR33","EZR36",
  "DSB36L","DSB36R",
  "BWBK18","BWKW15",
  "WR3018","AGD2418","WH30",
  "BEC24L","BEC24R",
  "ROT12","ROT15","ROT18","ROT21","ROT24","ROT30","ROT36",
  "FP4896-3/4","FP4896-1/4","RP2496","DWP3","DWP3/4","DW3",
  "REP84","REP96","REP843","REP963","BP4896",
  "BDE24","WDE1230","OWF6",
  "BF3","BF6","TF3X96","TF6X96",
  "WF330","WF336","WF342","WF630","WF636","WF642",
  "CMD2","CMD4","TLM8","SM8","OCM8","RCRM","LTRM","WDM","TK8",
  "VAL30","VAL48","WS30","WS36","WS42","BS24",
];

const TALL_HEIGHTS = [84, 90, 96];

/** Extract the nominal width (inches) from any normalized or raw 2020-Design model code. */
function getModelWidth(model: string): number | null {
  if (!model) return null;
  const m = model.toUpperCase().trim().match(/^[A-Z]{1,5}(\d{2})/);
  if (!m) return null;
  const w = parseInt(m[1]);
  return (w >= 6 && w <= 60) ? w : null;
}

function nextUp(val: number, opts: number[]): number {
  const sorted = [...opts].sort((a, b) => a - b);
  return sorted.find(v => v >= val) ?? sorted[sorted.length - 1];
}

function normalizeResultItem(item: any) {
  if (!item || typeof item.model !== "string") return null;

  let model = item.model.trim().toUpperCase().replace(/\?$/, "").replace(/\s+/g, "");
  const qty = Number(item.qty);
  if (!model || !Number.isFinite(qty) || qty <= 0) return null;

  // F3/F6 are OCR misreads of BF3/BF6 fillers — skip entirely, never price
  if (model === 'F3' || model === 'F6') return null;

  // ── L/R hinge strip — FIRST, so every rule below receives a clean code ──
  // Keep L/R only for models where it is part of the catalog code itself
  const LR_KEEP = new Set(["WD2430L","WD2430R","WD2436L","WD2436R","WD2442L","WD2442R","WD2736R",
                            "DSB36L","DSB36R","BEC24L","BEC24R","BB36L","BB36R"]);
  if (!LR_KEEP.has(model)) {
    const lrm = model.match(/^(.+?)[-_]?([LRD])$/);
    if (lrm) {
      const suffix = lrm[2];
      if (suffix === 'L') { if (!item.note) item.note = 'Left hinge'; model = lrm[1]; }
      else if (suffix === 'R') { if (!item.note) item.note = 'Right hinge'; model = lrm[1]; }
      else if (suffix === 'D') { model = lrm[1]; }
    }
  }

  if (/^(MW\/?[\s]?HOOD|MWHOOD|MW\/?OO\/?OD?|OTR|MWAVE|MWC|MW3015|MW3018|MW3024|MW3030|MW)$/i.test(model)) model = "MW3030";

  // HOOD[ww][-hh] = Range hood cabinet → MW3030
  if (/^HOOD\d/.test(model)) model = "MW3030";

  // ── DFB / BDF prefix = AI scrambled FDB (letter transposition) ──
  if (/^(DFB|BDF)/.test(model)) {
    model = "FDB" + model.slice(3);
  }

  // ── BWB[ww] → BWBK[ww] ──
  {
    const m = model.match(/^BWB(\d{2})$/);
    if (m) {
      const c = `BWBK${m[1]}`;
      if (KNOWN_MODELS.includes(c)) model = c;
    }
  }

  // ── BB[ww][4+ extra digits][L/R] = 2020 full blind-base combo → BLB[ww] ──
  {
    const m = model.match(/^BB(\d{2})\d{2,}/);
    if (m && !KNOWN_MODELS.includes(model)) {
      const w = parseInt(m[1]);
      const bw = nextUp(w, [36, 39, 42, 45, 48]);
      const c = `BLB${String(bw).padStart(2, "0")}`;
      if (KNOWN_MODELS.includes(c)) model = c;
    }
  }

  // ── QMW / QMV = microwave or tall oven combo cabinet ──
  // Low height (≤ 42") = over-range microwave wall → MW3030
  // Tall height (≥ 84") = oven/utility combo → OVD / UC
  {
    const m = model.match(/^Q[MV][VW]?(\d{2})(\d{2})\d{2,3}$/);
    if (m) {
      const w = m[1]; const h = parseInt(m[2]);
      if (h <= 42) {
        model = "MW3030";
      } else {
        const th = nextUp(h, TALL_HEIGHTS);
        const candidates = [`OVD${w}${th}`, `OC${w}${th}`, `UC${w}${th}`];
        for (const c of candidates) { if (KNOWN_MODELS.includes(c)) { model = c; break; } }
      }
    }
  }

  // ── SB[ww] where ww is obviously wrong (0X or < 18) = digit OCR error ──
  {
    const m = model.match(/^SB(\d{2})$/);
    if (m) {
      const w = parseInt(m[1]);
      if (w < 18 && m[1][0] === "0") {
        for (const fix of ["3", "2", "4"]) {
          const c = `SB${fix}${m[1][1]}`;
          if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "width OCR-corrected"; break; }
        }
      }
    }
  }

  // ── W[ww][00][dd] = AI read height as "00" → try tall heights ──
  {
    const m = model.match(/^W(\d{2})00(\d{2})$/);
    if (m && !KNOWN_MODELS.includes(model)) {
      const w = m[1]; const d = m[2];
      // Try tall cabinet: W[ww][hh][dd]
      for (const h of ["84", "90", "96", "60", "42", "36"]) {
        const c = `W${w}${h}${d}`; if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "height OCR-corrected"; break; }
      }
      // Try as simple wall W[ww][hh]
      if (!KNOWN_MODELS.includes(model)) {
        for (const h of [36, 42, 30, 24, 18]) {
          const c = `W${w}${String(h).padStart(2,"0")}`; if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "height OCR-corrected"; break; }
        }
      }
    }
  }

  // ── W[ww][hh][24] tall-deep = likely UC (utility cabinet 24" deep) ──
  {
    const m = model.match(/^W(\d{2})(\d{2})24$/);
    if (m && !KNOWN_MODELS.includes(model)) {
      const h = parseInt(m[2]);
      if (h >= 60) {
        const w = m[1];
        const th = nextUp(h, TALL_HEIGHTS);
        const c = `UC${w}${th}`;
        if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "tall wall/utility"; }
      }
    }
  }

  // ── 2020 Design code translations ──

  // DB[ww]-N (hyphen + single digit 1-9) = explicit drawer count → preserve in item.drawerCount
  {
    const mDBdrawers = model.match(/^(DB\d{2})-([1-9])$/);
    if (mDBdrawers && !KNOWN_MODELS.includes(model)) {
      if (KNOWN_MODELS.includes(mDBdrawers[1])) {
        item.drawerCount = parseInt(mDBdrawers[2]);
        model = mDBdrawers[1];
      }
    }
  }
  // DB[ww] + dimension suffix (no hyphen, or hyphen + 2+ digits) → strip to DB[ww]
  {
    const mDB = model.match(/^(DB\d{2})[-]?\d+$/);
    if (mDB && !KNOWN_MODELS.includes(model)) {
      if (KNOWN_MODELS.includes(mDB[1])) model = mDB[1];
    }
  }

  // FD[ww] or FDB[ww]... = Full Door Base (no top drawer rail) → B[ww]
  {
    const mFDB = model.match(/^FD[B]?(\d{2})/);
    if (mFDB) {
      const candidate = `B${mFDB[1]}`;
      if (!item.note) item.note = "full door base";
      model = candidate;
    }
  }

  // BB[ww] = Blind Base → BLB[ww]
  {
    const mBB = model.match(/^BB(\d{2})$/);
    if (mBB) {
      const candidate = `BLB${mBB[1]}`;
      model = candidate;
    }
  }

  // B[ww][hh][dd] = full 2020 base code (e.g. B273424) → B[ww]
  {
    const mBfull = model.match(/^B(\d{2})\d{4}$/);
    if (mBfull && !KNOWN_MODELS.includes(model)) {
      const candidate = `B${mBfull[1]}`;
      if (KNOWN_MODELS.includes(candidate)) model = candidate;
    }
  }

  // WCOR[ww][hh][-B|-L|-R] = Corner Wall → WDC[ww][hh]
  {
    const mWCOR = model.match(/^WCOR(\d{2})(\d{2})/);
    if (mWCOR) {
      const candidate = `WDC${mWCOR[1]}${mWCOR[2]}`;
      model = KNOWN_MODELS.includes(candidate) ? candidate : "WDC2442";
    }
  }

  // GMW[ww][hh][dd] = Glass Mullion Wall → UC[ww][hh] (tall utility cabinet)
  {
    const mGMW = model.match(/^GMW(\d{2})(\d{2})(\d{2})$/);
    if (mGMW) {
      const candidate = `UC${mGMW[1]}${mGMW[2]}`;
      if (KNOWN_MODELS.includes(candidate)) model = candidate;
    }
  }

  // V[ww][hh][dd] (6 digits) = tall vanity/linen → UC[ww][hh] if height ≥ 84"
  {
    const mVtall = model.match(/^V(\d{2})(\d{2})(\d{2})$/);
    if (mVtall && parseInt(mVtall[2]) >= 84) {
      const candidate = `UC${mVtall[1]}${mVtall[2]}`;
      if (KNOWN_MODELS.includes(candidate)) model = candidate;
    }
  }

  // BMC[ww] = 2020 Design Microwave Base Cabinet → MCB[ww][hh]
  // Try heights 24, 30, 84 (e.g. BMC30 → MCB3024 = "30\" Microwave Base 24\"H")
  {
    const mBMC = model.match(/^BMC(\d{2})$/);
    if (mBMC) {
      const w = mBMC[1];
      for (const h of ['24', '30', '84']) {
        const c = `MCB${w}${h}`;
        if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "microwave base"; break; }
      }
    }
  }

  // FPP[HH][WW] or FP[HH][WW] = 2020 Design reversed-dimension island panel → FP[WW][HH]
  // e.g. FPP9648 → FP4896-3/4, FPP96483/4 → FP4896-3/4 (fraction may be embedded without dash)
  {
    const mFPP = model.match(/^FPP?(\d{2})(\d{2})-?(3\/4|1\/4)?$/);
    if (mFPP && !KNOWN_MODELS.includes(model)) {
      const [, h, w, frac] = mFPP;
      const suffixesToTry = frac ? [`-${frac}`, ''] : ['-3/4', '-1/4', ''];
      for (const suffix of suffixesToTry) {
        const c = `FP${w}${h}${suffix}`;
        if (KNOWN_MODELS.includes(c)) { model = c; if (!item.note) item.note = "island panel"; break; }
      }
    }
  }

  // V + 4 digits = AI misread W as V (e.g. V2736 → W2736)
  if (/^V\d{4}$/.test(model)) {
    const asW = "W" + model.slice(1);
    if (KNOWN_MODELS.includes(asW)) model = asW;
  }

  // W + 7 digits = AI inserted an extra digit (e.g. W3012124 → W302124)
  // Try removing each digit; accept the first result where width and depth are standard
  if (/^W\d{7}$/.test(model)) {
    const digits = model.slice(1);
    const stdWidths = [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48];
    const stdDepths = [12, 18, 24, 30];
    for (let i = 0; i < 7; i++) {
      const candidate = "W" + digits.slice(0, i) + digits.slice(i + 1);
      const m7 = candidate.match(/^W(\d{2})(\d{2})(\d{2})$/);
      if (m7 && stdWidths.includes(parseInt(m7[1])) && stdDepths.includes(parseInt(m7[3]))) {
        if (!item.note) item.note = `corrected from ${model}`;
        model = candidate;
        break;
      }
    }
  }

  if (!KNOWN_MODELS.includes(model)) {
    const m2020 = model.match(/^W(\d{2})(\d{2})(\d{2})$/);
    if (m2020) {
      // Try direct 4-digit match first (W+WW+HH, ignoring depth)
      // e.g. W241224 → W2412 (catalog model, depth irrelevant for lookup)
      const directCode = `W${m2020[1]}${m2020[2]}`;
      if (KNOWN_MODELS.includes(directCode)) {
        model = directCode;
      } else {
        const depth = parseInt(m2020[3]);
        if (depth === 12) {
          // Standard wall depth — normalize height to nearest catalog height
          const catalogHeights = [12, 15, 18, 24, 30, 36, 42];
          const displayH = parseInt(m2020[2]);
          const nearestH = catalogHeights.reduce((p, c) =>
            Math.abs(c - displayH) < Math.abs(p - displayH) ? c : p);
          const candidate = `W${m2020[1]}${String(nearestH).padStart(2, "0")}`;
          if (KNOWN_MODELS.includes(candidate)) model = candidate;
        } else {
          // Non-standard depth — check for common OCR digit transposition: "21" misread as "12"
          // A 12"-high wall cabinet with non-standard depth is extremely unusual in practice.
          // "21" and "12" are frequently swapped by AI vision — if H=12 with non-12 depth, correct to H=21.
          const displayH = parseInt(m2020[2]);
          if (displayH === 12) {
            model = `W${m2020[1]}21${m2020[3]}`; // e.g. W301224 → W302124
            if (!item.note) item.note = `${depth}" deep (height auto-corrected 12→21)`;
          } else {
            if (!item.note) item.note = `${depth}" deep — verify catalog model & pricing`;
          }
          // model goes to skipped → custom pricing on frontend
        }
      }
    }
  }

  const normalized: Record<string, unknown> = { model, qty };
  if (typeof item.x === "number" && item.x >= 0 && item.x <= 1) normalized.x = item.x;
  if (typeof item.y === "number" && item.y >= 0 && item.y <= 1) normalized.y = item.y;
  if (typeof item.note === "string" && item.note.trim()) normalized.note = item.note.trim();
  if (typeof item.confidence === "string") normalized.confidence = item.confidence.trim();
  if (typeof item.reason === "string") normalized.reason = item.reason.trim();
  if (typeof item.drawerCount === "number" && item.drawerCount >= 1) normalized.drawerCount = item.drawerCount;

  return normalized;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const guard = await guardAiRequest(req, { corsHeaders, requireAuth: true });
    if (guard) return guard;

    const body = await req.json();

    let images: { base64: string; mimeType: string }[] = [];
    if (body.images && Array.isArray(body.images)) {
      images = body.images;
    } else if (body.imageBase64) {
      images = [{ base64: body.imageBase64, mimeType: body.mimeType || "image/png" }];
    }

    if (images.length === 0) throw new Error("No elevation images provided");
    const sizeGuard = validateImagesInput(images);
    if (sizeGuard) return new Response(await sizeGuard.text(), { status: sizeGuard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a precision cabinet code extraction specialist for Green Cabinets NY, a professional kitchen and bath cabinet company in Brooklyn. Your job is to read every single cabinet model code from architectural drawings with 100% accuracy. EVERY ERROR costs real money — wrong model = wrong cabinet ordered. Read slowly, carefully, and verify.

════════════════════════════════════════════════════
STEP 1 — IDENTIFY THE DRAWING TYPE BEFORE READING
════════════════════════════════════════════════════
First, determine which type of drawing this is — it changes HOW you read it:

[A] ELEVATION VIEW (most common for cabinets)
    What it looks like: cabinet fronts shown face-on, stacked upper and lower rows
    How to read: find alphanumeric labels directly on or adjacent to each cabinet rectangle
    Typical labels: W3030, B24, DB36-3, SB36, UC3084

[B] FLOOR PLAN (top-down bird's eye view)
    What it looks like: room outline with thin rectangles along walls (cabinet footprints)
    CRITICAL: dimension numbers like "24"" or "30"" along walls are WALL SIZES, NEVER model codes
    Only extract model codes if they are explicitly written as text labels on the drawing
    Do NOT invent model codes from rectangle sizes — if no label exists, do not output that cabinet

[C] 2020 DESIGN SOFTWARE PRINTOUT — elevation OR floor plan
    What it looks like: detailed elevation view, OR a top-down floor plan where cabinet codes sit
    inside labeled rectangular footprints along walls, corners, and islands.
    How to read: read the TEXT LABEL inside or adjacent to EACH rectangle one by one.
    Code structure: W[WW][HH][DD] — width, height, depth. Count digits carefully.
    Examples you will see: W246024L, FDB273409, BB423424R, WCOR2442-B, QMW3030024, V189622
    → Each labeled box = ONE cabinet entry with qty:1. Read the label; do not guess from box size.
    DENSE CLUSTER WARNING: In floor plans, some areas pack cabinet footprints tightly with
    overlapping dimension arrows (e.g. 17", 15", 9", 24", 27" fragments). Those fragments are WALL
    segment dimensions — NOT cabinet codes. The cabinet code is the ALPHANUMERIC label inside each
    box (starts with a letter: FDB273409, W241228, etc.). Scan every box carefully, even in crowded
    corners. Every labeled rectangle = one cabinet. Do not skip any.
    CRITICAL: "27", "24", "36", "30" etc. are dimension measurements — NEVER output them as B27,
    B24, B36, B30. A base cabinet code B27 is only valid if the letter "B" is explicitly written as
    part of the label (e.g. a box literally labeled "B27"). Do not infer B-codes from wall dimensions.

[D] CABINET SCHEDULE / TABLE FORMAT
    What it looks like: a table with columns — Item | Description | Qty | Size
    How to read: extract from TABLE ROWS ONLY. Ignore any graphical drawing outside the table.
    Keynote numbers inside the drawing (①, 1, 2, 3) reference rows in this table — look up there.

════════════════════════════════════════════════════
STEP 2 — FIND THE LEGEND OR SCHEDULE (CRITICAL)
════════════════════════════════════════════════════
Before reading ANY cabinet labels, scan all four corners and all edges of the drawing for:
  "CABINET SCHEDULE", "LEGEND", "KEY", "SYMBOL LIST", "NOTES", "SCHEDULE"

→ If a cabinet schedule table EXISTS: it is your PRIMARY source. Extract from the table first.
→ If keynote numbers appear on the drawing (1, 2, 3, ①, ②): they reference the legend/schedule.
   Look up each number in the legend and use the corresponding model code — NEVER output bare numbers.
→ If no legend: proceed directly to reading labels on the drawing.

════════════════════════════════════════════════════
STEP 3 — SYSTEMATIC WALL-BY-WALL SCAN (never skip a wall)
════════════════════════════════════════════════════
Scan EVERY wall and area in this exact order. For each wall, work strictly left→right:

  □ UPPER CABINETS (wall-hung row) — top of room: W, WDC, WBC, WMC, OVD, UC series
  □ TOP WALL (base row along top wall) — B, SB, DB, BLB, FDB, BB series
  □ LEFT WALL — both upper and lower cabinets, top to bottom
  □ RIGHT WALL — both upper and lower cabinets, top to bottom
  □ BOTTOM WALL — base cabinets along the bottom wall, very carefully
  □ ISLAND / PENINSULA — check ALL FOUR SIDES (each face is a separate wall)
  □ PANTRY AREA — tall cabinets: UC, OVD, PC, OC series
  □ CORNER AREAS — corner cabinets: WDC, WBC, BLB, CW, WSQ series

After scanning all walls, do a SECOND VERIFICATION PASS:
  → Count cabinet outlines on each wall
  → Count cabinet codes you extracted for that wall
  → If outlines > extracted codes, you missed some — rescan that wall
  → A typical kitchen: 8-20 upper cabinets + 8-20 base cabinets; island: 2-8 base cabinets

════════════════════════════════════════════════════
STEP 4 — FOR EACH LABEL: READ, VALIDATE, OUTPUT
════════════════════════════════════════════════════
For every label you find, do these steps in order:

  a) WRITE DOWN exactly what you see (raw characters)
  b) CHECK the FULL CATALOG LIST at the bottom — does it match exactly?
     → YES: output it as-is
  c) If not in catalog: apply NORMALIZATION RULES below → recheck catalog
     → Matches after normalization: output the normalized form
  d) If still not in catalog: apply OCR CORRECTION RULES below → recheck catalog
     → If it now matches: output corrected form with note explaining the correction
  e) If still unresolved: output to "review_items" with confidence level and full reasoning
  f) NEVER silently drop a label — every cabinet you see must appear in items, review_items, or non_cabinet_items

════════════════════════════════════════════════════
OCR CORRECTION RULES — apply when a code isn't in catalog
════════════════════════════════════════════════════
Images from WhatsApp, email, phone cameras, and screenshots are often blurry or compressed.
When a code doesn't match the catalog, these are the most common reading errors:

DIGIT SWAPS (most common in compressed blueprint fonts):
  0 ↔ 6  (both round shapes)     — "SB06"→SB36, "B06"→B36, "W3006"→W3036
  3 ↔ 8  (similar curve)         — "DB83"→DB36 or DB33, "B38"→B36 or B33
  1 ↔ 7  (thin vertical strokes) — "B71"→B21 or B27, "W3171"→W3127 or W3121
  4 ↔ 9  (closed-top digits)     — "B49"→B48 or B42, "W3049"→W3042
  5 ↔ 6  (top curves)            — "B56"→B36, "SB56"→SB36
  2 ↔ 7  (diagonal strokes)      — "W7730"→W2730
  0 ↔ 8  (round shapes)          — "W3080"→W3036 or W3030

LETTER SWAPS:
  F ↔ E  (one crossbar missing)  — "EDB36"→FDB36
  D ↔ F  (descender vs. crossbar)— "DFB36"→FDB36, "DDB36"→DB36
  V ↔ W  (very common)           — "V2736" (4 digits)→W2736, "V3030"→W3030
  U ↔ W  (rounded top)           — "U3030"→W3030 (unless clearly labeled UC)
  Q ↔ O ↔ 0  (round shapes)
  I ↔ 1 ↔ L  (thin verticals)

WIDTH REASONABLENESS CHECK — if your read produces these, you have an OCR error:
  SB06, SB09, SB12, SB15, SB18, SB20, SB22, SB23 → IMPOSSIBLE (sink bases: 24" minimum)
  B03, B06 → IMPOSSIBLE (base cabinets: 9" minimum)
  DB39, DB42, DB45, DB48 → IMPOSSIBLE (drawer bases: 36" maximum)
  UC with height under 72" → IMPOSSIBLE (utility: 84/90/96" only)
  OVD with width under 30" → IMPOSSIBLE (oven: 30" or 33" only)
  V followed by 4 digits (e.g. V2736) → NOT a vanity, it's a wall cabinet W2736
  W followed by 7+ digits → you added an extra digit; recount carefully

USE DIMENSION ARROWS AS WIDTH HINTS:
  If a dimension arrow shows "36"" next to a blurry label starting with "SB" → it's SB36
  If a dimension arrow shows "30"" next to a blurry "W" label → it's likely W3030 or W3036
  Standard widths: 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 48 inches
  NON-STANDARD widths (odd numbers like 17", 22", 23") are almost always OCR errors

════════════════════════════════════════════════════
MODEL CODE FORMAT REFERENCE
════════════════════════════════════════════════════

WALL CABINETS — W series:
  Standard 4-digit: W[WW][HH] → W3030 = 30"W × 30"H
  2020 Design 6-digit: W[WW][HH][DD] → W302112 = 30"W × 21"H × 12"D
  Heights in catalog: 12, 15, 18, 24, 30, 36, 42 inches
  RULE: W + 4 digits = standard. W + 6 digits = 2020 Design. NEVER 5 digits or 7 digits.
  If you count 5 digits: you dropped one — recount. If you count 7 digits: you added one — recount.

BASE CABINETS — B series:
  B[WW] → B30, B36 etc.
  2020 Design: B[WW][HH][DD] (e.g. B273424) → always strip to B[WW]

DRAWER BASES — DB series:
  DB[WW] or DB[WW]-[N] where N = number of drawers → DB36, DB36-3
  2020 Design: DB[WW][HH][DD] (e.g. DB363424) → strip to DB[WW]
  DB with explicit drawer count: "DB36-3" = 3-drawer 36" base → output "DB36-3"

SINK BASES — SB series:
  SB[WW] — valid widths: 24, 27, 30, 33, 36, 39, 42, 48 ONLY

TALL / UTILITY — UC, OVD, PC:
  UC[WW][HH] — heights ONLY 84, 90, 96. Widths: 18, 24, 27, 30
  OVD[WW][HH] — widths ONLY 30, 33. Heights: 84, 90, 96
  PC[WW][HH] — pantry cabinet

VANITY — V series:
  V[WW] ONLY — V24, V30, V36, V48, V60
  V + 4 or 6 digits = MISREAD of a W cabinet → output as W[digits]

LEFT/RIGHT HINGE — strip from most models:
  B15L → model:"B15", note:"Left hinge"
  B24R → model:"B24", note:"Right hinge"
  EXCEPTIONS (L/R is part of the model code, keep it): WD2430L, WD2436R, DSB36L, BEC24R, BB36L, BB36R

════════════════════════════════════════════════════
SPECIAL / 2020 DESIGN CODES — output EXACTLY as labeled, server converts:
════════════════════════════════════════════════════
  FDB[WW][HH][DD] or FD[WW]   = Full Door Base        → output as-is: "FDB273409"
  BB[WW]                       = Blind Base (short)    → output as-is: "BB42"
  BB[WW][HH][DD][R/L]          = Blind Base full dims  → output as-is: "BB423424R"
  WCOR[WW][HH][-L/-R]          = Corner Wall Cabinet   → output as-is: "WCOR2442-R"
  GMW[WW][HH][DD]              = Glass Mullion Wall    → output as-is
  QMW[WW][HH][DD]              = Tall Oven/MW Combo Cabinet → output as-is: "QMW096024"
  BMC[WW]                      = Microwave Base Cabinet→ output as-is: "BMC30"
  BWB[WW]                      = Blind Wall Base       → output as-is: "BWB18"
  HOOD[WW] or HOOD[WW]-[HH]   = Range Hood Cabinet    → output as-is: "HOOD30-12"
  V[WW][HH][DD] (HH ≥ 84)     = Tall Linen/Vanity     → output as-is: "V189622"
  W[WW][HH][DD] (HH ≥ 60)     = Tall deep wall unit   → output as-is: "W246024"

MICROWAVE CABINET — always normalize to "MW3030" in items:
  Any of: MW, MWHOOD, MW/HOOD, MW HOOD, OTR, MWAVE, MWC, MW3015, MW3018, MW3024, MW3030
  QMW[WW][HH][DD] with HH ≤ 42" = over-range microwave wall → output as-is: "QMW3030024"

APPLIANCES — go to non_cabinet_items ONLY, NEVER to items:
  RANGE, GAS RANGE, STOVE, COOKTOP, DW, DISH, DISHWASHER, REF, REFRIGERATOR, BAR REF, OVEN (standalone)
  HOOD (appliance hood, not the cabinet HOOD[WW]), WINE COOLER, BEVERAGE CENTER

════════════════════════════════════════════════════
STEP 5 — WALL GROUPING FOR DIMENSION VERIFICATION
════════════════════════════════════════════════════
After listing all cabinets, fill in the walls[] array. This lets the server verify widths add up.

For each wall or run of cabinets in the drawing:
  1. Read the total measured width from the dimension arrows (e.g. "121"", "97"", "79"")
  2. List the cabinet codes on that wall from LEFT → RIGHT in the order they appear
  3. Use the same codes you put in items[] — do not invent new codes here

Wall name examples: "top wall", "bottom wall", "left wall", "right wall",
"island left face", "island right face", "right column", "peninsula"

Important: only include walls that have an explicit total dimension label on the drawing.
Corner cabinets (WDC, WBC, BLB) count toward the wall where their body sits.
Appliances (range, dishwasher) occupy width but have no cabinet code — omit them from
cabinet_codes but still include their width in total_width_inches if they are part of that wall run.

════════════════════════════════════════════════════
QUANTITY RULES
════════════════════════════════════════════════════
  → List EVERY PHYSICAL LOCATION as a SEPARATE ENTRY with qty:1
  → Do NOT sum across locations — the server aggregates by model
  → Exception: if the label explicitly shows a multiplier like "3x W3030" or "W3030 (2)" → output qty as labeled
  → Same model in 6 locations = 6 separate entries, each with qty:1

════════════════════════════════════════════════════
NEVER OUTPUT THESE — automatic indicators of a reading error:
════════════════════════════════════════════════════
  Any bare number without a letter prefix (e.g. "36", "30", "24") — these are dimensions, not models
  SB06, SB09, SB12, SB15, SB18 — sink bases start at 24"
  B03, B06 — base cabinets start at 9"
  DB39, DB42, DB48 — drawer bases max out at 36"
  UC3036, UC3042, UC2460 — utility cabinets are 84/90/96" tall only
  OVD2484, OVD2490 — oven cabinets are 30" or 33" wide only
  V2736, V3030, V2424 (V with 4 digits) — these are wall cabinets, output as W[digits]
  W with 5 digits or 7 digits — recount, you dropped or added one digit

════════════════════════════════════════════════════
FULL CATALOG — validate and correct all reads against this list:
════════════════════════════════════════════════════
${KNOWN_MODELS.join(", ")}

Use the extract_cabinets tool to return your findings. Fill every field carefully:
  items → every cabinet box you read, one entry per physical location, qty:1, with location string
  review_items → any code that was partially obscured or ambiguous
  non_cabinet_items → appliances and non-cabinet items only`;

    const userContent: any[] = images.map((img) => ({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    }));

    userContent.push({
      type: "text",
      text: images.length > 1
        ? `Scan all ${images.length} pages. For every labeled cabinet box or rectangle: read the text label, record the model code and its location on the drawing. Call the extract_cabinets tool. One entry per physical cabinet, qty:1 each. Do not infer codes from dimension numbers.`
        : "Scan every cabinet box and rectangle in this drawing. Read the text label inside or adjacent to each box — that is the model code. Call the extract_cabinets tool. One entry per physical cabinet location, qty:1 each. Do not infer codes from dimension numbers.",
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "direct-fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_cabinets",
              description: "Extract all cabinet model codes and quantities from the blueprint drawing",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    description: "Every cabinet found. One entry per physical cabinet box on the drawing, qty:1.",
                    items: {
                      type: "object",
                      properties: {
                        model: { type: "string", description: "Cabinet model code exactly as labeled, e.g. 'W3030', 'DB363-3', 'FDB273409'" },
                        qty: { type: "integer", minimum: 1 },
                        location: { type: "string" },
                      },
                      required: ["model", "qty", "location"],
                    },
                  },
                  review_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        model: { type: "string" },
                        qty: { type: "integer", minimum: 1 },
                        location: { type: "string" },
                        confidence: { type: "string", enum: ["low", "medium"] },
                        reason: { type: "string" },
                      },
                      required: ["model", "qty", "confidence", "reason"],
                    },
                  },
                  non_cabinet_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        model: { type: "string" },
                        qty: { type: "integer" },
                        reason: { type: "string" },
                      },
                      required: ["model", "reason"],
                    },
                  },
                  walls: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        total_width_inches: { type: "number" },
                        cabinet_codes: { type: "array", items: { type: "string" } },
                      },
                      required: ["name", "total_width_inches", "cabinet_codes"],
                    },
                  },
                },
                required: ["items", "review_items", "non_cabinet_items"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_cabinets" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Lovable AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI request failed (${response.status}): ${errText}`);
    }

    let parsed: any;
    const aiData = await response.json();
    const message = aiData.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    const rawArgs = toolCall?.function?.arguments;

    try {
      if (rawArgs) {
        parsed = JSON.parse(rawArgs);
      } else {
        const rawContent = typeof message?.content === "string" ? message.content : "";
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No tool_call or JSON content in response:", JSON.stringify(aiData));
          return new Response(
            JSON.stringify({ error: "AI could not extract cabinets from this image. Try a clearer blueprint scan." }),
            { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI extraction response:", rawArgs || message?.content);
      throw new Error("Invalid tool response from AI");
    }

    const allNormalized = Array.isArray(parsed.items) ? parsed.items.map(normalizeResultItem).filter(Boolean) : [];
    const reviewItems = Array.isArray(parsed.review_items) ? parsed.review_items.map(normalizeResultItem).filter(Boolean) : [];

    // Aggregate by model (AI lists each occurrence separately, we sum here)
    const aggMap = new Map<string, any>();
    for (const item of allNormalized) {
      if (aggMap.has(item.model)) {
        const existing = aggMap.get(item.model);
        existing.qty += item.qty;
        if (typeof item.drawerCount === "number") {
          existing.drawerCount = Math.max(existing.drawerCount ?? 0, item.drawerCount);
        }
      } else {
        aggMap.set(item.model, { ...item });
      }
    }
    const aggregated = Array.from(aggMap.values());

    // MW height-matching rule: replace MW3030 with height-appropriate model
    // based on the dominant wall cabinet height in the drawing
    const wallHeights = aggregated
      .map((item: any) => {
        const m = item.model.match(/^W\d{2}(\d{2})$/);
        return m ? parseInt(m[1]) : null;
      })
      .filter((h: any) => h !== null && h >= 24) as number[];

    if (wallHeights.length > 0) {
      const freq: Record<number, number> = {};
      for (const h of wallHeights) freq[h] = (freq[h] || 0) + 1;
      const dominantHeight = parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
      const mwMap: Record<number, string> = { 30: "MW3015", 36: "MW3018", 42: "MW3024" };
      const mwModel = mwMap[dominantHeight];
      if (mwModel) {
        for (const item of aggregated) {
          if (item.model === "MW3030") {
            console.log(`MW height rule: wall cabinets ${dominantHeight}" → replacing MW3030 with ${mwModel}`);
            item.model = mwModel;
          }
        }
      }
    }

    console.log("AI raw items:", JSON.stringify(parsed.items?.slice(0, 20)));
    console.log("Aggregated items:", JSON.stringify(aggregated));

    const items = aggregated.filter((item: any) => KNOWN_MODELS.includes(item.model));
    const skipped = [
      ...aggregated.filter((item: any) => !KNOWN_MODELS.includes(item.model)),
      ...reviewItems,
    ];

    console.log(`Elevation: ${items.length} matched, ${skipped.length} review/unmatched`);

    // ── Wall dimension tally ──────────────────────────────────────────────
    const wall_check: any[] = [];
    if (Array.isArray(parsed.walls)) {
      for (const wall of parsed.walls) {
        if (!wall?.name || typeof wall.total_width_inches !== "number") continue;
        const measured = wall.total_width_inches;
        const codes: string[] = Array.isArray(wall.cabinet_codes) ? wall.cabinet_codes : [];
        let extracted = 0;
        for (const code of codes) {
          const w = getModelWidth(String(code));
          if (w != null) extracted += w;
        }
        const gap = measured - extracted;
        const status = Math.abs(gap) <= 6 ? "ok"
                     : gap > 24             ? "missing"
                     : gap > 0             ? "warning"
                     :                       "over";
        wall_check.push({ wall: wall.name, measured, cabinet_codes: codes, extracted, gap, status });
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    return new Response(JSON.stringify({ items, skipped, wall_check }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-elevation error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
