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
    console.log('Starting catalog PDF generation...');
    
    // Create supabase client directly
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Simple fetch-based approach instead of SDK
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

    // Generate simple PDF content
    const pdfContent = await generateSimplePDF(items || [], categories || []);
    
    // Upload to storage using REST API
    const fileName = `catalog-${Date.now()}.pdf`;
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/catalog-pdfs/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          // Content-Type is inferred from Blob
        },
        body: new Blob([pdfContent.buffer.slice(pdfContent.byteOffset, pdfContent.byteOffset + pdfContent.byteLength) as ArrayBuffer], { type: 'application/pdf' }),
      }
    );

    if (!uploadResponse.ok) {
      console.error('Error uploading PDF:', await uploadResponse.text());
      throw new Error('Failed to upload PDF');
    }

    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/catalog-pdfs/${fileName}`;

    console.log('PDF generated and uploaded successfully:', publicUrl);

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
    console.error('Error in generate-catalog-pdf:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate catalog PDF',
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
      <title>קטלוג בוקט</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap');
        
        body {
          font-family: 'Heebo', sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%);
          color: #333;
          direction: rtl;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .header h1 {
          color: #be185d;
          font-size: 2.5em;
          margin: 0;
          font-weight: 700;
        }
        
        .category {
          margin-bottom: 40px;
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .category-title {
          color: #be185d;
          font-size: 1.8em;
          font-weight: 600;
          margin-bottom: 15px;
          text-align: center;
          border-bottom: 2px solid #fdf2f8;
          padding-bottom: 10px;
        }
        
        .subcategory {
          margin: 20px 0;
        }
        
        .subcategory-title {
          color: #ec4899;
          font-size: 1.3em;
          font-weight: 500;
          margin-bottom: 15px;
          text-align: center;
          background: #fdf2f8;
          padding: 8px 15px;
          border-radius: 25px;
          display: inline-block;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }
        
        .item {
          text-align: center;
          background: #fafafa;
          border-radius: 10px;
          padding: 15px;
          border: 1px solid #f0f0f0;
        }
        
        .item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        
        .item-title {
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }
        
        .item-price {
          color: #be185d;
          font-weight: 600;
          font-size: 1.1em;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: white;
          border-radius: 15px;
          color: #666;
        }
        
        @media print {
          .category {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>קטלוג בוקט</h1>
        <p>רוחי רובינשטיין עיצוב אירועים</p>
      </div>
  `;

  // Group items by category
  categories.forEach(category => {
    const categoryItems = sortedItems.filter(item => item.category_id === category.id);
    if (categoryItems.length === 0) return;

    html += `<div class="category">`;
    html += `<h2 class="category-title">${category.name}</h2>`;
    
    if (category.subtitle) {
      html += `<p style="text-align: center; color: #666; margin-bottom: 20px;">${category.subtitle}</p>`;
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
            <img src="${item.image_url}" alt="${item.title}" />
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
        <p>עודכן ב: ${new Date().toLocaleDateString('he-IL')}</p>
        <p>רוחי רובינשטיין עיצוב אירועים | מודיעין עילית והסביבה</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

async function generateSimplePDF(items: any[], categories: any[]): Promise<Uint8Array> {
  // This is a simplified PDF generation
  // In production, you'd want to use a proper library like puppeteer or similar
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(קטלוג בוקט) Tj
0 -30 Td
/F1 12 Tf
(רוחי רובינשטיין עיצוב אירועים) Tj
0 -20 Td
(עודכן ב: ${new Date().toLocaleDateString('he-IL')}) Tj
0 -30 Td
(סה"כ פריטים: ${items.length}) Tj
0 -20 Td
(סה"כ קטגוריות: ${categories.length}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000348 00000 n 
0000000565 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
665
%%EOF`;

  return new TextEncoder().encode(content);
}