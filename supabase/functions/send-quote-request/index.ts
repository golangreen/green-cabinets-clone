import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
});

// Simple in-memory rate limiting (for basic protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5;

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check if IP is blocked
    const { data: isBlocked } = await supabase.rpc('is_ip_blocked', { check_ip: clientIp });
    
    if (isBlocked) {
      const { data: blockInfo } = await supabase.rpc('get_blocked_ip_info', { check_ip: clientIp });
      
      console.warn(`Blocked IP attempted access: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: 'Access denied. Your IP address has been temporarily blocked due to security concerns.',
          blockedUntil: blockInfo?.blocked_until
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'rate_limit_exceeded',
        function_name: 'send-quote-request',
        client_ip: clientIp,
        severity: 'medium',
        details: { max_requests: MAX_REQUESTS_PER_WINDOW, window_minutes: 60 }
      });
      
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: 3600
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const rawData = await req.json();
    
    // Validate input data
    const validationResult = quoteRequestSchema.safeParse(rawData);
    if (!validationResult.success) {
      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'validation_failed',
        function_name: 'send-quote-request',
        client_ip: clientIp,
        severity: 'low',
        details: { errors: validationResult.error.errors }
      });
      
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data. Please check your form and try again." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const quoteData: QuoteRequest = validationResult.data;
    console.log(`Processing quote request from IP: ${clientIp}, Email: ${quoteData.customerEmail}`);

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

    console.log("Quote request emails sent successfully");

    return new Response(
      JSON.stringify({ success: true, ownerEmail, customerEmail }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quote-request function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process quote request. Please try again or contact us directly." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
