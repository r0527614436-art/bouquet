import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderData {
  type?: string;
  event_date?: string;
  customer_name: string;
  event_phone?: string;
  phone?: string;
  email?: string;
  mechutan_phone?: string;
  day_of_week?: string;
  delivery_city?: string;
  delivery_street?: string;
  delivery_building?: string;
  delivery_entrance?: string;
  delivery_floor?: string;
  dress_color?: string;
  payment_method?: string;
  notes?: string;
  items: string;
  created_at: string;
}

async function sendEmail(subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: "בוקט הזמנות <onboarding@resend.dev>",
      to: ["r0527614436@gmail.com"],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }

  return await res.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();
    const items = JSON.parse(orderData.items);

    // Create email content based on order type
    let emailContent = '';
    let subject = '';

    if (orderData.type === 'price-inquiry') {
      subject = 'בקשת בירור מחיר חדשה';
      emailContent = `
        <div dir="rtl" style="font-family: Heebo, Arial, sans-serif;">
          <h2>בקשת בירור מחיר חדשה</h2>
          <h3>פרטי הלקוח:</h3>
          <p><strong>שם:</strong> ${orderData.customer_name}</p>
          <p><strong>טלפון:</strong> ${orderData.phone}</p>
          ${orderData.email ? `<p><strong>מייל:</strong> ${orderData.email}</p>` : ''}
          <h3>מוצרים שנבחרו:</h3>
          <ul>
            ${items.map((item: any) => `
              <li>
                <strong>${item.title}</strong> - כמות: ${item.quantity}
              </li>
            `).join('')}
          </ul>
          ${orderData.notes ? `<h3>הערות:</h3><p>${orderData.notes}</p>` : ''}
          <p><strong>תאריך בקשה:</strong> ${new Date(orderData.created_at).toLocaleDateString('he-IL')} ${new Date(orderData.created_at).toLocaleTimeString('he-IL')}</p>
        </div>
      `;
    } else {
      subject = 'הזמנה חדשה מהאתר';
      emailContent = `
        <div dir="rtl" style="font-family: Heebo, Arial, sans-serif;">
          <h2>הזמנה חדשה מהאתר</h2>
          <h3>פרטי הלקוח:</h3>
          <p><strong>שם:</strong> ${orderData.customer_name}</p>
          <p><strong>טלפון זמין ביום האירוע:</strong> ${orderData.event_phone}</p>
          ${orderData.mechutan_phone ? `<p><strong>טלפון מחותנת:</strong> ${orderData.mechutan_phone}</p>` : ''}
          <h3>פרטי האירוע:</h3>
          <p><strong>תאריך האירוע:</strong> ${new Date(orderData.event_date!).toLocaleDateString('he-IL')}</p>
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
        </div>
      `;
    }

    console.log('Order received, sending email...');
    const emailResponse = await sendEmail(subject, emailContent);
    console.log('Email sent OK:', emailResponse);

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
