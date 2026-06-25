import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { quoteHtml, customerEmail, customerName, subject, sendToCustomer } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("Missing email credentials");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!quoteHtml || typeof quoteHtml !== "string") {
      return new Response(JSON.stringify({ error: "Quote HTML content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gatewayHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
      "Content-Type": "application/json",
    };

    // Always send to Green Cabinets
    const gcResponse = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: gatewayHeaders,
      body: JSON.stringify({
        from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
        to: ["orders@greencabinetsny.com"],
        reply_to: customerEmail || undefined,
        subject: subject || "New Quote Request — Green Cabinets Estimator",
        html: quoteHtml,
      }),
    });

    const gcData = await gcResponse.json().catch(() => ({}));

    if (!gcResponse.ok) {
      console.error("Resend gateway error (GC):", gcResponse.status, JSON.stringify(gcData));
      return new Response(
        JSON.stringify({ error: "Failed to send quote" }),
        { status: gcResponse.status || 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally send copy to customer
    let customerSent = false;
    if (sendToCustomer && customerEmail) {
      const custResponse = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: gatewayHeaders,
        body: JSON.stringify({
          from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
          to: [customerEmail],
          subject: `Your Quote from Green Cabinets — ${subject?.replace(/^Quote Request: /, '') || ''}`.trim(),
          html: quoteHtml,
        }),
      });
      const custData = await custResponse.json().catch(() => ({}));
      if (custResponse.ok) {
        customerSent = true;
        console.log("Customer copy sent:", custData.id);
      } else {
        console.error("Customer copy failed:", custResponse.status, JSON.stringify(custData));
      }
    }

    console.log("Email sent:", gcData.id);
    return new Response(JSON.stringify({ success: true, id: gcData.id, customerSent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-quote error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
