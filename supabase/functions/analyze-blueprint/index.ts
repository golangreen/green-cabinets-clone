import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    let images: { base64: string; mimeType: string }[] = [];
    if (body.images && Array.isArray(body.images)) {
      images = body.images;
    } else if (body.imageBase64) {
      images = [{ base64: body.imageBase64, mimeType: body.mimeType || "image/png" }];
    }

    if (images.length === 0) throw new Error("No image data provided");

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const systemPrompt = `You are a senior architectural plan analyst for Green Cabinets NY, a professional kitchen and bath cabinet company in Brooklyn. Your job is to read floor plans and architectural drawings with precision and extract every cabinetry requirement room by room. Accuracy is critical — this drives real cabinet orders.

You may receive one or more blueprint pages — treat them ALL as ONE unified project, the same building.

════════════════════════════════════════════════════
STEP 1 — READ THE DRAWING BEFORE ESTIMATING
════════════════════════════════════════════════════
Priority order for extracting measurements (highest to lowest):

1. EXPLICIT CABINET MODEL CODES on the drawing (e.g. W3030, B24, DB36)
   → If model codes exist: count them directly, do NOT estimate. Codes always override estimates.
   → Count every code visible, including inside cabinet outlines, in schedules, or in labels.

2. DIMENSION LABELS on the drawing (e.g. 10'-6", 126", 2440mm)
   → Read every dimension string — these are printed measurements, not guesses.
   → Convert feet+inches to decimal feet: 10'-6" = 10.5 ft linear
   → Convert millimeters to inches: 2440mm ÷ 25.4 = 96" = 8 ft
   → Use dimension arrows to determine which wall segment the measurement applies to.

3. SCALE BAR or STATED SCALE (e.g. "Scale: 1/4\" = 1'", "1:50")
   → If a scale is shown, use it to measure walls by comparing to the scale bar.
   → At 1/4"=1': every 1/4 inch on the drawing = 1 real foot.
   → At 1:50: 1mm on drawing = 50mm real = ~2 inches real.

4. ESTIMATION (only when none of the above are available)
   → Estimate conservatively based on room size and layout.
   → A wall with cabinets running its full length ≈ wall length in linear feet.

════════════════════════════════════════════════════
STEP 2 — IDENTIFY AND NAME EVERY ROOM
════════════════════════════════════════════════════
Use the EXACT room label printed on the drawing when available (e.g. "MASTER BATH", "KITCHEN 2", "UNIT 3A").
If no label: use location context ("Front Bathroom", "Second Floor Kitchen", "Unit 1 Kitchen").

For multi-unit buildings (apartment buildings, condos, townhomes):
→ Identify each unit separately — never combine units.
→ Label them exactly as shown: "Unit 1 Kitchen", "Unit 2 Kitchen", etc.
→ Count the total number of units and note if all units are identical.

════════════════════════════════════════════════════
STEP 3 — EXTRACT PER-ROOM REQUIREMENTS
════════════════════════════════════════════════════

KITCHENS — for each kitchen extract:
  • Upper cabinet runs: linear feet along each wall that has wall cabinets
    Standard wall cabinet depth = 12". Look for thin rectangles high on the wall.
  • Lower cabinet runs: linear feet along each wall that has base cabinets
    Standard base cabinet depth = 24". Look for thick rectangles along walls.
  • Upper cabinet count: number of individual upper cabinet units (if model codes exist)
  • Lower cabinet count: number of individual base cabinet units (if model codes exist)
  • Island: yes/no. If yes → estimated dimensions in inches (length × width)
    Standard island base cabinet depth = 24". Typical island: 36"-96" long.
  • Peninsula: yes/no. If yes → estimated linear feet.
  • Note any appliance spaces (range, dishwasher, refrigerator) — these break the cabinet run.
    Range space = typically 30" or 36". Refrigerator space = typically 33"-36". DW = 24".

BATHROOMS — for each bathroom extract:
  • Exact name from drawing (Master Bath, Powder Room, Hall Bath, etc.)
  • Vanity width in inches. Most common: 24", 30", 36", 48", 60", 72"
    If a dimension is labeled → use it. If not → estimate from room width and layout.
  • Single sink (1) or double sink (2)
    Double sinks are common on vanities 60"+ wide.
  • Storage type: linen tower / medicine cabinet / wall cabinets above toilet / none
    Powder rooms (half baths): rarely more than a 24-36" vanity.

CLOSETS — for each closet with built-in cabinetry:
  • Walk-in or reach-in
  • Linear feet of shelving/rod runs
  • Whether drawers or organizers are shown (not just rods)

════════════════════════════════════════════════════
TYPICAL RANGES — sanity-check your numbers:
════════════════════════════════════════════════════
  Kitchen upper cabinets:  8–25 linear feet (small galley to large U-shape)
  Kitchen base cabinets:   8–30 linear feet
  Master bath vanity:      36"–72" wide (commonly 48" or 60")
  Powder room vanity:      18"–36" wide
  Upper cabinet height:    30" or 36" typical (42" for 9' ceilings)
  Base cabinet height:     34.5" standard (with countertop = 36")
  Island width:            24"–36" deep, 36"–96"+ long

If your numbers fall far outside these ranges, recheck the drawing.

════════════════════════════════════════════════════
NOTES FIELD — include any of the following if present:
════════════════════════════════════════════════════
  • Non-standard ceiling height (8', 9', 10', vaulted)
  • Multiple stories (note which rooms are on each floor)
  • Existing cabinets to be kept (noted as "EXISTING")
  • Specialty areas: butler's pantry, laundry room cabinetry, bar area
  • Any rooms with cabinet codes on the plan (this is noted for the extraction step)
  • Scale notation visible on the drawing

Provide measurements as accurately as the drawing allows. When estimating, note that it is an estimate. It is better to underestimate and let the sales team adjust than to over-promise.`;

    const userContent: any[] = images.map((img) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: img.base64,
      },
    }));

    userContent.push({
      type: "text",
      text: images.length > 1
        ? `Analyze these ${images.length} blueprint pages together as one project. Extract all kitchen, bathroom, and closet cabinetry requirements. Use the extract_analysis tool.`
        : "Analyze this blueprint and extract all kitchen, bathroom, and closet cabinetry requirements. Use the extract_analysis tool.",
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 4096,
        system: systemPrompt,
        tools: [
          {
            name: "extract_analysis",
            description: "Extract structured blueprint analysis for cabinetry estimation",
            input_schema: {
              type: "object",
              properties: {
                kitchens: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Room name e.g. 'Kitchen', 'Unit 2 Kitchen'" },
                      linearFeet: { type: "number", description: "Total linear feet of cabinet runs" },
                      upperCabinets: { type: "number", description: "Count of upper/wall cabinet units" },
                      lowerCabinets: { type: "number", description: "Count of lower/base cabinet units" },
                      island: { type: "boolean" },
                      islandSize: { type: "string", description: "e.g. '48x36 island' or 'none'" },
                    },
                    required: ["name", "linearFeet", "upperCabinets", "lowerCabinets", "island", "islandSize"],
                  },
                },
                bathrooms: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "e.g. 'Master Bath', 'Hall Bath', 'Powder Room'" },
                      vanitySize: { type: "string", description: "Width in inches e.g. '36\"' or '60\" double'" },
                      sinks: { type: "number" },
                      storage: { type: "string", description: "e.g. 'Linen tower + medicine cabinet'" },
                    },
                    required: ["name", "vanitySize", "sinks", "storage"],
                  },
                },
                closets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      linearFeet: { type: "number" },
                      type: { type: "string", description: "Walk-in or Reach-in" },
                      shelving: { type: "boolean" },
                      drawers: { type: "number" },
                    },
                    required: ["name", "linearFeet", "type", "shelving", "drawers"],
                  },
                },
                totalSquareFootage: { type: "number" },
                floors: { type: "number" },
                notes: { type: "string", description: "Any important observations about the project" },
              },
              required: ["kitchens", "bathrooms", "closets", "totalSquareFootage", "floors"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "extract_analysis" },
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Anthropic request failed (${response.status}): ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolUse = data.content?.find((c: any) => c.type === "tool_use" && c.name === "extract_analysis");

    if (!toolUse?.input) {
      console.error("No tool_use in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI could not extract data from this image. Try a clearer blueprint scan." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = toolUse.input;
    analysis.kitchens = (analysis.kitchens || []).map((k: any, i: number) => ({ ...k, id: i + 1 }));
    analysis.bathrooms = (analysis.bathrooms || []).map((b: any, i: number) => ({ ...b, id: i + 1 }));
    analysis.closets = (analysis.closets || []).map((c: any, i: number) => ({ ...c, id: i + 1 }));

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-blueprint error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
