import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  phone?: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email, message }: ContactRequest = await req.json();

    console.log("Received contact form submission:", { name, phone, email, message: message.substring(0, 50) + "..." });

    // Validate required fields
    if (!name || !email || !message) {
      console.error("Missing required fields");
      throw new Error("שדות חובה חסרים");
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8FBF4; }
          .header { background: linear-gradient(135deg, #314020 0%, #4a5d30 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .field { margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-right: 3px solid #314020; }
          .field-label { font-weight: bold; color: #314020; margin-bottom: 5px; }
          .message-box { background: #fff; border: 1px solid #e0e0e0; padding: 15px; border-radius: 6px; margin-top: 10px; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📧 הודעה חדשה מטופס יצירת קשר</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">👤 שם:</div>
              <div>${name}</div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="field-label">📱 טלפון:</div>
              <div><a href="tel:${phone}" style="color: #314020;">${phone}</a></div>
            </div>
            ` : ''}
            <div class="field">
              <div class="field-label">✉️ מייל:</div>
              <div><a href="mailto:${email}" style="color: #314020;">${email}</a></div>
            </div>
            <div class="field">
              <div class="field-label">💬 הודעה:</div>
              <div class="message-box">${message}</div>
            </div>
          </div>
          <div class="footer">
            <p>נשלח מאתר בוקט</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log("Sending email to business owner...");

    const emailResponse = await resend.emails.send({
      from: "בוקט - טופס יצירת קשר <onboarding@resend.dev>",
      to: ["r0527614436@gmail.com"],
      subject: `הודעה חדשה מטופס יצירת קשר - ${name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "שגיאה בשליחת ההודעה" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
