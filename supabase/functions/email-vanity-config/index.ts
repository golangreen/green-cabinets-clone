import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailConfigRequest {
  recipientEmail: string;
  recipientName?: string;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, config }: EmailConfigRequest = await req.json();

    console.log("Sending vanity configuration email to:", recipientEmail);

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
              ${recipientName ? `<p>Hi ${recipientName},</p>` : '<p>Hello,</p>'}
              <p>Thank you for using our Custom Vanity Configurator! Here are the details of your design:</p>
              
              <div class="section">
                <div class="section-title">Vanity Specifications</div>
                <div class="detail-row">
                  <span class="label">Dimensions:</span>
                  <span class="value">${config.dimensions}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Brand:</span>
                  <span class="value">${config.brand}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Finish:</span>
                  <span class="value">${config.finish}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Cabinet Style:</span>
                  <span class="value">${config.doorStyle}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Countertop & Sink</div>
                <div class="detail-row">
                  <span class="label">Countertop:</span>
                  <span class="value">${config.countertop}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Sink:</span>
                  <span class="value">${config.sink}</span>
                </div>
              </div>

              <div class="pricing">
                <div class="section-title">Price Estimate</div>
                <div class="detail-row">
                  <span class="label">Vanity Price:</span>
                  <span class="value">${config.pricing.vanity}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Tax:</span>
                  <span class="value">${config.pricing.tax}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Shipping:</span>
                  <span class="value">${config.pricing.shipping}</span>
                </div>
                <div class="total">
                  <div class="detail-row" style="border: none;">
                    <span>Total Estimate:</span>
                    <span>${config.pricing.total}</span>
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

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Configuration emailed successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in email-vanity-config function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
