import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KNOWN_MODELS = [
  "W0612","W0912","W1212","W1512","W1812","W2112","W2412","W2712","W3012","W3312","W3612","W3912",
  "W0915","W1215","W1515","W1815","W2115","W2415","W2715","W3015","W3315","W3615",
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
  "OC3084","OC3096","BSR09",
  "BLB36","BLB39","BLB42","BLB45","BLB48","BB36L","BB36R",
  "BLW2730","BLW3030","BLW3036","BLW3336","BLW3642","BLW4236","BLW4536",
  "CW2430","CW2436","CW2442",
  "WSQ2430","WSQ2436","WSQ2442",
  "WEC1230","WEC1236","WEC1242",
  "MCB3024","MCB3084","MCB3384","MCB3630",
  "MW3030",
  "V24","V24DL","V24DR","V30","V36","V48","V60",
  "UC1884","UC1890","UC1896","UC2484","UC2490","UC2496","UC2784","UC2790","UC2796","UC3084","UC3090","UC3096",
  "CSB36","CSB42","LSB36","LSB42","EZR33","EZR36",
  "DSB36L","DSB36R","BWBK18","BWKW15",
  "WR3018","AGD2418","WH30","BEC24L","BEC24R",
  "ROT12","ROT15","ROT18","ROT21","ROT24","ROT30","ROT36",
  "CMD2","CMD4","TLM8","SM8","OCM8","RCRM","LTRM","WDM","TK8",
  "RAS-5758-36","RAS-5773-08","RAS-5743-20","RAS-5349-1550DM-2","RAS-5349-1527DM-1",
  "RAS-5349-2150DM-2","RAS-4WDB-15","RAS-4WDB-18","RAS-4WDB-21","RAS-4WDB-24",
  "RAS-4SDI-18","RAS-4WCT-1","RAS-4DPS-3021","RAS-6012-18-11-52","RAS-5PSP-15-CR","RAS-544-10C-1",
  "FP4896-3/4","FP4896-1/4","RP2496","DWP3","DWP3/4","DW3",
  "REP84","REP96","REP843","REP963","BP4896",
  "BDE24","WDE1230","OWF6","BF3","BF6","TF3X96","TF6X96",
  "WF330","WF336","WF342","WF630","WF636","WF642",
  "VAL30","VAL48","WS30","WS36","WS42","BS24",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { textContent } = body;

    let images: { base64: string; mimeType: string }[] = [];
    if (body.images && Array.isArray(body.images)) {
      images = body.images;
    } else if (body.imageBase64) {
      images = [{ base64: body.imageBase64, mimeType: body.mimeType || "image/png" }];
    }

    if (!textContent && images.length === 0) {
      throw new Error("Provide either textContent or images");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a cabinet order list parser for Green Cabinets NY. Your job is to extract every cabinet model number and quantity from the input — whether it is a typed list, a scanned document, a 2020 Design export, or a supplier quote. Accuracy is critical: every model and quantity must be correct.

KNOWN CATALOG MODELS:
${KNOWN_MODELS.join(", ")}

════════════════════════════════════════════════════
STEP 1 — IDENTIFY THE FORMAT
════════════════════════════════════════════════════
Before extracting, determine what format this is:

[A] PLAIN TEXT LIST — lines like "W3030 x2", "3x B24", "SB36 - qty 1"
[B] 2020 DESIGN EXPORT — 6-digit codes: W302112, B273424, DB363424
[C] SUPPLIER/VENDOR QUOTE — may have prefixes: "SW-W3030", "RB10-SB36", "CW-B24"
[D] SCANNED IMAGE — printed or handwritten list; apply OCR correction rules
[E] SPREADSHEET / TABLE — columns like Item | Description | Qty | Unit Price

For each format, find where the model codes and quantities are. Ignore everything else (descriptions, prices, labor, delivery, tax, notes, room labels used as section headers).

════════════════════════════════════════════════════
STEP 2 — EXTRACT EVERY LINE WITH A CABINET MODEL
════════════════════════════════════════════════════
Go through the input line by line (or cell by cell for tables). For each line:
  → Does it contain an alphanumeric cabinet model code? → Extract model + qty
  → Is it a room/section header (e.g. "KITCHEN", "BATHROOM 1", "MASTER BED")? → Skip, it's a label
  → Is it a non-cabinet item (delivery, labor, tax, filler, panel, molding)? → Skip
  → Is it an appliance (range, dishwasher, refrigerator, cooktop)? → Skip
  → Unknown code that looks like a cabinet? → Include it in output (system handles unmatched)

QUANTITY RULES:
  → If no quantity shown → default to 1
  → Formats: "x2", "×2", "(2)", "qty: 2", "2x", "2 ea", "2 pcs", "QTY 2" → all mean qty=2
  → If the same model appears on multiple lines → SUM the quantities
  → Treat each model as a single output entry with the total quantity

════════════════════════════════════════════════════
STEP 3 — NORMALIZE ALL MODEL CODES
════════════════════════════════════════════════════
Apply ALL normalization rules in order:

RULE 1 — Strip vendor/catalog prefixes (remove only the prefix, keep the model):
  Prefixes to strip: SW-, CW-, RB10-, RB23-, RB-, A10-, KCD-, MER-, KCB-, ITK-, SCB-, ANN-
  Examples: "SW-W1530"→W1530, "RB10-SB36"→SB36, "RB23-B15R"→B15 (then strip R), "KCD-W3030"→W3030

RULE 2 — Strip L/R hinge suffixes (EXCEPT models where L/R is part of the code):
  Strip: B18L→B18, B21R→B21, B36-L→B36, W3030-R→W3030
  KEEP L/R on these models (L/R is part of the catalog code):
    WD2430L, WD2430R, WD2436L, WD2436R, WD2442L, WD2442R, WD2736R
    DSB36L, DSB36R, BEC24L, BEC24R, BB36L, BB36R

RULE 3 — 2020 Design 6-digit wall codes W[WW][HH][DD]:
  Last 2 digits are DEPTH, not part of the catalog model for walls
  "W302112"→W3021 (keep 4 digits only if W3021 is NOT in catalog — check first)
  "W243912"→W2436 (39"H closest catalog height is 36, depth 12" standard)
  "W273612"→W2736 (exact match — keep as-is)
  Catalog heights: 12, 15, 18, 24, 30, 36, 42 → map non-standard heights to nearest

RULE 4 — 2020 Design 6-digit base codes B[WW][HH][DD]:
  Strip to B[WW]: "B273424"→B27, "B363424"→B36

RULE 5 — 2020 Design drawer base DB[WW][HH][DD]:
  Strip to DB[WW]: "DB363424"→DB36, "DB303424"→DB30
  Exception: DB[WW]-[N] (explicit drawer count) → keep: "DB36-3"→DB36-3

RULE 6 — Bare 4-digit numbers = wall cabinet code:
  "3636"→W3636, "2136"→W2136, "3030"→W3030
  Map to nearest catalog height if needed.

RULE 7 — FDB prefix = Full Door Base:
  "FDB24"→DB24 (Full Door Base maps to DB), "FDB18-12"→DB18

RULE 8 — Blind wall/base codes:
  BLW[WW]/[WW] = use SECOND number: "BLW27/30"→BLW3030, "BLW30/36"→BLW3036
  BLB[WW]/[WW] = use SECOND number: "BLB36/39"→BLB39, "BLB39/42"→BLB42

RULE 9 — OV prefix = Oven cabinet → OVD:
  "OV3084"→OVD3084, "OV3390"→OVD3390

RULE 10 — UC = Utility Cabinet (heights ONLY 84, 90, 96):
  Map non-standard heights: UC3085→UC3084, UC2492→UC2490, UC3097→UC3096

RULE 11 — Microwave cabinet normalization → MW3030:
  MW, MWAVE, MWHOOD, MW/HOOD, MWC, OTR, MW3015, MW3018, MW3024 → all become MW3030

════════════════════════════════════════════════════
SKIP THESE — they are not cabinet models:
════════════════════════════════════════════════════
  Delivery / Shipping / Freight
  Labor / Installation / Assembly
  Tax / Discount / Credit
  Fillers: BF3, BF6, TF3X96, TF6X96 (decorative fillers — NOT cabinets for pricing)
  Molding / Crown / Light Rail (decorative trim)
  Appliances: Range, Stove, Cooktop, Dishwasher, Refrigerator, Hood (appliance), Wine Cooler
  Room labels used as headers: "Kitchen", "Bathroom", "Master Bedroom"
  Page headers, totals rows, sub-total rows

════════════════════════════════════════════════════
OCR CORRECTION (for scanned images):
════════════════════════════════════════════════════
  0 ↔ 6 → "SB06"→SB36, "B06"→B36
  3 ↔ 8 → "DB83"→DB36 or DB33
  1 ↔ 7 → "B71"→B27 or B21
  5 ↔ 6 → "SB56"→SB36
  V ↔ W → "V3030"→W3030 (if not a valid V model)
  F ↔ E → "EDB36"→FDB36→DB36

════════════════════════════════════════════════════
Return ONLY valid JSON, no markdown, no explanation:
{"items": [{"model": "W3030", "qty": 2}, {"model": "B24", "qty": 3}, {"model": "SB36", "qty": 1}]}

Include ALL extracted items even if not in the known catalog — the system separates matched from unmatched.
Do NOT include appliances, fillers, labor, or non-cabinet items.`;

    const userContent: any[] = [];

    if (images.length > 0) {
      for (const img of images) {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
        });
      }
      userContent.push({
        type: "text",
        text: images.length > 1
          ? `Extract all cabinet models and quantities from these ${images.length} pages. Combine results, sum duplicate models.`
          : "Extract all cabinet models and quantities from this image.",
      });
    } else {
      userContent.push({
        type: "text",
        text: `Extract cabinet models and quantities from this text:\n\n${textContent}`,
      });
    }

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
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Lovable AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit — try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI request failed (${response.status})`);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";


    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    const parsed = JSON.parse(jsonMatch[0]);
    const allItems = parsed.items || [];
    const items = allItems.filter(
      (i: any) => KNOWN_MODELS.includes(i.model) && typeof i.qty === "number" && i.qty > 0
    );
    const skipped = allItems.filter(
      (i: any) => !KNOWN_MODELS.includes(i.model) && i.model && typeof i.qty === "number" && i.qty > 0
    );

    console.log(`Parsed ${items.length} matched, ${skipped.length} unmatched`);

    return new Response(JSON.stringify({ items, skipped }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-cabinet-list error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
