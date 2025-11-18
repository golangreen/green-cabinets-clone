import { corsHeaders } from '../_shared/cors.ts';

interface DesignPreferences {
  style?: string;
  budget?: string;
  colorScheme?: string;
  roomSize?: string;
  priorities?: string[];
}

interface VanityConfiguration {
  brand: string;
  finish: string;
  width: number;
  depth: number;
  height: number;
  hasMirrorCabinet: boolean;
  sinkType?: string;
  hardwareFinish?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences, currentConfig }: {
      preferences: DesignPreferences;
      currentConfig: VanityConfiguration;
    } = await req.json();

    // Build detailed prompt for AI
    const prompt = `You are an expert interior designer specializing in bathroom vanities. 
    
User Preferences:
- Style: ${preferences.style || 'not specified'}
- Budget: ${preferences.budget || 'not specified'}
- Color Scheme: ${preferences.colorScheme || 'not specified'}
- Room Size: ${preferences.roomSize || 'not specified'}
- Priorities: ${preferences.priorities?.join(', ') || 'not specified'}

Current Vanity Configuration:
- Brand: ${currentConfig.brand}
- Finish: ${currentConfig.finish}
- Dimensions: ${currentConfig.width}" W x ${currentConfig.depth}" D x ${currentConfig.height}" H
- Mirror Cabinet: ${currentConfig.hasMirrorCabinet ? 'Yes' : 'No'}
- Sink Type: ${currentConfig.sinkType || 'not specified'}
- Hardware Finish: ${currentConfig.hardwareFinish || 'not specified'}

Please provide 3-5 specific design suggestions to improve this configuration. For each suggestion:
1. Category (material/dimension/style/cost/compatibility)
2. Clear title
3. Detailed description
4. Reasoning explaining why this improvement matters
5. Impact level (low/medium/high)
6. Specific recommendations (brand names, dimensions, finishes, or cost savings if applicable)

Focus on practical, actionable advice that considers the user's preferences and current choices.
Format your response as a JSON array of suggestion objects.`;

    // Note: In production, this would call Lovable AI service
    // For now, return mock suggestions to demonstrate the interface
    const suggestions = [
      {
        category: 'material',
        title: 'Consider Complementary Hardware Finish',
        description: `For your ${currentConfig.finish} cabinet finish, a brushed nickel or matte black hardware finish would create beautiful contrast.`,
        reasoning: 'Hardware finish selection significantly impacts the overall aesthetic. The right choice can elevate the design from standard to sophisticated.',
        impact: 'medium',
        recommendation: {
          hardwareFinish: currentConfig.finish.toLowerCase().includes('dark') ? 'Brushed Nickel' : 'Matte Black',
        },
      },
      {
        category: 'dimension',
        title: 'Optimize Depth for Small Bathrooms',
        description: currentConfig.depth > 21 
          ? `Your current ${currentConfig.depth}" depth may feel cramped. Consider reducing to 18-21" for better traffic flow.`
          : 'Your vanity depth is well-suited for the space.',
        reasoning: 'Standard vanity depth is 21", but 18" works better for smaller bathrooms (under 40 sq ft) without sacrificing functionality.',
        impact: currentConfig.depth > 21 ? 'high' : 'low',
        recommendation: currentConfig.depth > 21 ? { depth: 21 } : {},
      },
      {
        category: 'style',
        title: 'Add Mirror Cabinet for Storage',
        description: !currentConfig.hasMirrorCabinet 
          ? 'A mirror cabinet doubles as storage and eliminates the need for a separate medicine cabinet.'
          : 'Great choice adding the mirror cabinet!',
        reasoning: 'Mirror cabinets provide hidden storage for toiletries while maintaining a clean, uncluttered appearance.',
        impact: !currentConfig.hasMirrorCabinet ? 'high' : 'low',
        recommendation: !currentConfig.hasMirrorCabinet ? { hasMirrorCabinet: true } : {},
      },
    ];

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('AI suggestions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
