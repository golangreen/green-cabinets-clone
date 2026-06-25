// Shared auth + rate-limit guard for AI-backed edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 15;
const MAX_PAYLOAD_BYTES = 25 * 1024 * 1024; // 25 MB raw body
const MAX_IMAGE_COUNT = 12;

function ipOf(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now > rec.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

export interface AiGuardOptions {
  corsHeaders: Record<string, string>;
  requireAuth?: boolean;
}

/**
 * Returns a Response (to short-circuit) if the request is rejected, otherwise undefined.
 * Enforces: optional authenticated JWT, per-IP rate limit, payload size cap.
 */
export async function guardAiRequest(
  req: Request,
  opts: AiGuardOptions
): Promise<Response | undefined> {
  const { corsHeaders, requireAuth = true } = opts;
  const ip = ipOf(req);

  // Payload size check (Content-Length may be missing for streamed bodies)
  const len = req.headers.get("content-length");
  if (len && Number(len) > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({ error: "Payload too large." }),
      { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!checkRateLimit(ip)) {
    console.warn(`AI rate limit exceeded for IP: ${ip}`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (requireAuth) {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return new Response(
          JSON.stringify({ error: "Authentication required." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.error("Auth verification error:", e);
      return new Response(
        JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return undefined;
}

export function validateImagesInput(images: unknown[]): Response | undefined {
  if (images.length > MAX_IMAGE_COUNT) {
    return new Response(
      JSON.stringify({ error: `Too many images (max ${MAX_IMAGE_COUNT}).` }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }
  return undefined;
}
