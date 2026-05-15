// Suggest caption + alt text + neighborhood for an uploaded gallery image.
// Admin-only: verifies the caller's JWT and admin role before calling Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, handleCorsRequest } from "../_shared/cors.ts";

const NEIGHBORHOODS = [
  "bushwick", "williamsburg", "park-slope", "soho", "long-island-city",
  "dumbo", "brooklyn-heights", "tribeca", "upper-east-side", "astoria",
];

const SYSTEM_PROMPT = `You are an SEO copywriter for Green Cabinets NY, a Brooklyn-based custom kitchen cabinet maker.
Look at the kitchen photo and return JSON with:
- caption: 6-12 words, describes the cabinetry style (wood, color, layout). No addresses. No fluff.
  Examples: "Two-tone walnut shaker with brass pulls", "White inset cabinets with custom range hood".
- alt_text: 10-20 words, SEO-friendly, mentions "custom kitchen cabinets" and the neighborhood + Brooklyn/NYC if relevant.
- suggested_neighborhood: one of [${NEIGHBORHOODS.join(", ")}] that best matches the style/architecture clues, or null if uncertain.
Be concise and accurate. Never invent details you cannot see.`;

Deno.serve(async (req) => {
  const pre = handleCorsRequest(req);
  if (pre) return pre;

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin required" }, 403);

    const body = await req.json().catch(() => null) as { image_url?: string; filename_hint?: string } | null;
    if (!body?.image_url || typeof body.image_url !== "string") {
      return json({ error: "image_url is required" }, 400);
    }
    // Only allow http(s) URLs
    if (!/^https?:\/\//i.test(body.image_url)) {
      return json({ error: "image_url must be a public URL" }, 400);
    }

    const filenameHint = (body.filename_hint || "").toLowerCase().slice(0, 200);
    const userPrompt = filenameHint
      ? `Filename hint (may contain a neighborhood): "${filenameHint}". Analyze the photo and return JSON.`
      : "Analyze this kitchen photo and return JSON.";

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: body.image_url } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "gallery_caption",
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["caption", "alt_text", "suggested_neighborhood"],
              properties: {
                caption: { type: "string" },
                alt_text: { type: "string" },
                suggested_neighborhood: {
                  type: ["string", "null"],
                  enum: [...NEIGHBORHOODS, null],
                },
              },
            },
          },
        },
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited, try again shortly." }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!aiResp.ok) {
      const t = await aiResp.text();
      return json({ error: `AI error ${aiResp.status}: ${t.slice(0, 300)}` }, 500);
    }

    const aiData = await aiResp.json();
    const content = aiData?.choices?.[0]?.message?.content;
    let parsed: { caption: string; alt_text: string; suggested_neighborhood: string | null };
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      return json({ error: "AI returned invalid JSON", raw: content }, 500);
    }

    return json({
      caption: String(parsed.caption || "").slice(0, 200),
      alt_text: String(parsed.alt_text || "").slice(0, 300),
      suggested_neighborhood:
        parsed.suggested_neighborhood && NEIGHBORHOODS.includes(parsed.suggested_neighborhood)
          ? parsed.suggested_neighborhood
          : null,
    });
  } catch (err) {
    console.error("suggest-gallery-caption error", err);
    return json({ error: "An internal error occurred. Please try again." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
