import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { guardAiRequest, validateImagesInput } from "../_shared/aiGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a senior architectural plan analyst for Green Cabinets NY, a professional kitchen and bath cabinet company in Brooklyn. Read floor plans and architectural drawings precisely and extract every cabinetry requirement room by room.

If multiple pages are sent, treat them as ONE unified project.

Extraction priority: explicit cabinet model codes (W3030, B24, DB36) > dimension labels (10'-6", 2440mm) > scale bar > estimation.

KITCHENS: per kitchen extract linear feet of cabinet runs, upper/lower cabinet counts, island (yes/no with size), peninsula.
BATHROOMS: per bathroom extract vanity width in inches, sink count, storage type.
CLOSETS: per closet with built-ins extract walk-in/reach-in, linear feet, shelving/drawers.

Sanity ranges: kitchen uppers 8-25 lf, bases 8-30 lf, master vanity 36-72", powder 18-36".

Always call the extract_analysis tool with the structured result.`;

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

    if (images.length === 0) throw new Error("No image data provided");
    const sizeGuard = validateImagesInput(images);
    if (sizeGuard) return new Response(await sizeGuard.text(), { status: sizeGuard.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userContent: any[] = images.map((img) => ({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    }));

    userContent.push({
      type: "text",
      text: images.length > 1
        ? `Analyze these ${images.length} blueprint pages together as one project. Call extract_analysis with the structured result.`
        : "Analyze this blueprint. Call extract_analysis with the structured result.",
    });

    const tools = [
      {
        type: "function",
        function: {
          name: "extract_analysis",
          description: "Extract structured blueprint analysis for cabinetry estimation",
          parameters: {
            type: "object",
            properties: {
              kitchens: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    linearFeet: { type: "number" },
                    upperCabinets: { type: "number" },
                    lowerCabinets: { type: "number" },
                    island: { type: "boolean" },
                    islandSize: { type: "string" },
                  },
                  required: ["name", "linearFeet", "upperCabinets", "lowerCabinets", "island", "islandSize"],
                  additionalProperties: false,
                },
              },
              bathrooms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    vanitySize: { type: "string" },
                    sinks: { type: "number" },
                    storage: { type: "string" },
                  },
                  required: ["name", "vanitySize", "sinks", "storage"],
                  additionalProperties: false,
                },
              },
              closets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    linearFeet: { type: "number" },
                    type: { type: "string" },
                    shelving: { type: "boolean" },
                    drawers: { type: "number" },
                  },
                  required: ["name", "linearFeet", "type", "shelving", "drawers"],
                  additionalProperties: false,
                },
              },
              totalSquareFootage: { type: "number" },
              floors: { type: "number" },
              notes: { type: "string" },
            },
            required: ["kitchens", "bathrooms", "closets", "totalSquareFootage", "floors"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "extract_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Lovable Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI request failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI could not extract data from this image. Try a clearer blueprint scan." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let analysis: any;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      return new Response(
        JSON.stringify({ error: "AI returned invalid data. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
