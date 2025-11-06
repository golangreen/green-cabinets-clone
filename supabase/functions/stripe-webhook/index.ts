import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

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
