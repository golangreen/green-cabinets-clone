import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerEmail, customerName } = await req.json();
    
    console.log("Creating checkout for items:", items);

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build line items with custom pricing from cart
    const lineItems = items.map((item: any) => {
      // Extract total from custom attributes if available
      const customTotal = item.customAttributes?.find((attr: any) => 
        attr.key === "Total Estimate"
      );
      
      let unitAmount = 25000; // Default base price in cents
      
      if (customTotal) {
        // Parse the total from format like "$XXX.XX"
        const totalValue = parseFloat(customTotal.value.replace(/[^0-9.]/g, ''));
        unitAmount = Math.round(totalValue * 100); // Convert to cents
      }

      // Build product description from custom attributes
      const description = item.customAttributes
        ?.filter((attr: any) => attr.key !== "Total Estimate")
        .map((attr: any) => `${attr.key}: ${attr.value}`)
        .join(", ") || item.product.node.description;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.node.title,
            description: description,
            images: item.product.node.images?.edges?.[0]?.node?.url 
              ? [item.product.node.images.edges[0].node.url]
              : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    console.log("Creating Stripe checkout session with line items:", lineItems);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        customer_name: customerName,
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
