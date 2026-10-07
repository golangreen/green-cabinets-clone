// Sends email through Resend with the project's own RESEND_API_KEY
// (greencabinetsny.com is verified in the "greencabinets" Resend account).

const RESEND_URL = "https://api.resend.com";

function authHeaders(): Record<string, string> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${resendKey}`,
  };
}

export async function sendResendEmail(payload: Record<string, unknown>): Promise<Response> {
  return await fetch(`${RESEND_URL}/emails`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export const RESEND_GATEWAY_URL = RESEND_URL;
export const resendAuthHeaders = authHeaders;
