import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Starting maintenance order function...");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all categories from the database
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw categoriesError;
    }

    console.log(`Found ${categories?.length || 0} categories`);

    // Create maintenance items for each category with the word "תפעול"
    const maintenanceItems = categories?.map(category => ({
      id: `maintenance-${category.id}`,
      title: `תפעול - ${category.name}`,
      image_url: "/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png", // Company logo
      price: "תפעול",
      category_id: category.id,
      quantity: 1
    })) || [];

    const orderData = {
      type: 'maintenance-order',
      customer_name: 'תפעול אוטומטי',
      event_phone: '0527614436',
      event_date: new Date().toISOString(),
      day_of_week: 'maintenance',
      delivery_city: 'תפעול',
      delivery_street: 'תפעול',
      delivery_building: 'תפעול',
      payment_method: 'maintenance',
      notes: 'הזמנת תפעול אוטומטית - פעם בחמישה ימים',
      items: JSON.stringify(maintenanceItems),
      created_at: new Date().toISOString()
    };

    console.log("Sending maintenance order...");

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Bouquet <onboarding@resend.dev>",
      to: ["rocimotion1@gmail.com"],
      subject: "הזמנת תפעול אוטומטית - כל הקטגוריות",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h1 style="color: #d946ef; text-align: center;">הזמנת תפעול אוטומטית</h1>
          <div style="background: #fdf2f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2>פרטי ההזמנה:</h2>
            <p><strong>סוג הזמנה:</strong> תפעול אוטומטי</p>
            <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
            <p><strong>שעה:</strong> ${new Date().toLocaleTimeString('he-IL')}</p>
            <p><strong>הערות:</strong> הזמנה זו נשלחת אוטומטית פעם בחמישה ימים</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2>פריטים בהזמנה:</h2>
            ${maintenanceItems.map(item => `
              <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
                <h3 style="color: #374151; margin: 5px 0;">${item.title}</h3>
                <p style="color: #6b7280; margin: 5px 0;">כמות: ${item.quantity}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280;">הזמנה זו נוצרה אוטומטית על ידי המערכת</p>
          </div>
        </div>
      `,
    });

    console.log("Maintenance order email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Maintenance order sent successfully",
        itemCount: maintenanceItems.length,
        emailResponse 
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
    console.error("Error in send-maintenance-order function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send maintenance order"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);