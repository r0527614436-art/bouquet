import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderData {
  customer_name: string;
  phone: string;
  phone_mechutenet?: string;
  email?: string | null;
  event_date: string;
  day_of_week?: string;
  address?: string;
  dress_color?: string;
  payment_method?: string;
  items: string;
  created_at: string;
}

const paymentMethodLabels: Record<string, string> = {
  'cash': 'מזומן',
  'bit': 'ביט',
  'credit': 'אשראי',
  'transfer': 'העברה בנקאית'
};

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

async function sendEmailToCustomer(toEmail: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: "בוקט עיצוב אירועים <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend customer email error: ${res.status} ${text}`);
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

    console.log('Order received:', {
      customer: orderData.customer_name,
      phone: orderData.phone,
      phone_mechutenet: orderData.phone_mechutenet,
      date: orderData.event_date,
      day_of_week: orderData.day_of_week,
      address: orderData.address,
      dress_color: orderData.dress_color,
      payment_method: orderData.payment_method,
      itemCount: items.length
    });

    // Send to Zapier for Google Calendar integration
    const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/26280346/ulixmam/';
    try {
      const itemsList = items.map((item: any) => `דגם ${item.title} (כמות: ${item.quantity})`).join(', ');
      
      const zapierPayload = {
        event_date: orderData.event_date,
        customer_name: orderData.customer_name,
        phone: orderData.phone,
        phone_mechutenet: orderData.phone_mechutenet || '',
        address: orderData.address || '',
        dress_color: orderData.dress_color || '',
        day_of_week: orderData.day_of_week || '',
        items: itemsList,
        order_time: orderData.created_at
      };

      console.log('Sending to Zapier:', zapierPayload);
      
      const zapierResponse = await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zapierPayload),
      });

      if (zapierResponse.ok) {
        console.log('Zapier webhook triggered successfully');
      } else {
        console.error('Zapier webhook failed:', await zapierResponse.text());
      }
    } catch (zapierError) {
      console.error('Error sending to Zapier:', zapierError);
      // Don't fail the order if Zapier fails
    }

    // Create email content
    const subject = 'הזמנה חדשה מהאתר - בוקט';
    
    const itemsHtml = items.map((item: any) => `
      <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fafafa;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 120px; vertical-align: top;">
              <img src="${item.image_url}" alt="${item.title}" style="width: 100px; height: 130px; object-fit: cover; border-radius: 8px;">
            </td>
            <td style="vertical-align: top; padding-right: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #314020;">דגם ${item.title}</h3>
              <p style="margin: 5px 0; color: #666;">כמות: ${item.quantity}</p>
            </td>
          </tr>
        </table>
      </div>
    `).join('');

    const emailContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: #314020; color: white; padding: 25px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 25px; text-align: right; }
          .info-box { background: #f8fbf4; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .section-title { color: #314020; font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 2px solid #314020; padding-bottom: 8px; }
          .info-row { display: flex; flex-direction: row-reverse; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e8e8; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #666; font-weight: bold; text-align: right; }
          .value { color: #314020; text-align: left; }
          .items-section { margin-top: 20px; text-align: right; }
          .items-title { color: #314020; font-size: 18px; margin-bottom: 15px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>הזמנה חדשה מהאתר</h1>
          </div>
          <div class="content">
            <!-- Customer Details -->
            <div class="info-box">
              <div class="section-title">פרטי הלקוח</div>
              <div class="info-row">
                <span class="label">שם המזמין:</span>
                <span class="value">${orderData.customer_name}</span>
              </div>
              <div class="info-row">
                <span class="label">טלפון:</span>
                <span class="value"><a href="tel:${orderData.phone}" style="color: #314020;">${orderData.phone}</a></span>
              </div>
              ${orderData.phone_mechutenet ? `
              <div class="info-row">
                <span class="label">טלפון מחותנת:</span>
                <span class="value"><a href="tel:${orderData.phone_mechutenet}" style="color: #314020;">${orderData.phone_mechutenet}</a></span>
              </div>
              ` : ''}
            </div>

            <!-- Event Details -->
            <div class="info-box">
              <div class="section-title">פרטי האירוע</div>
              <div class="info-row">
                <span class="label">תאריך האירוע:</span>
                <span class="value">${new Date(orderData.event_date).toLocaleDateString('he-IL')}</span>
              </div>
              ${orderData.day_of_week ? `
              <div class="info-row">
                <span class="label">יום בשבוע:</span>
                <span class="value">${orderData.day_of_week}</span>
              </div>
              ` : ''}
              ${orderData.dress_color ? `
              <div class="info-row">
                <span class="label">גוון שמלה:</span>
                <span class="value">${orderData.dress_color}</span>
              </div>
              ` : ''}
            </div>

            <!-- Delivery Address -->
            ${orderData.address ? `
            <div class="info-box">
              <div class="section-title">כתובת למשלוח</div>
              <div class="info-row">
                <span class="label">כתובת:</span>
                <span class="value">${orderData.address}</span>
              </div>
            </div>
            ` : ''}

            <!-- Payment Method -->
            ${orderData.payment_method ? `
            <div class="info-box">
              <div class="section-title">אמצעי תשלום</div>
              <div class="info-row">
                <span class="label">שיטת תשלום:</span>
                <span class="value">${paymentMethodLabels[orderData.payment_method] || orderData.payment_method}</span>
              </div>
            </div>
            ` : ''}

            <!-- Order Metadata -->
            <div class="info-box">
              <div class="section-title">פרטי הזמנה</div>
              <div class="info-row">
                <span class="label">תאריך הזמנה:</span>
                <span class="value">${new Date(orderData.created_at).toLocaleDateString('he-IL')} ${new Date(orderData.created_at).toLocaleTimeString('he-IL')}</span>
              </div>
            </div>
            
            <div class="items-section">
              <h2 class="items-title">פריטים שהוזמנו:</h2>
              ${itemsHtml}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Sending admin email...');
    const emailResponse = await sendEmail(subject, emailContent);
    console.log('Admin email sent successfully:', emailResponse);

    // Send confirmation email to customer if email provided
    if (orderData.email) {
      console.log('Sending customer confirmation email to:', orderData.email);
      
      const customerEmailContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; text-align: right; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #314020; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 30px; text-align: right; }
            .thank-you { background: linear-gradient(135deg, #f8fbf4 0%, #e8f5e0 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center; }
            .thank-you h2 { color: #314020; margin: 0 0 10px 0; font-size: 22px; }
            .thank-you p { color: #666; margin: 0; }
            .info-box { background: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e8e8e8; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .label { color: #888; font-size: 14px; }
            .value { color: #314020; font-weight: bold; }
            .items-section { margin-top: 25px; }
            .items-title { color: #314020; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #314020; padding-bottom: 10px; }
            .item-card { border: 1px solid #e0e0e0; border-radius: 10px; padding: 15px; margin-bottom: 12px; background: #fafafa; }
            .item-card img { width: 80px; height: 100px; object-fit: cover; border-radius: 8px; }
            .item-card h3 { margin: 0; color: #314020; font-size: 16px; }
            .item-card p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
            .footer { background: #f8fbf4; padding: 25px; text-align: center; border-top: 1px solid #e8e8e8; }
            .footer p { color: #666; margin: 5px 0; font-size: 14px; }
            .footer a { color: #314020; text-decoration: none; font-weight: bold; }
            .contact-info { background: #314020; color: white; padding: 15px; border-radius: 8px; margin-top: 15px; }
            .contact-info a { color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>בוקט - עיצוב אירועים</h1>
              <p>אישור הזמנה</p>
            </div>
            <div class="content">
              <div class="thank-you">
                <h2>תודה על הזמנתך, ${orderData.customer_name}! 💐</h2>
                <p>הזמנתך התקבלה בהצלחה וניצור איתך קשר בהקדם</p>
              </div>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">תאריך האירוע:</span>
                  <span class="value">${new Date(orderData.event_date).toLocaleDateString('he-IL')}</span>
                </div>
                <div class="info-row">
                  <span class="label">תאריך הזמנה:</span>
                  <span class="value">${new Date(orderData.created_at).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
              
              <div class="items-section">
                <h3 class="items-title">הפריטים שהזמנת:</h3>
                ${items.map((item: any) => `
                  <div class="item-card">
                    <table style="width: 100%;">
                      <tr>
                        <td style="width: 100px; vertical-align: top;">
                          <img src="${item.image_url}" alt="${item.title}">
                        </td>
                        <td style="vertical-align: top; padding-right: 15px;">
                          <h3>דגם ${item.title}</h3>
                          <p>כמות: ${item.quantity}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                `).join('')}
              </div>
              
              <div class="contact-info">
                <p style="margin: 0; font-size: 14px;">יש לך שאלות? צרו קשר:</p>
                <p style="margin: 8px 0 0 0;"><a href="tel:052-7614436">052-7614436</a></p>
              </div>
            </div>
            <div class="footer">
              <p><strong>בוקט - רוחי רובינשטיין</strong></p>
              <p>עיצוב אירועים | זרי כלה | זרי אירוסין | כסאות כלה</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      try {
        const customerEmailResponse = await sendEmailToCustomer(orderData.email, 'אישור הזמנה - בוקט עיצוב אירועים', customerEmailContent);
        console.log('Customer confirmation email sent successfully:', customerEmailResponse);
      } catch (customerEmailError) {
        console.error('Failed to send customer email, but admin email was sent:', customerEmailError);
      }
    }

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
