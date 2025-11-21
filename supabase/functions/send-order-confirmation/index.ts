import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  sessionId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId }: OrderConfirmationRequest = await req.json();
    
    console.log("Fetching Stripe session:", sessionId);
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });

    if (!session.customer_details?.email) {
      throw new Error("No customer email found in session");
    }

    const customerEmail = session.customer_details.email;
    const customerName = session.customer_details.name || "Valued Customer";
    const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";
    const currency = session.currency?.toUpperCase() || "USD";

    // Build order items HTML
    let orderItemsHtml = '';
    if (session.line_items?.data) {
      orderItemsHtml = session.line_items.data.map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.description || 'Item'}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${currency} ${(item.amount_total / 100).toFixed(2)}
          </td>
        </tr>
      `).join('');
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Green Cabinets <orders@greencabinetsny.com>",
      to: [customerEmail],
      subject: "Order Confirmation - Green Cabinets NY",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2dd4bf 0%, #1aa39a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
            .order-details { margin: 20px 0; }
            .total { font-size: 1.5em; font-weight: bold; color: #2dd4bf; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            .button { display: inline-block; background: #2dd4bf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✓ Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
            </div>
            
            <div class="content">
              <p>Hi ${customerName},</p>
              
              <p>We're excited to confirm your order! Your payment has been successfully processed and we're preparing to start work on your custom cabinetry.</p>
              
              <div class="order-details">
                <h2 style="color: #2dd4bf; border-bottom: 2px solid #2dd4bf; padding-bottom: 10px;">Order Details</h2>
                <p><strong>Order Reference:</strong> ${sessionId.substring(0, 20)}...</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              ${orderItemsHtml ? `
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItemsHtml}
                  </tbody>
                </table>
              ` : ''}

              <div class="total">
                Total Paid: ${currency} ${amount}
              </div>

              <div style="background: #f0fdfa; border-left: 4px solid #2dd4bf; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2dd4bf;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Our team will review your order within 24 hours</li>
                  <li>We'll contact you to confirm specifications and measurements</li>
                  <li>Production will begin once all details are finalized</li>
                  <li>We'll keep you updated throughout the process</li>
                </ul>
              </div>

              <p>If you have any questions or need to make changes, please don't hesitate to reach out:</p>
              <p>
                📧 Email: <a href="mailto:orders@greencabinetsny.com">orders@greencabinetsny.com</a><br>
                📞 Phone: <a href="tel:+17188045488">(718) 804-5488</a>
              </p>

              <a href="${req.headers.get("origin") || "https://greencabinetsny.com"}" class="button">
                View Order Status
              </a>
            </div>

            <div class="footer">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Green Cabinets NY<br>
                Premium Custom Cabinetry<br>
                <a href="mailto:orders@greencabinetsny.com" style="color: #2dd4bf;">orders@greencabinetsny.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        orderDetails: {
          amount,
          currency,
          customerEmail,
          customerName,
          sessionId: session.id,
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
