import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const customerDataSchema = z.object({
  customerEmail: z.string().trim().email().max(255),
  customerName: z.string().trim().min(1).max(100),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check if IP is blocked
    const { data: blockCheck } = await supabase.rpc("is_ip_blocked", { check_ip: clientIp });
    if (blockCheck === true) {
      const { data: blockInfo } = await supabase.rpc("get_blocked_ip_info", { check_ip: clientIp });
      const blockedUntil = blockInfo && blockInfo.length > 0 ? blockInfo[0].blocked_until : null;
      const reason = blockInfo && blockInfo.length > 0 ? blockInfo[0].reason : "Security violation";
      
      console.warn(`Blocked IP attempted access: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: "Access denied. Your IP has been temporarily blocked.",
          reason: reason,
          blocked_until: blockedUntil,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      
      // Log security event (fire and forget)
      supabase.from("security_events").insert({
        event_type: "rate_limit_exceeded",
        function_name: "create-checkout",
        client_ip: clientIp,
        details: { attempt: "checkout creation" },
        severity: "medium",
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Too many checkout attempts. Please try again later.",
          retryAfter: 3600
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { items, customerEmail, customerName } = await req.json();
    console.log(`Processing checkout for IP: ${clientIp}, Email: ${customerEmail}`);
    
    // Validate customer data
    const validationResult = customerDataSchema.safeParse({ customerEmail, customerName });
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error, `IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Invalid request" }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const sanitizedEmail = sanitizeString(customerEmail);
    const sanitizedName = sanitizeString(customerName);
    
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

    // Extract only essential data for metadata (Stripe has 500 char limit per value)
    // Keep only critical custom attributes needed for order fulfillment
    const orderItems = items.map((item: any) => {
      const essentialAttributes = item.customAttributes?.filter((attr: any) => 
        ['Brand', 'Finish', 'Width', 'Height', 'Depth'].includes(attr.key)
      ) || [];
      
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        customAttributes: essentialAttributes
      };
    });

    // Create checkout session with metadata containing essential order data
    const session = await stripe.checkout.sessions.create({
      customer_email: sanitizedEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        customer_name: sanitizedName,
        order_items: JSON.stringify(orderItems),
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
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session. Please try again." }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
