
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderData {
  event_date: string;
  customer_name: string;
  event_phone: string;
  mechutan_phone?: string;
  day_of_week: string;
  delivery_city: string;
  delivery_street: string;
  delivery_building: string;
  delivery_entrance?: string;
  delivery_floor?: string;
  dress_color?: string;
  payment_method: string;
  notes?: string;
  items: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();
    
    const items = JSON.parse(orderData.items);
    
    // Create email content
    const emailContent = `
      <h2>הזמנה חדשה מהאתר</h2>
      
      <h3>פרטי הלקוח:</h3>
      <p><strong>שם:</strong> ${orderData.customer_name}</p>
      <p><strong>טלפון זמין ביום האירוע:</strong> ${orderData.event_phone}</p>
      ${orderData.mechutan_phone ? `<p><strong>טלפון מחותנת:</strong> ${orderData.mechutan_phone}</p>` : ''}
      
      <h3>פרטי האירוע:</h3>
      <p><strong>תאריך האירוע:</strong> ${new Date(orderData.event_date).toLocaleDateString('he-IL')}</p>
      <p><strong>יום בשבוע:</strong> ${orderData.day_of_week}</p>
      ${orderData.dress_color ? `<p><strong>גוון שמלת כלה:</strong> ${orderData.dress_color}</p>` : ''}
      
      <h3>כתובת למשלוח:</h3>
      <p><strong>עיר:</strong> ${orderData.delivery_city}</p>
      <p><strong>רחוב:</strong> ${orderData.delivery_street}</p>
      <p><strong>בניין:</strong> ${orderData.delivery_building}</p>
      ${orderData.delivery_entrance ? `<p><strong>כניסה:</strong> ${orderData.delivery_entrance}</p>` : ''}
      ${orderData.delivery_floor ? `<p><strong>קומה:</strong> ${orderData.delivery_floor}</p>` : ''}
      
      <h3>אמצעי תשלום:</h3>
      <p>${orderData.payment_method}</p>
      
      ${orderData.notes ? `<h3>הערות:</h3><p>${orderData.notes}</p>` : ''}
      
      <h3>פריטים שהוזמנו:</h3>
      <ul>
        ${items.map((item: any) => `
          <li>
            <strong>${item.title}</strong> - כמות: ${item.quantity}
            ${item.price ? ` - מחיר: ₪${item.price}` : ''}
            <br>
            <img src="${item.image_url}" alt="${item.title}" style="width: 100px; height: 100px; object-fit: cover; margin-top: 5px;">
          </li>
        `).join('')}
      </ul>
      
      <p><strong>תאריך הזמנה:</strong> ${new Date(orderData.created_at).toLocaleDateString('he-IL')} ${new Date(orderData.created_at).toLocaleTimeString('he-IL')}</p>
    `;

    console.log('Order received:', orderData);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "בוקט הזמנות <onboarding@resend.dev>",
      to: ["r0527614436@gmail.com"],
      subject: `הזמנה חדשה מ-${orderData.customer_name}`,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: 'Order received and email sent successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-order function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
