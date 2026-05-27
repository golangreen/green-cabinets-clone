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
    const { quoteHtml, customerEmail, customerName, subject, sendToCustomer } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    if (!quoteHtml) throw new Error("Quote HTML content is required");

    const headers = {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Always send to Green Cabinets
    const gcResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
        to: ["greencabinets@gmail.com"],
        reply_to: customerEmail || undefined,
        subject: subject || "New Quote Request — Green Cabinets Estimator",
        html: quoteHtml,
      }),
    });

    const gcData = await gcResponse.json();

    if (!gcResponse.ok) {
      console.error("Resend API error (GC):", gcResponse.status, JSON.stringify(gcData));
      return new Response(
        JSON.stringify({ error: gcData.message || `Email failed (${gcResponse.status})` }),
        { status: gcResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally send copy to customer
    let customerSent = false;
    if (sendToCustomer && customerEmail) {
      const custResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
          to: [customerEmail],
          subject: `Your Quote from Green Cabinets — ${subject?.replace(/^Quote Request: /, '') || ''}`.trim(),
          html: quoteHtml,
        }),
      });
      const custData = await custResponse.json();
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
