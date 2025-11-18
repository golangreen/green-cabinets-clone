import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, RateLimitError, withErrorHandling } from "../_shared/errors.ts";
import { createServiceRoleClient, getClientIP } from "../_shared/supabase.ts";
import { isIPBlocked, checkRateLimit, logSecurityEvent } from "../_shared/security.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const vanityConfigSchema = z.object({
  brand: z.string().min(1).max(100),
  finish: z.string().min(1).max(100),
  width: z.number().positive().max(1000),
  height: z.number().positive().max(1000),
  depth: z.number().positive().max(1000),
  doorStyle: z.string().min(1).max(100),
  totalPrice: z.number().positive().max(1000000),
});

const requestSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().max(200).optional(),
  ccSalesTeam: z.boolean().optional(),
  pdfBase64: z.string().min(1),
  vanityConfig: vanityConfigSchema,
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = generateRequestId();
  const logger = createLogger({ 
    functionName: 'send-vanity-quote-email',
    requestId 
  });

  try {
    const supabase = createServiceRoleClient();
    const clientIP = getClientIP(req);

    // Security checks
    if (await isIPBlocked(supabase, clientIP)) {
      logger.warn('Blocked IP attempted access', { clientIP });
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: 10 requests per minute per IP
    if (checkRateLimit(clientIP, 10, 60000)) {
      logger.warn('Rate limit exceeded', { clientIP });
      await logSecurityEvent(supabase, {
        eventType: 'rate_limit_exceeded',
        clientIP,
        functionName: 'send-vanity-quote-email',
        severity: 'medium',
        details: { reason: 'Exceeded vanity quote email rate limit' }
      });
      throw new RateLimitError('Too many requests. Please try again later.');
    }

    const body = await req.json();
    
    // Validate request body
    const validatedData = requestSchema.parse(body);
    const {
      recipientEmail,
      recipientName = "Valued Customer",
      ccSalesTeam = false,
      pdfBase64,
      vanityConfig,
    } = validatedData;

    logger.info('Sending vanity quote email', { 
      recipientEmail,
      ccSalesTeam,
      configBrand: vanityConfig.brand
    });

    // Convert base64 to buffer
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

    // Prepare email recipients
    const recipients = [recipientEmail];
    if (ccSalesTeam) {
      recipients.push("greencabinetsny@gmail.com");
    }

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: "Green Cabinets <noreply@yourdomain.com>",
      to: recipients,
      subject: `Your Custom Vanity Quote - ${vanityConfig.brand} ${vanityConfig.finish}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #225930 0%, #2d7a3e 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .summary {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .summary h2 {
                color: #225930;
                margin-top: 0;
              }
              .spec-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
              }
              .spec-row:last-child {
                border-bottom: none;
              }
              .spec-label {
                font-weight: bold;
                color: #666;
              }
              .price {
                font-size: 24px;
                color: #225930;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
              }
              .cta {
                text-align: center;
                margin: 30px 0;
              }
              .button {
                display: inline-block;
                background: #225930;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Your Custom Vanity Quote</h1>
              <p>Thank you for choosing Green Cabinets</p>
            </div>
            
            <div class="content">
              <p>Dear ${recipientName},</p>
              
              <p>Thank you for your interest in our custom bathroom vanities. Please find your personalized quote attached as a PDF document.</p>
              
              <div class="summary">
                <h2>Configuration Summary</h2>
                <div class="spec-row">
                  <span class="spec-label">Brand:</span>
                  <span>${vanityConfig.brand}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Finish:</span>
                  <span>${vanityConfig.finish}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Dimensions:</span>
                  <span>${vanityConfig.width}" W × ${vanityConfig.height}" H × ${vanityConfig.depth}" D</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">Style:</span>
                  <span>${vanityConfig.doorStyle}</span>
                </div>
              </div>
              
              <div class="price">
                Estimated Total: $${vanityConfig.totalPrice.toFixed(2)}
              </div>
              
              <div class="cta">
                <a href="tel:+19142417336" class="button">Call Us: (914) 241-7336</a>
              </div>
              
              <p>Our team is ready to help you bring your vision to life. Feel free to call us with any questions or to schedule a consultation.</p>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Review the attached PDF quote for detailed pricing</li>
                <li>Contact us to discuss customization options</li>
                <li>Schedule a consultation to finalize your design</li>
                <li>We'll provide a final quote and timeline</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>Green Cabinets</strong></p>
              <p>Phone: (914) 241-7336 | Email: greencabinetsny@gmail.com</p>
              <p>This quote is valid for 30 days from the date of generation.</p>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `vanity-quote-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    logger.info("Email sent successfully", { 
      messageId: emailResponse.data?.id,
      recipientEmail 
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    logger.error("Error sending vanity quote email", { 
      error: error.message,
      stack: error.stack 
    });
    throw error;
  }
};

serve(withErrorHandling(handler));
