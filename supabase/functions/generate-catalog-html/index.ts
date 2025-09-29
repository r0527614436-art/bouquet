import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting catalog HTML generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const fetchWithAuth = (url: string, options: any = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    };

    // Fetch categories
    const categoriesResponse = await fetchWithAuth(
      `${supabaseUrl}/rest/v1/categories?order=created_at.asc`
    );
    
    if (!categoriesResponse.ok) {
      throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
    }
    
    const categories = await categoriesResponse.json();

    // Fetch items
    const itemsResponse = await fetchWithAuth(
      `${supabaseUrl}/rest/v1/catalog_items`
    );
    
    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch items: ${itemsResponse.statusText}`);
    }
    
    const items = await itemsResponse.json();

    console.log(`Found ${categories?.length} categories and ${items?.length} items`);

    // Generate HTML content
    const htmlContent = generateCatalogHTML(items || [], categories || []);
    
    // Upload to storage
    const fileName = `catalog-bouquet.html`;
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/catalog-pdfs/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: htmlContent,
      }
    );

    if (!uploadResponse.ok) {
      console.error('Error uploading HTML:', await uploadResponse.text());
      throw new Error('Failed to upload HTML');
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/catalog-pdfs/${fileName}`;

    console.log('HTML generated and uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        fileName: fileName
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-catalog-html:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate catalog HTML',
        details: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error)
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

function generateCatalogHTML(items: any[], categories: any[]): string {
  // Sort items by category order and display_order
  const sortedItems = items.sort((a, b) => {
    const categoryIndexA = categories.findIndex(cat => cat.id === a.category_id);
    const categoryIndexB = categories.findIndex(cat => cat.id === b.category_id);
    
    if (categoryIndexA === categoryIndexB) {
      if (a.display_order !== b.display_order) {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return categoryIndexA - categoryIndexB;
  });

  let html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>קטלוג בוקט - רוחי רובינשטיין עיצוב אירועים</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body {
          font-family: 'Heebo', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%);
          color: #333;
          direction: rtl;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 2px solid #fce7f3;
        }
        
        .header h1 {
          color: #be185d;
          font-size: 3em;
          margin: 0 0 10px 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(190, 24, 93, 0.1);
        }
        
        .header .subtitle {
          color: #ec4899;
          font-size: 1.3em;
          font-weight: 500;
          margin-bottom: 15px;
        }
        
        .header .date {
          color: #6b7280;
          font-size: 1em;
          background: #fdf2f8;
          padding: 8px 20px;
          border-radius: 25px;
          display: inline-block;
        }
        
        .category {
          margin-bottom: 50px;
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          border: 1px solid #fce7f3;
        }
        
        .category-title {
          color: #be185d;
          font-size: 2.2em;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 3px solid #fce7f3;
          padding-bottom: 15px;
          position: relative;
        }
        
        .category-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #be185d, #ec4899);
          border-radius: 2px;
        }
        
        .category-subtitle {
          text-align: center;
          color: #6b7280;
          font-size: 1.1em;
          margin-bottom: 25px;
          font-style: italic;
        }
        
        .subcategory {
          margin: 30px 0;
        }
        
        .subcategory-title {
          color: #ec4899;
          font-size: 1.5em;
          font-weight: 500;
          margin-bottom: 20px;
          text-align: center;
          background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          padding: 12px 25px;
          border-radius: 30px;
          display: inline-block;
          border: 1px solid #f9a8d4;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }
        
        .item {
          text-align: center;
          background: linear-gradient(135deg, #fafafa, #f8fafc);
          border-radius: 15px;
          padding: 20px;
          border: 2px solid #f1f5f9;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #be185d, #ec4899, #f472b6);
        }
        
        .item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(190, 24, 93, 0.15);
          border-color: #fce7f3;
        }
        
        .item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .item-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 1.1em;
        }
        
        .item-price {
          color: #be185d;
          font-weight: 700;
          font-size: 1.3em;
          background: linear-gradient(135deg, #fdf2f8, #fce7f3);
          padding: 8px 15px;
          border-radius: 20px;
          display: inline-block;
          border: 1px solid #f9a8d4;
        }
        
        .footer {
          text-align: center;
          margin-top: 60px;
          padding: 30px;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(190, 24, 93, 0.3);
        }
        
        .footer h3 {
          margin: 0 0 15px 0;
          font-size: 1.8em;
          font-weight: 600;
        }
        
        .footer p {
          margin: 8px 0;
          font-size: 1.1em;
          opacity: 0.95;
        }
        
        .contact-info {
          background: rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 15px;
          margin-top: 20px;
        }
        
        @media print {
          body { background: white; }
          .category, .header { break-inside: avoid; page-break-inside: avoid; }
          .item { break-inside: avoid; }
        }
        
        @media (max-width: 768px) {
          .header h1 { font-size: 2.2em; }
          .category-title { font-size: 1.8em; }
          .items-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
          body { padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>קטלוג בוקט</h1>
          <div class="subtitle">רוחי רובינשטיין עיצוב אירועים</div>
          <div class="date">עודכן ב: ${new Date().toLocaleDateString('he-IL')}</div>
        </div>
  `;

  // Group items by category
  categories.forEach(category => {
    const categoryItems = sortedItems.filter(item => item.category_id === category.id);
    if (categoryItems.length === 0) return;

    html += `<div class="category">`;
    html += `<h2 class="category-title">${category.name}</h2>`;
    
    if (category.subtitle) {
      html += `<div class="category-subtitle">${category.subtitle}</div>`;
    }

    // Group by subcategory
    const groupedItems = categoryItems.reduce((groups: Record<string, any[]>, item) => {
      const key = item.subcategory || 'main';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});

    Object.entries(groupedItems).forEach(([subcategoryKey, items]) => {
      html += `<div class="subcategory">`;
      
      if (subcategoryKey !== 'main') {
        html += `<h3 class="subcategory-title">${subcategoryKey}</h3>`;
      }
      
      html += `<div class="items-grid">`;
      
      items.forEach(item => {
        html += `
          <div class="item">
            <img src="${item.image_url}" alt="${item.title}" loading="lazy" />
            <div class="item-title">${item.title}</div>
            ${item.price ? `<div class="item-price">₪${item.price}</div>` : ''}
          </div>
        `;
      });
      
      html += `</div></div>`;
    });

    html += `</div>`;
  });

  html += `
        <div class="footer">
          <h3>ליצירת קשר</h3>
          <div class="contact-info">
            <p><strong>רוחי רובינשטיין</strong></p>
            <p>עיצוב אירועים וחתונות חרדיות</p>
            <p>מודיעין עלית והסביבה | בני ברק והסביבה</p>
            <p>ירושלים והסביבה | בית שמש והסביבה</p>
            <p>זרי אירוסין | זרי כלה | בוקט | כסאות כלה | חופות | הפקת אירועים</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}