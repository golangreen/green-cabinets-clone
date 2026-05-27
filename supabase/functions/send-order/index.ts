import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildOrderEmailHtml(orderNumber: string, order: Record<string, string>, snapshot: Record<string, any>, forCustomer = false): string {
  const total = fmt(snapshot.grandTotal ?? 0);
  const collection = (snapshot.collection ?? "luxor").charAt(0).toUpperCase() + (snapshot.collection ?? "luxor").slice(1);
  const stdItems = snapshot.items ?? [];
  const customItems = snapshot.customItems ?? [];
  const addOnItems = snapshot.addOnItems ?? [];
  const itemCount = stdItems.length + customItems.length + addOnItems.length;

  const itemRows = [
    ...stdItems.map((item: any) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;color:#6b7280">${item.model}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${item.description}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px">${item.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px">${fmt(item.lineTotal)}</td>
    </tr>`),
    ...customItems.map((item: any) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-style:italic">custom</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${item.description}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px">${item.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px">${fmt(item.lineTotal)}</td>
    </tr>`),
    ...addOnItems.map((item: any) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-style:italic">add-on</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${item.name} (${item.linearFeet} lf)</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px">—</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px">${fmt(item.lineTotal)}</td>
    </tr>`),
  ].join("");

  const greeting = forCustomer
    ? `<p>Hi ${order.name},</p><p>Thank you for your order! Here's a summary of what you submitted. Our team at Green Cabinets NY will contact you within 24 hours to confirm the details and schedule your installation.</p>`
    : `<p><strong>New Order Received</strong> — a customer has placed an order through the estimator app.</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

  <!-- Header -->
  <div style="background:#1eae53;padding:32px 32px 24px">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Green Cabinets NY</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Order Confirmation · ${orderNumber}</p>
  </div>

  <!-- Body -->
  <div style="padding:32px">
    ${greeting}

    <!-- Order details -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0">
      <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#166534">Order Details</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 0;color:#6b7280;width:140px">Order #</td><td style="padding:4px 0;font-weight:600">${orderNumber}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Collection</td><td style="padding:4px 0">${collection}</td></tr>
        ${order.doorStyle ? `<tr><td style="padding:4px 0;color:#6b7280">Door Style</td><td style="padding:4px 0">${order.doorStyle}</td></tr>` : ""}
        ${order.finish ? `<tr><td style="padding:4px 0;color:#6b7280">Finish & Color</td><td style="padding:4px 0">${order.finish}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#6b7280">Grand Total</td><td style="padding:4px 0;font-size:18px;font-weight:700;color:#1eae53">${total}</td></tr>
      </table>
    </div>

    <!-- Customer info -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0">
      <h2 style="margin:0 0 12px;font-size:15px;font-weight:600">Customer Information</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 0;color:#6b7280;width:140px">Name</td><td style="padding:4px 0">${order.name}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Phone</td><td style="padding:4px 0"><a href="tel:${order.phone}" style="color:#1eae53">${order.phone}</a></td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Email</td><td style="padding:4px 0"><a href="mailto:${order.email}" style="color:#1eae53">${order.email}</a></td></tr>
        <tr><td style="padding:4px 0;color:#6b7280">Delivery address</td><td style="padding:4px 0">${order.address}</td></tr>
        ${order.installDate ? `<tr><td style="padding:4px 0;color:#6b7280">Preferred install</td><td style="padding:4px 0">${order.installDate}</td></tr>` : ""}
        ${order.notes ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top">Notes</td><td style="padding:4px 0">${order.notes}</td></tr>` : ""}
      </table>
    </div>

    <!-- Cabinet line items -->
    ${itemCount > 0 ? `
    <h2 style="font-size:15px;font-weight:600;margin:24px 0 12px">Cabinet List (${itemCount} line${itemCount !== 1 ? "s" : ""})</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="background:#f8fafc">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600">Model</th>
          <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600">Description</th>
          <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600">Qty</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;color:#6b7280;font-weight:600">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:10px 8px;text-align:right;font-weight:700;border-top:2px solid #1eae53">Grand Total</td>
          <td style="padding:10px 8px;text-align:right;font-weight:700;font-size:16px;color:#1eae53;border-top:2px solid #1eae53">${total}</td>
        </tr>
      </tfoot>
    </table>` : ""}

    ${forCustomer ? `
    <div style="margin:28px 0 0;padding:16px;background:#fefce8;border:1px solid #fde047;border-radius:10px;font-size:13px;color:#713f12">
      <strong>Note:</strong> This estimate is based on the cabinet selection in our app. Final pricing may vary after on-site measurement. A team member will confirm pricing before production begins.
    </div>

    <p style="font-size:14px;margin-top:24px">Questions? Call us at <a href="tel:+17188045488" style="color:#1eae53;font-weight:600">(718) 804-5488</a> or reply to this email.</p>` : `
    <p style="font-size:14px;color:#6b7280;margin-top:24px">Reply to this email to contact the customer directly at ${order.email}.</p>`}
  </div>

  <!-- Footer -->
  <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center">
    <p style="margin:0;font-size:12px;color:#9ca3af">Green Cabinets NY · 10 Montieth St, Bushwick, Brooklyn · (718) 804-5488</p>
  </div>
</div>
</body></html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order, quoteSnapshot } = await req.json();

    if (!order?.name || !order?.phone || !order?.email || !order?.address) {
      return new Response(
        JSON.stringify({ error: "name, phone, email, and address are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Save order to database
    let orderNumber = `GC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          order_number: "",            // trigger will overwrite
          customer_name: order.name,
          customer_phone: order.phone,
          customer_email: order.email,
          delivery_address: order.address,
          preferred_install_date: order.installDate || null,
          notes: order.notes || null,
          collection: quoteSnapshot.collection || "luxor",
          grand_total: quoteSnapshot.grandTotal ?? 0,
          quote_snapshot: quoteSnapshot,
          status: "pending",
        }),
      });

      if (dbRes.ok) {
        const [saved] = await dbRes.json();
        if (saved?.order_number) orderNumber = saved.order_number;
      } else {
        console.error("DB insert failed:", await dbRes.text());
      }
    }

    const resendHeaders = {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Email to Green Cabinets
    const gcHtml = buildOrderEmailHtml(orderNumber, order, quoteSnapshot, false);
    const gcRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: resendHeaders,
      body: JSON.stringify({
        from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
        to: ["greencabinets@gmail.com"],
        reply_to: order.email,
        subject: `New Order ${orderNumber} — ${order.name} — $${(quoteSnapshot.grandTotal ?? 0).toLocaleString()}`,
        html: gcHtml,
      }),
    });
    const gcResBody = await gcRes.json();
    console.log("Resend GC email status:", gcRes.status, JSON.stringify(gcResBody));

    // Confirmation email to customer
    const custHtml = buildOrderEmailHtml(orderNumber, order, quoteSnapshot, true);
    const custRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: resendHeaders,
      body: JSON.stringify({
        from: "Green Cabinets NY <orders@greencabinetsny.com>",
        to: [order.email],
        subject: `Order Confirmed — ${orderNumber} — Green Cabinets NY`,
        html: custHtml,
      }),
    });
    const custResBody = await custRes.json();
    console.log("Resend customer email status:", custRes.status, JSON.stringify(custResBody));

    return new Response(
      JSON.stringify({ success: true, orderNumber }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-order error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
