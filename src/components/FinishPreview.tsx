import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FinishPreviewProps {
  brand: string;
  finish: string;
  isLoading?: boolean;
}

// Finish descriptions to help generate accurate previews
const FINISH_DESCRIPTIONS: Record<string, string> = {
  // Tafisa - Melamine
  'White': 'Pure white matte melamine surface',
  'Cream Puff': 'Soft cream colored matte melamine with subtle warmth',
  'Sand Castle': 'Light sandy beige melamine with natural undertones',
  'Tiramisu': 'Warm caramel beige melamine finish',
  'Secret Garden': 'Soft sage green melamine surface',
  'Froth of Sea': 'Light aqua blue-gray melamine',
  'Gardenia': 'Off-white with slight yellow undertones melamine',
  'Cashmere': 'Warm taupe melamine finish',
  'Morning Dew': 'Pale gray-beige melamine',
  'Daybreak': 'Light peachy-beige melamine',
  'Milky Way': 'Cool light gray melamine',
  'Summer Drops': 'Medium gray melamine surface',
  'Moonlight': 'Soft silver-gray melamine',
  'White Chocolate': 'Creamy white wood grain melamine',
  'Natural Affinity': 'Natural light oak wood grain melamine',
  'Free Spirit': 'Light natural oak melamine with visible grain',
  'Niagara': 'Light gray-brown oak melamine',
  'Summer Breeze': 'Pale ash wood melamine',
  'Mojave': 'Medium warm oak melamine',
  
  // Shinnoki - Wood Veneer
  'Bondi Oak': 'Very light blonde oak wood veneer with natural grain',
  'Milk Oak': 'Pale white oak veneer with subtle grain patterns',
  'Pebble Triba': 'Light gray-brown textured wood veneer',
  'Ivory Oak': 'Creamy white oak veneer with elegant grain',
  'Ivory Infinite Oak': 'Continuous ivory oak veneer pattern',
  'Natural Oak': 'Warm natural oak veneer with rich grain',
  'Frozen Walnut': 'Cool gray-brown walnut veneer with distinctive grain',
  'Manhattan Oak': 'Medium brown oak veneer with urban sophistication',
  'Desert Oak': 'Warm honey oak veneer with desert tones',
  'Sahara Oak': 'Golden sand oak veneer with natural variation',
  'Terra Sapele': 'Reddish-brown sapele wood veneer',
  'Cinnamon Triba': 'Warm cinnamon brown textured veneer',
  'Smoked Walnut': 'Dark gray-brown smoked walnut veneer',
  'Pure Walnut': 'Rich chocolate brown walnut veneer',
  'Shadow Eucalyptus': 'Dark gray eucalyptus wood veneer',
  'Burley Oak': 'Rich medium brown oak veneer with character',
  'Stardust Walnut': 'Medium walnut with golden highlights',
  'Raven Oak': 'Very dark charcoal oak veneer with deep grain',
};

export const FinishPreview = ({ brand, finish, isLoading }: FinishPreviewProps) => {
  const description = FINISH_DESCRIPTIONS[finish] || 'Premium cabinet finish';
  const isWoodVeneer = brand === 'Shinnoki';
  
  // Generate background based on finish characteristics
  const getFinishGradient = () => {
    const finishLower = finish.toLowerCase();
    
    // Whites and Creams
    if (finishLower.includes('white') || finishLower.includes('cream') || finishLower.includes('ivory')) {
      return 'bg-gradient-to-br from-gray-50 via-white to-gray-100';
    }
    // Grays
    if (finishLower.includes('gray') || finishLower.includes('moonlight') || finishLower.includes('silver')) {
      return 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400';
    }
    // Beiges and Tans
    if (finishLower.includes('sand') || finishLower.includes('beige') || finishLower.includes('cashmere')) {
      return 'bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300';
    }
    // Oak - Light
    if ((finishLower.includes('oak') || finishLower.includes('bondi') || finishLower.includes('milk')) && 
        (finishLower.includes('light') || finishLower.includes('natural') || finishLower.includes('bondi') || finishLower.includes('milk'))) {
      return 'bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100';
    }
    // Oak - Medium
    if (finishLower.includes('oak') && (finishLower.includes('sahara') || finishLower.includes('desert') || finishLower.includes('manhattan'))) {
      return 'bg-gradient-to-br from-amber-200 via-amber-300 to-orange-200';
    }
    // Walnut
    if (finishLower.includes('walnut')) {
      if (finishLower.includes('frozen')) {
        return 'bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600';
      }
      if (finishLower.includes('smoked') || finishLower.includes('pure')) {
        return 'bg-gradient-to-br from-amber-800 via-amber-900 to-stone-800';
      }
      return 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800';
    }
    // Dark finishes
    if (finishLower.includes('raven') || finishLower.includes('shadow') || finishLower.includes('black')) {
      return 'bg-gradient-to-br from-gray-800 via-gray-900 to-black';
    }
    
    // Default
    return 'bg-gradient-to-br from-amber-100 via-amber-200 to-orange-100';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Finish Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="w-full aspect-square rounded-lg" />
        ) : (
          <>
            {/* Large Preview */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border shadow-lg">
              <div className={`absolute inset-0 ${getFinishGradient()}`}>
                {isWoodVeneer && (
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.1) 2px,
                        rgba(0,0,0,0.1) 4px
                      )`,
                    }}
                  />
                )}
                {/* Texture overlay for realism */}
                <div 
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              
              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">{finish}</h3>
                <p className="text-white/90 text-sm">{brand}</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[80px]">Material:</span>
                <span className="text-muted-foreground">
                  {isWoodVeneer ? 'Prefinished Wood Veneer' : 'Premium Melamine (TFL)'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[80px]">Description:</span>
                <span className="text-muted-foreground">{description}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[80px]">Features:</span>
                <span className="text-muted-foreground">
                  {isWoodVeneer 
                    ? 'Scratch resistant, Natural wood beauty, Deep brushing texture'
                    : 'Durable surface, Easy to clean, Consistent color'}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};