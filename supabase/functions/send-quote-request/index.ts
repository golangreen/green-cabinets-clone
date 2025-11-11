import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { createServiceRoleClient, getClientIP } from "../_shared/supabase.ts";
import { isIPBlocked, checkRateLimit, logSecurityEvent, verifyRecaptcha } from "../_shared/security.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, RateLimitError, withErrorHandling } from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

const quoteRequestSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().regex(/^[\d\s\-\(\)\.+]+$/).min(10).max(20),
  brand: z.string().trim().min(1).max(100),
  finish: z.string().trim().min(1).max(100),
  width: z.string().trim().min(1).max(20),
  height: z.string().trim().min(1).max(20),
  depth: z.string().trim().min(1).max(20),
  zipCode: z.string().trim().regex(/^\d{5}$/),
  basePrice: z.string().trim().max(20),
  tax: z.string().trim().max(20),
  shipping: z.string().trim().max(20),
  totalPrice: z.string().trim().max(20),
  recaptchaToken: z.string().optional(),
});

interface QuoteRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  brand: string;
  finish: string;
  width: string;
  height: string;
  depth: string;
  zipCode: string;
  basePrice: string;
  tax: string;
  shipping: string;
  totalPrice: string;
  recaptchaToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  // Initialize logger
  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'send-quote-request', requestId });
  logger.info('Quote request received');

  const supabase = createServiceRoleClient();
  const clientIP = getClientIP(req);
  
  // Check if IP is blocked
  const blocked = await isIPBlocked(supabase, clientIP);
  if (blocked) {
    await logSecurityEvent(supabase, {
      eventType: 'ip_blocked',
      clientIP,
      functionName: 'send-quote-request',
      severity: 'high',
    });
    logger.warn('Blocked IP attempted access', { ip: clientIP });
    return createCorsErrorResponse('Access denied', 403);
  }
  
  // Check rate limit
  const rateLimitExceeded = checkRateLimit(clientIP, 5, 60 * 60 * 1000);
  if (rateLimitExceeded) {
    await logSecurityEvent(supabase, {
      eventType: 'rate_limit_exceeded',
      clientIP,
      functionName: 'send-quote-request',
      severity: 'medium',
      details: { max_requests: 5, window_minutes: 60 }
    });
    logger.warn('Rate limit exceeded', { ip: clientIP });
    throw new RateLimitError('Too many requests. Please try again later.');
  }

  const rawData = await req.json();
  
  // Verify reCAPTCHA token if provided and configured
  if (RECAPTCHA_SECRET_KEY && rawData.recaptchaToken) {
    const isValid = await verifyRecaptcha(rawData.recaptchaToken, RECAPTCHA_SECRET_KEY);
    if (!isValid) {
      await logSecurityEvent(supabase, {
        eventType: 'suspicious_activity',
        clientIP,
        functionName: 'send-quote-request',
        severity: 'medium',
        details: { reason: 'reCAPTCHA verification failed' }
      });
      logger.warn('reCAPTCHA verification failed', { ip: clientIP });
      return createCorsErrorResponse("Request verification failed", 403);
    }
    logger.info('reCAPTCHA verified', { ip: clientIP });
  }
  
  // Validate input data
  const validationResult = quoteRequestSchema.safeParse(rawData);
  if (!validationResult.success) {
    await logSecurityEvent(supabase, {
      eventType: 'validation_failed',
      clientIP,
      functionName: 'send-quote-request',
      severity: 'low',
      details: { errors: validationResult.error.errors }
    });
    logger.error('Validation error', { error: validationResult.error });
    throw new ValidationError('Invalid request. Please check your input.');
  }

  const quoteData: QuoteRequest = validationResult.data;
  logger.info('Processing quote request', { customer: quoteData.customerEmail });

  // Send email to business owner using Resend API
  const ownerEmailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
    from: "Green Cabinets Quote <onboarding@resend.dev>",
    to: ["info@greencabinets.com"],
    subject: `New Custom Vanity Quote Request from ${quoteData.customerName}`,
    html: `
        <h2>New Custom Bathroom Vanity Quote Request</h2>
        
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${quoteData.customerName}</p>
        <p><strong>Email:</strong> ${quoteData.customerEmail}</p>
        <p><strong>Phone:</strong> ${quoteData.customerPhone}</p>
        <p><strong>Location:</strong> ${quoteData.zipCode}</p>
        
        <h3>Configuration Details</h3>
        <p><strong>Brand:</strong> ${quoteData.brand}</p>
        <p><strong>Finish:</strong> ${quoteData.finish}</p>
        <p><strong>Dimensions:</strong> ${quoteData.width}" W x ${quoteData.height}" H x ${quoteData.depth}" D</p>
        
        <h3>Pricing Breakdown</h3>
        <p><strong>Base Price:</strong> $${quoteData.basePrice}</p>
        <p><strong>Tax:</strong> $${quoteData.tax}</p>
        <p><strong>Shipping:</strong> $${quoteData.shipping}</p>
        <p><strong>Total Price:</strong> $${quoteData.totalPrice}</p>
        
      <p style="margin-top: 30px; color: #666;">
        Reply to this email to contact the customer directly.
      </p>
    `,
    }),
  });

  if (!ownerEmailResponse.ok) {
    throw new Error(`Failed to send owner email: ${await ownerEmailResponse.text()}`);
  }

  const ownerEmail = await ownerEmailResponse.json();

  // Send confirmation email to customer
  const customerEmailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
    from: "Green Cabinets <onboarding@resend.dev>",
    to: [quoteData.customerEmail],
    subject: "We Received Your Custom Vanity Quote Request",
    html: `
        <h2>Thank you for your quote request, ${quoteData.customerName}!</h2>
        
        <p>We've received your custom bathroom vanity configuration and will get back to you within 24 hours with a detailed quote.</p>
        
        <h3>Your Configuration Summary</h3>
        <p><strong>Brand:</strong> ${quoteData.brand}</p>
        <p><strong>Finish:</strong> ${quoteData.finish}</p>
        <p><strong>Dimensions:</strong> ${quoteData.width}" W x ${quoteData.height}" H x ${quoteData.depth}" D</p>
        
        <h3>Estimated Pricing</h3>
        <p><strong>Base Price:</strong> $${quoteData.basePrice}</p>
        <p><strong>Tax:</strong> $${quoteData.tax}</p>
        <p><strong>Shipping:</strong> $${quoteData.shipping}</p>
        <p><strong>Total Estimate:</strong> $${quoteData.totalPrice}</p>
        
        <p style="margin-top: 30px;">
          If you have any questions, feel free to reply to this email or call us directly.
        </p>
        
      <p style="color: #666;">
        Best regards,<br>
        Green Cabinets Team
      </p>
    `,
    }),
  });

  if (!customerEmailResponse.ok) {
    throw new Error(`Failed to send customer email: ${await customerEmailResponse.text()}`);
  }

  const customerEmail = await customerEmailResponse.json();

  logger.info('Quote request emails sent successfully');

  return createCorsResponse({ success: true, ownerEmail, customerEmail }, 200);
};

serve(withErrorHandling(handler, (msg, error) => {
  const logger = createLogger({ functionName: 'send-quote-request' });
  logger.error(msg, error);
}));
