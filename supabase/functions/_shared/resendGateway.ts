// Routes Resend API calls through the Lovable connector gateway.
// Replaces direct https://api.resend.com calls so credentials stay managed
// by the Resend standard connector (LOVABLE_API_KEY + RESEND_API_KEY conn key).

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

function authHeaders(): Record<string, string> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": resendKey,
  };
}

export async function sendResendEmail(payload: Record<string, unknown>): Promise<Response> {
  return await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export const RESEND_GATEWAY_URL = GATEWAY_URL;
export const resendAuthHeaders = authHeaders;
