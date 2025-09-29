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
          'x-upsert': 'true',
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
      <title>קטלוג - בוקט</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Heebo', sans-serif; }
        .bg-gradient-to-b { background: linear-gradient(to bottom, #fdf2f8, #ffffff); }
        .text-pink-600 { color: #db2777; }
        .text-pink-700 { color: #be185d; }
        .text-pink-800 { color: #9d174d; }
        .bg-pink-50 { background-color: #fdf2f8; }
        .bg-pink-600 { background-color: #db2777; }
        .border-pink-100 { border-color: #fce7f3; }
        .border-pink-600 { border-color: #db2777; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
        .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
        .transition-shadow { transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .aspect-square { aspect-ratio: 1 / 1; }
        .object-cover { object-fit: cover; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .overflow-hidden { overflow: hidden; }
        .duration-300 { transition-duration: 300ms; }
        .print\\:hidden { display: none !important; }
        @media print { .print\\:hidden { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white" id="catalog-page">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-pink-100">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center space-x-4 rtl:space-x-reverse">
                <div class="flex items-center text-pink-600">
                  <svg class="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  עמוד הקטלוג
                </div>
              </div>
              
              <div class="flex items-center">
                <img 
                  src="/lovable-uploads/a426acbf-1250-4310-96a5-a86f391bac0f.png" 
                  alt="בוקט לוגו" 
                  class="h-24 w-auto"
                />
              </div>
            </div>
          </div>
        </header>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-pink-800 mb-4">קטלוג</h1>
          </div>

          <!-- Items Grid -->
          <div class="space-y-12">
  `;

  // Group items by category
  categories.forEach(category => {
    const categoryItems = sortedItems.filter(item => item.category_id === category.id);
    if (categoryItems.length === 0) return;

    html += `
            <!-- Category: ${category.name} -->
            <div class="space-y-8">
              <div class="text-center">
                <h2 class="text-2xl font-bold text-pink-800">${category.name}</h2>`;
    
    if (category.subtitle) {
      html += `
                <p class="text-gray-600 mt-1">${category.subtitle}</p>`;
    }
    
    html += `
              </div>`;

    // Group by subcategory
    const groupedItems = categoryItems.reduce((groups: Record<string, any[]>, item) => {
      const key = item.subcategory || 'main';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});

    Object.entries(groupedItems).forEach(([subcategoryKey, items]) => {
      html += `
              <div class="space-y-4">`;
      
      if (subcategoryKey !== 'main') {
        html += `
                <div class="text-center">
                  <h3 class="text-lg font-semibold text-pink-600 bg-pink-50 py-2 px-4 rounded-lg inline-block">
                    ${subcategoryKey}
                  </h3>
                </div>`;
      }
      
      html += `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">`;
      
      items.forEach(item => {
        html += `
                  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    <div class="aspect-square overflow-hidden">
                      <img
                        src="${item.image_url}"
                        alt="${item.title}"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div class="p-4">
                      <h3 class="text-lg font-semibold text-gray-800 mb-2">${item.title}</h3>`;
        
        if (item.price) {
          html += `
                      <p class="text-pink-600 font-bold text-xl mb-3">₪${item.price}</p>`;
        }
        
        // Add cart indicator if category allows cart
        if (category.allow_cart !== false) {
          html += `
                      <div class="absolute top-4 right-4 bg-pink-600 text-white p-2 rounded-full shadow-lg">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L12 21l7.5-3L17 13"></path>
                        </svg>
                      </div>`;
        } else {
          html += `
                      <div class="absolute top-4 right-4 bg-gray-600 text-white p-2 rounded-full shadow-lg">
                        <span class="text-xs font-medium">דוגמה</span>
                      </div>`;
        }
        
        html += `
                    </div>
                  </div>`;
      });
      
      html += `
                </div>
              </div>`;
    });

    html += `
            </div>`;
  });

  html += `
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}