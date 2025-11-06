import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const quoteData: QuoteRequest = await req.json();

    // Send email to business owner
    const ownerEmail = await resend.emails.send({
      from: "Green Cabinets Quote <onboarding@resend.dev>",
      to: ["info@greencabinets.com"], // Replace with your actual business email
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
    });

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
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
    });

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
