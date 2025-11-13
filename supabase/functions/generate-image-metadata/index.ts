import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing image with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert specialized in generating accessible and search-optimized image metadata. Generate concise, descriptive alt text (max 125 characters) and detailed descriptions (150-200 characters) that improve SEO while being helpful for screen readers.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and generate SEO-optimized metadata for it. Focus on describing what you see clearly and concisely.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_image_metadata',
              description: 'Generate SEO-optimized alt text and description for an image',
              parameters: {
                type: 'object',
                properties: {
                  altText: {
                    type: 'string',
                    description: 'Concise, descriptive alt text for accessibility and SEO (max 125 characters). Should describe the main subject and key details.'
                  },
                  description: {
                    type: 'string',
                    description: 'Detailed description for SEO purposes (150-200 characters). Should include context, colors, setting, and relevant keywords naturally.'
                  },
                  suggestedDisplayName: {
                    type: 'string',
                    description: 'Short, SEO-friendly title for the image (3-5 words)'
                  }
                },
                required: ['altText', 'description', 'suggestedDisplayName'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'generate_image_metadata' }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metadata = JSON.parse(toolCall.function.arguments);
    console.log('Generated metadata:', metadata);

    return new Response(
      JSON.stringify({
        altText: metadata.altText,
        description: metadata.description,
        displayName: metadata.suggestedDisplayName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image-metadata:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
