import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const orderItemSchema = z.object({
  variantId: z.string().min(1),
  productTitle: z.string().min(1).max(200),
  quantity: z.number().int().positive().max(100),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  customAttributes: z.array(z.object({
    key: z.string().max(100),
    value: z.string().max(500)
  })).optional()
});

const orderItemsSchema = z.array(orderItemSchema).min(1).max(50);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const SHOPIFY_ADMIN_API_VERSION = "2025-01";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Webhook received");

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Webhook signature verified:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Processing completed checkout session:", session.id);

      // Extract order items from metadata
      const orderItemsJson = session.metadata?.order_items;
      if (!orderItemsJson) {
        console.error("No order items found in session metadata");
        return new Response(JSON.stringify({ error: "No order items in metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let orderItems;
      try {
        orderItems = JSON.parse(orderItemsJson);
      } catch (parseError) {
        console.error("Failed to parse order items:", parseError);
        return new Response(JSON.stringify({ error: "Invalid order items format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate order items structure
      const validationResult = orderItemsSchema.safeParse(orderItems);
      if (!validationResult.success) {
        console.error("Order items validation failed:", validationResult.error);
        return new Response(JSON.stringify({ 
          error: "Invalid order items data",
          details: validationResult.error.errors 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Validated order items:", orderItems);

      // Get customer details and sanitize
      const customerName = (session.metadata?.customer_name || "Customer").trim().substring(0, 100);
      const customerEmail = session.customer_details?.email || session.customer_email || "";

      // Create Shopify order
      const shopifyDomain = Deno.env.get("SHOPIFY_STORE_PERMANENT_DOMAIN");
      const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");

      if (!shopifyDomain || !shopifyAccessToken) {
        throw new Error("Shopify credentials not configured");
      }

      // Build line items for Shopify
      const lineItems = orderItems.map((item: any) => {
        const customTotal = item.customAttributes?.find((attr: any) => 
          attr.key === "Total Estimate"
        );
        
        const totalValue = customTotal 
          ? parseFloat(customTotal.value.replace(/[^0-9.]/g, ''))
          : parseFloat(item.price) * item.quantity;

        // Extract variant ID number from GraphQL ID
        const variantIdMatch = item.variantId.match(/ProductVariant\/(\d+)/);
        const variantId = variantIdMatch ? variantIdMatch[1] : null;

        return {
          variant_id: variantId ? parseInt(variantId) : null,
          quantity: item.quantity,
          price: totalValue.toFixed(2),
          title: item.productTitle,
          properties: item.customAttributes?.map((attr: any) => ({
            name: attr.key,
            value: attr.value,
          })) || [],
        };
      });

      // Get customer address from session
      const shippingAddress = session.shipping_details?.address;
      const billingAddress = session.customer_details?.address;
      const address = shippingAddress || billingAddress;

      const orderData = {
        order: {
          email: customerEmail,
          line_items: lineItems,
          customer: {
            email: customerEmail,
            first_name: customerName.split(" ")[0] || customerName,
            last_name: customerName.split(" ").slice(1).join(" ") || "",
          },
          ...(address && {
            billing_address: {
              first_name: customerName.split(" ")[0] || customerName,
              last_name: customerName.split(" ").slice(1).join(" ") || "",
              address1: address.line1 || "",
              address2: address.line2 || "",
              city: address.city || "",
              province: address.state || "",
              country: address.country || "US",
              zip: address.postal_code || "",
            },
            shipping_address: {
              first_name: customerName.split(" ")[0] || customerName,
              last_name: customerName.split(" ").slice(1).join(" ") || "",
              address1: address.line1 || "",
              address2: address.line2 || "",
              city: address.city || "",
              province: address.state || "",
              country: address.country || "US",
              zip: address.postal_code || "",
            },
          }),
          financial_status: "paid",
          note: `Order created from Stripe checkout session: ${session.id}`,
          tags: "stripe,custom-vanity",
        },
      };

      console.log("Creating Shopify order with data:", JSON.stringify(orderData, null, 2));

      const shopifyResponse = await fetch(
        `https://${shopifyDomain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": shopifyAccessToken,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!shopifyResponse.ok) {
        const errorText = await shopifyResponse.text();
        console.error("Shopify API error:", shopifyResponse.status, errorText);
        throw new Error(`Shopify API error: ${shopifyResponse.status} - ${errorText}`);
      }

      const shopifyOrder = await shopifyResponse.json();
      console.log("Shopify order created successfully:", shopifyOrder.order.id);

      // Send order confirmation email
      try {
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (customerEmail) {
          // Build order summary HTML
          const itemsHtml = orderItems.map((item: any) => {
            const attributes = item.customAttributes
              ?.map((attr: any) => `${attr.key}: ${attr.value}`)
              .join("<br/>") || "";
            
            return `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <div style="font-weight: 600; margin-bottom: 4px;">Quantity: ${item.quantity}</div>
                  ${attributes ? `<div style="font-size: 14px; color: #666;">${attributes}</div>` : ""}
                </td>
              </tr>
            `;
          }).join("");

          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed!</h1>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
                    <p style="font-size: 16px; margin-bottom: 30px;">Thank you for your order! We've received your payment and will begin processing your custom vanity order shortly.</p>
                    
                    <!-- Order Details -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                      <h2 style="font-size: 20px; margin: 0 0 20px 0; color: #333;">Order Details</h2>
                      <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                      </table>
                      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;">
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
                          <span>Total Paid:</span>
                          <span style="color: #667eea;">$${(session.amount_total! / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Next Steps -->
                    <div style="background-color: #eff6ff; border-left: 4px solid #667eea; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                      <h3 style="font-size: 16px; margin: 0 0 8px 0; color: #1e40af;">What's Next?</h3>
                      <p style="margin: 0; font-size: 14px; color: #1e3a8a;">Our team will review your custom specifications and reach out within 1-2 business days to confirm details and provide a timeline for manufacturing and delivery.</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Questions about your order? Reply to this email or contact us.</p>
                    <p style="font-size: 14px; color: #666; margin: 0;">Thank you for choosing us!</p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Green Cabinets. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          await resend.emails.send({
            from: "Green Cabinets <onboarding@resend.dev>",
            to: [customerEmail],
            subject: "Order Confirmation - Your Custom Vanity Order",
            html: emailHtml,
          });

          console.log("Order confirmation email sent to:", customerEmail);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }

      return new Response(
        JSON.stringify({ 
          received: true, 
          shopify_order_id: shopifyOrder.order.id 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For other event types, just acknowledge receipt
    console.log("Received event type:", event.type);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
