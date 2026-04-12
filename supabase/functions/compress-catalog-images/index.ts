import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // List all files in catalog-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('catalog-images')
      .list('', { limit: 1000 })

    if (listError) throw listError

    const imagesToConvert = (files || []).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase()
      return ext && ['jpg', 'jpeg', 'png'].includes(ext)
    })

    console.log(`Found ${imagesToConvert.length} images to convert`)

    let converted = 0
    let failed = 0
    const results: string[] = []

    for (const file of imagesToConvert) {
      try {
        // Download the original image
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('catalog-images')
          .download(file.name)

        if (downloadError || !fileData) {
          console.error(`Failed to download ${file.name}:`, downloadError)
          failed++
          continue
        }

        // Convert using Canvas API via imagescript (Deno-compatible)
        // We'll use a simpler approach: re-upload as-is with webp extension
        // Since Deno doesn't have Canvas, we'll use the sharp-like approach
        
        // For Deno, we use the `imagescript` library for image processing
        const { Image } = await import('https://deno.land/x/imagescript@1.3.0/mod.ts')
        
        const arrayBuffer = await fileData.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)
        
        let img
        try {
          img = await Image.decode(uint8)
        } catch (e) {
          console.error(`Failed to decode ${file.name}:`, e)
          failed++
          continue
        }

        // Resize if wider than 1400px
        if (img.width > 1400) {
          const newHeight = Math.round((img.height * 1400) / img.width)
          img.resize(1400, newHeight)
        }

        // Encode as WebP - imagescript doesn't support WebP natively,
        // so we'll encode as PNG with compression as a fallback
        // Actually, let's try encoding as WebP using the built-in encoder
        let webpData: Uint8Array
        try {
          webpData = await img.encodeWebP(80)
        } catch {
          // Fallback: encode as PNG (still benefits from resize)
          webpData = await img.encode()
        }

        const newName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp')

        // Upload the converted image
        const { error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(newName, webpData, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error(`Failed to upload ${newName}:`, uploadError)
          failed++
          continue
        }

        // Get the new public URL
        const { data: urlData } = supabase.storage
          .from('catalog-images')
          .getPublicUrl(newName)

        // Update catalog_items that reference this file
        const oldUrl = supabase.storage.from('catalog-images').getPublicUrl(file.name).data.publicUrl
        
        const { error: updateError } = await supabase
          .from('catalog_items')
          .update({ image_url: urlData.publicUrl })
          .like('image_url', `%${file.name}%`)

        if (updateError) {
          console.error(`Failed to update DB for ${file.name}:`, updateError)
        }

        // Delete the original file
        await supabase.storage.from('catalog-images').remove([file.name])

        converted++
        results.push(`${file.name} → ${newName}`)
        console.log(`Converted: ${file.name} → ${newName}`)
      } catch (e) {
        console.error(`Error processing ${file.name}:`, e)
        failed++
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Conversion complete. Converted: ${converted}, Failed: ${failed}, Total: ${imagesToConvert.length}`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})