import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imagePath, category = 'gallery' } = await req.json()

    // Fetch the image from the local path
    const imageUrl = `${req.headers.get('origin')}${imagePath}`
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    const imageBlob = await imageResponse.blob()
    const filename = imagePath.split('/').pop() || 'image.jpg'
    const storagePath = `${category}/${filename}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(storagePath, imageBlob, {
        contentType: imageBlob.type,
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(storagePath)

    return new Response(
      JSON.stringify({
        success: true,
        cdnUrl: publicUrl,
        originalPath: imagePath,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
