import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send maintenance order function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = "https://iwxzivzomvjocjbcsafb.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eHppdnpvbXZqb2NqYmNzYWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODU1MTcsImV4cCI6MjA2Njg2MTUxN30.NvYjt2H4lKAK6OjPBGJO-VGjwAslEW1-6nyEC0jeOY8";
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      throw categoriesError;
    }

    console.log("Categories found:", categories?.length || 0);

    if (!categories || categories.length === 0) {
      console.log("No categories found");
      return new Response(
        JSON.stringify({ message: "No categories found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create maintenance order items - one "תפעול" item for each category
    const maintenanceItems = categories.map(category => ({
      id: `maintenance-${category.id}`,
      title: "תפעול",
      category_id: category.id,
      category_name: category.name,
      image_url: "",
      price: "",
      quantity: 1
    }));

    // Prepare order data
    const orderData = {
      type: 'maintenance-order',
      customer_name: "הזמנת תפעול אוטומטית",
      event_phone: "0527614436",
      notes: "הזמנה אוטומטית לתפעול - נוצרה על ידי המערכת פעם בחמישה ימים",
      items: JSON.stringify(maintenanceItems),
      created_at: new Date().toISOString(),
      scheduled: true
    };

    console.log("Sending maintenance order email with", maintenanceItems.length, "categories");

    // Prepare email content
    const itemsHtml = maintenanceItems.map(item => 
      `<li><strong>${item.category_name}</strong>: תפעול</li>`
    ).join('');

    const emailHtml = `
      <h2>הזמנת תפעול אוטומטית</h2>
      <p><strong>סוג הזמנה:</strong> תפעול אוטומטי</p>
      <p><strong>תאריך יצירה:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
      <p><strong>שם לקוח:</strong> הזמנת תפעול אוטומטית</p>
      <p><strong>טלפון:</strong> 0527614436</p>
      
      <h3>פריטים שהוזמנו:</h3>
      <ul>
        ${itemsHtml}
      </ul>
      
      <p><strong>הערות:</strong> הזמנה אוטומטית לתפעול - נוצרה על ידי המערכת פעם בחמישה ימים</p>
      
      <hr>
      <p><em>הזמנה זו נוצרה אוטומטית על ידי המערכת</em></p>
    `;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "בוקט - הזמנות <onboarding@resend.dev>",
      to: ["r0527614436@gmail.com"],
      subject: "הזמנת תפעול אוטומטית - בוקט",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Maintenance order sent successfully",
        categories_count: maintenanceItems.length,
        email_id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
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
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);