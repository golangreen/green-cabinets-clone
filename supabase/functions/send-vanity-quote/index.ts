import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const quoteRequestSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(20).optional(),
  brand: z.string().trim().min(1).max(50),
  finish: z.string().trim().min(1).max(100),
  width: z.number().positive(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  zipCode: z.string().regex(/^\d{5}$/),
  state: z.string().max(20),
  basePrice: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  totalPrice: z.number().positive(),
  additionalNotes: z.string().max(1000).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate input
    const validatedData = quoteRequestSchema.parse(requestData);
    
    const linearFeet = (validatedData.width / 12).toFixed(2);
    
    // Send email to business using Resend API
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Green Cabinets Quotes <orders@greencabinetsny.com>",
        to: ["orders@greencabinetsny.com"],
        subject: `New Custom Vanity Quote Request - ${validatedData.customerName}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2dd4bf; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
            New Custom Vanity Quote Request
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${validatedData.customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${validatedData.customerEmail}">${validatedData.customerEmail}</a></p>
            ${validatedData.customerPhone ? `<p><strong>Phone:</strong> ${validatedData.customerPhone}</p>` : ''}
            <p><strong>ZIP Code:</strong> ${validatedData.zipCode} (${validatedData.state})</p>
          </div>

          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 2px solid #2dd4bf; border-radius: 8px;">
            <h3 style="color: #2dd4bf; margin-top: 0;">Vanity Configuration</h3>
            <p><strong>Brand:</strong> ${validatedData.brand}</p>
            <p><strong>Finish/Color:</strong> ${validatedData.finish}</p>
            <p><strong>Width:</strong> ${validatedData.width.toFixed(2)}" (${linearFeet} linear feet)</p>
            ${validatedData.height ? `<p><strong>Height:</strong> ${validatedData.height.toFixed(2)}"</p>` : ''}
            ${validatedData.depth ? `<p><strong>Depth:</strong> ${validatedData.depth.toFixed(2)}"</p>` : ''}
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Pricing Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Base Price (${linearFeet} linear feet × $350):</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;"><strong>$${validatedData.basePrice.toFixed(2)}</strong></td>
              </tr>
              ${validatedData.tax > 0 ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Tax (${validatedData.state}):</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">$${validatedData.tax.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${validatedData.shipping > 0 ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Shipping to ${validatedData.state}:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">$${validatedData.shipping.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; font-size: 18px; color: #2dd4bf;"><strong>Total Estimate:</strong></td>
                <td style="padding: 12px 0; font-size: 18px; text-align: right; color: #2dd4bf;"><strong>$${validatedData.totalPrice.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          ${validatedData.additionalNotes ? `
          <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #D4AF37;">
            <h3 style="color: #856404; margin-top: 0;">Additional Notes</h3>
            <p style="color: #856404; white-space: pre-wrap;">${validatedData.additionalNotes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 14px;">
            <p>This quote request was submitted through the Green Cabinets website.</p>
            <p><strong>Action Required:</strong> Please contact the customer within 24 hours to confirm the quote and discuss next steps.</p>
          </div>
        </div>
      `,
      }),
    });

    if (!businessEmailResponse.ok) {
      throw new Error("Failed to send business email");
    }

    const businessEmailData = await businessEmailResponse.json();

    // Send confirmation email to customer
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Green Cabinets <orders@greencabinetsny.com>",
        to: [validatedData.customerEmail],
        subject: "Your Custom Vanity Quote Request - Green Cabinets",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2dd4bf; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
            Thank You for Your Quote Request!
          </h2>
          
          <p>Hi ${validatedData.customerName},</p>
          
          <p>Thank you for requesting a quote for your custom vanity. We've received your request and will get back to you within 24 hours with a detailed quote.</p>

          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Your Configuration Summary</h3>
            <p><strong>Brand:</strong> ${validatedData.brand}</p>
            <p><strong>Finish:</strong> ${validatedData.finish}</p>
            <p><strong>Width:</strong> ${validatedData.width.toFixed(2)}" (${linearFeet} linear feet)</p>
            <p><strong>Estimated Total:</strong> <span style="color: #2dd4bf; font-size: 18px; font-weight: bold;">$${validatedData.totalPrice.toFixed(2)}</span></p>
          </div>

          <div style="background-color: #e8f5f4; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2dd4bf;">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">Our team will review your request and contact you with:</p>
            <ul style="margin: 10px 0;">
              <li>Detailed pricing confirmation</li>
              <li>Material availability</li>
              <li>Production timeline</li>
              <li>Installation options</li>
            </ul>
          </div>

          <p>If you have any questions in the meantime, feel free to reply to this email or call us.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Green Cabinets</strong></p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">Email: orders@greencabinetsny.com</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;">Phone: (718) 804-5488</p>
          </div>
        </div>
      `,
      }),
    });

    if (!customerEmailResponse.ok) {
      throw new Error("Failed to send customer email");
    }

    const customerEmailData = await customerEmailResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        businessEmailId: businessEmailData.id,
        customerEmailId: customerEmailData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending quote email:", error);
    
    if (error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ 
          error: "Invalid quote data",
          details: error.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send quote request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
