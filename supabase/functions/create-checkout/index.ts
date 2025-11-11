import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { createServiceRoleClient, getClientIP } from "../_shared/supabase.ts";
import { isIPBlocked, checkRateLimit, logSecurityEvent } from "../_shared/security.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, RateLimitError, withErrorHandling } from "../_shared/errors.ts";

const customerDataSchema = z.object({
  customerEmail: z.string().trim().email().max(255),
  customerName: z.string().trim().min(1).max(100),
});

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  // Initialize logger
  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'create-checkout', requestId });
  logger.info('Checkout request received');

  const supabase = createServiceRoleClient();
  const clientIP = getClientIP(req);
  
  // Check if IP is blocked
  const blocked = await isIPBlocked(supabase, clientIP);
  if (blocked) {
    await logSecurityEvent(supabase, {
      eventType: 'ip_blocked',
      clientIP,
      functionName: 'create-checkout',
      severity: 'high',
    });
    logger.warn('Blocked IP attempted access', { ip: clientIP });
    return createCorsErrorResponse('Access denied', 403);
  }
  
  // Check rate limit
  const rateLimitExceeded = checkRateLimit(clientIP, 10, 60 * 60 * 1000);
  if (rateLimitExceeded) {
    await logSecurityEvent(supabase, {
      eventType: 'rate_limit_exceeded',
      clientIP,
      functionName: 'create-checkout',
      severity: 'medium',
      details: { attempt: 'checkout creation' }
    });
    logger.warn('Rate limit exceeded', { ip: clientIP });
    throw new RateLimitError('Too many checkout attempts. Please try again later.');
  }

  const { items, customerEmail, customerName } = await req.json();
  logger.info('Processing checkout request', { itemCount: items?.length || 0 });
  
  // Validate customer data
  const validationResult = customerDataSchema.safeParse({ customerEmail, customerName });
  if (!validationResult.success) {
    await logSecurityEvent(supabase, {
      eventType: 'validation_failed',
      clientIP,
      functionName: 'create-checkout',
      severity: 'low',
      details: { errors: validationResult.error.errors }
    });
    logger.error('Validation error', { error: validationResult.error });
    throw new ValidationError('Invalid request');
  }

  const sanitizedEmail = sanitizeString(customerEmail);
  const sanitizedName = sanitizeString(customerName);
  
  logger.info('Creating checkout session');

  if (!items || items.length === 0) {
    throw new ValidationError("No items provided");
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

  logger.info('Creating Stripe checkout session', { lineItemsCount: lineItems.length });

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

  logger.info('Checkout session created', { sessionId: session.id });

  return createCorsResponse({ url: session.url, sessionId: session.id }, 200);
};

serve(withErrorHandling(handler, (msg, error) => {
  const logger = createLogger({ functionName: 'create-checkout' });
  logger.error(msg, error);
}));
