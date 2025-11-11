import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { createServiceRoleClient, getClientIP } from "../_shared/supabase.ts";
import { isIPBlocked, checkRateLimit, logSecurityEvent, verifyRecaptcha } from "../_shared/security.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, RateLimitError, withErrorHandling } from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

const resend = new Resend(RESEND_API_KEY);

const emailConfigSchema = z.object({
  recipientEmail: z.string().trim().email().max(255),
  recipientName: z.string().trim().max(100).optional(),
  recaptchaToken: z.string().optional(),
  config: z.object({
    brand: z.string().trim().min(1).max(50),
    finish: z.string().trim().min(1).max(50),
    dimensions: z.string().trim().min(1).max(50),
    doorStyle: z.string().trim().min(1).max(50),
    countertop: z.string().trim().min(1).max(50),
    sink: z.string().trim().min(1).max(50),
    pricing: z.object({
      vanity: z.string().trim().regex(/^[\d,$.]+$/).max(20),
      tax: z.string().trim().regex(/^[\d,$.]+$/).max(20),
      shipping: z.string().trim().regex(/^[\d,$.]+$/).max(20),
      total: z.string().trim().regex(/^[\d,$.]+$/).max(20),
    })
  })
});

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

interface EmailConfigRequest {
  recipientEmail: string;
  recipientName?: string;
  recaptchaToken?: string;
  config: {
    brand: string;
    finish: string;
    dimensions: string;
    doorStyle: string;
    countertop: string;
    sink: string;
    pricing: {
      vanity: string;
      tax: string;
      shipping: string;
      total: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  // Initialize logger
  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'email-vanity-config', requestId });
  logger.info('Email config request received');

  const supabase = createServiceRoleClient();
  const clientIP = getClientIP(req);
  
  // Check if IP is blocked
  const blocked = await isIPBlocked(supabase, clientIP);
  if (blocked) {
    await logSecurityEvent(supabase, {
      eventType: 'ip_blocked',
      clientIP,
      functionName: 'email-vanity-config',
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
      functionName: 'email-vanity-config',
      severity: 'high',
      details: { attempt: 'email configuration' }
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
        functionName: 'email-vanity-config',
        severity: 'medium',
        details: { reason: 'reCAPTCHA verification failed' }
      });
      logger.warn('reCAPTCHA verification failed', { ip: clientIP });
      return createCorsErrorResponse("Request verification failed", 403);
    }
    logger.info('reCAPTCHA verified', { ip: clientIP });
  }
  
  // Validate input data
  const validationResult = emailConfigSchema.safeParse(rawData);
  if (!validationResult.success) {
    await logSecurityEvent(supabase, {
      eventType: 'validation_failed',
      clientIP,
      functionName: 'email-vanity-config',
      severity: 'medium',
      details: { errors: validationResult.error.errors }
    });
    logger.error('Validation error', { error: validationResult.error });
    throw new ValidationError('Invalid request. Please check your input.');
  }

  const { recipientEmail, recipientName, config }: EmailConfigRequest = validationResult.data;
  
  logger.info('Sending vanity configuration email', { recipient: recipientEmail });

  // Escape all user-controlled strings to prevent XSS
  const safeName = recipientName ? escapeHtml(recipientName) : null;
  const safeConfig = {
    dimensions: escapeHtml(config.dimensions),
    brand: escapeHtml(config.brand),
    finish: escapeHtml(config.finish),
    doorStyle: escapeHtml(config.doorStyle),
    countertop: escapeHtml(config.countertop),
    sink: escapeHtml(config.sink),
    pricing: {
      vanity: escapeHtml(config.pricing.vanity),
      tax: escapeHtml(config.pricing.tax),
      shipping: escapeHtml(config.pricing.shipping),
      total: escapeHtml(config.pricing.total),
    }
  };

  const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: 600; color: #6b7280; }
            .value { color: #111827; }
            .pricing { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .total { font-size: 20px; font-weight: bold; color: #667eea; margin-top: 15px; padding-top: 15px; border-top: 2px solid #667eea; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Custom Vanity Configuration</h1>
              <p>Your personalized bathroom vanity design</p>
            </div>
            
            <div class="content">
              ${safeName ? `<p>Hi ${safeName},</p>` : '<p>Hello,</p>'}
              <p>Thank you for using our Custom Vanity Configurator! Here are the details of your design:</p>
              
              <div class="section">
                <div class="section-title">Vanity Specifications</div>
                <div class="detail-row">
                  <span class="label">Dimensions:</span>
                  <span class="value">${safeConfig.dimensions}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Brand:</span>
                  <span class="value">${safeConfig.brand}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Finish:</span>
                  <span class="value">${safeConfig.finish}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cabinet Style:</span>
                  <span class="value">${safeConfig.doorStyle}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Countertop & Sink</div>
                <div class="detail-row">
                  <span class="label">Countertop:</span>
                  <span class="value">${safeConfig.countertop}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Sink:</span>
                  <span class="value">${safeConfig.sink}</span>
                </div>
              </div>

              <div class="pricing">
                <div class="section-title">Price Estimate</div>
                <div class="detail-row">
                  <span class="label">Vanity Price:</span>
                  <span class="value">${safeConfig.pricing.vanity}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Tax:</span>
                  <span class="value">${safeConfig.pricing.tax}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Shipping:</span>
                  <span class="value">${safeConfig.pricing.shipping}</span>
                </div>
                <div class="total">
                  <div class="detail-row" style="border: none;">
                    <span>Total Estimate:</span>
                    <span>${safeConfig.pricing.total}</span>
                  </div>
                </div>
              </div>

              <p style="margin-top: 30px;">
                <strong>Next Steps:</strong> Our team will review your configuration and reach out within 24-48 hours 
                with a detailed quote and timeline. If you have any questions, please don't hesitate to contact us.
              </p>

              <center>
                <a href="https://greencabinetsny.com" class="button">Visit Our Website</a>
              </center>
            </div>

            <div class="footer">
              <p><strong>Green Cabinets</strong></p>
              <p>Custom Cabinet Solutions | Premium Quality</p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
                Note: This is an estimate. Final pricing will be confirmed by our team.
              </p>
            </div>
          </div>
      </body>
    </html>
  `;

  const emailResponse = await resend.emails.send({
    from: "Green Cabinets <onboarding@resend.dev>",
    to: [recipientEmail],
    subject: "Your Custom Vanity Configuration",
    html: emailHtml,
  });

  logger.info('Email sent successfully', { emailId: emailResponse.data?.id });

  return createCorsResponse({
    success: true,
    message: "Configuration emailed successfully",
    emailId: emailResponse.data?.id
  }, 200);
};

serve(withErrorHandling(handler, (msg, error) => {
  const logger = createLogger({ functionName: 'email-vanity-config' });
  logger.error(msg, error);
}));
