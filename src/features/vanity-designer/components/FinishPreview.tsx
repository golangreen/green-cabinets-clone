import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TAFISA_COLORS } from "@/lib/tafisaColors";
import { EGGER_COLORS } from "@/features/vanity-designer/data/finishes/egger";

// Map finish names to their actual product image URLs from manufacturer websites
const FINISH_IMAGE_URLS: Record<string, string> = {
  // Get Tafisa images from the comprehensive color library
  ...Object.fromEntries(
    TAFISA_COLORS.filter(c => c.imageUrl).map(c => [c.name, c.imageUrl!])
  ),
  
  // Get Egger images from the comprehensive color library
  ...Object.fromEntries(
    EGGER_COLORS.filter(c => c.imageUrl).map(c => [c.name, c.imageUrl!])
  ),
  
  // Shinnoki finishes - High quality images from Architonic
  'Bondi Oak': 'https://media.architonic.com/m-on/3101951/product/1366359/decospan_shinnoki-desert-oak_6bc23886.jpeg',
  'Milk Oak': 'https://media.architonic.com/m-on/3101951/product/1366355/decospan_shinnoki-milk-oak_7f124fc1.jpeg',
  'Pebble Triba': 'https://media.architonic.com/m-on/3101951/product/1366390/decospan_shinnoki-sand-ash_c559aa55.jpeg',
  'Ivory Oak': 'https://media.architonic.com/m-on/3101951/product/1366352/decospan_shinnoki-ivory-oak_f2ae951b.jpeg',
  'Ivory Infinite Oak': 'https://media.architonic.com/m-on/3101951/product/1366352/decospan_shinnoki-ivory-oak_60d3c83a.jpeg',
  'Natural Oak': 'https://media.architonic.com/m-on/3101951/product/1351346/decospan_shinnoki-natural-oak_8bdf9494.jpeg',
  'Frozen Walnut': 'https://media.architonic.com/m-on/3101951/product/1366400/decospan_shinnoki-granite-walnut_13e3d5c7.jpeg',
  'Manhattan Oak': 'https://media.architonic.com/m-on/3101951/product/1366366/decospan_shinnoki-manhattan-oak_da1b59ed.jpeg',
  'Desert Oak': 'https://media.architonic.com/m-on/3101951/product/1366359/decospan_shinnoki-desert-oak_6bc23886.jpeg',
  'Sahara Oak': 'https://media.architonic.com/m-on/3101951/product/1366369/decospan_shinnoki-mystery-oak_587d97f0.jpeg',
  'Terra Sapele': 'https://media.architonic.com/m-on/3101951/product/1366388/decospan_shinnoki-tempered-frake_3cbf3e75.jpeg',
  'Cinnamon Triba': 'https://media.architonic.com/m-on/3101951/product/1366379/decospan_shinnoki-vanilla-larch_b20616b2.jpeg',
  'Smoked Walnut': 'https://media.architonic.com/m-on/3101951/product/1366405/decospan_shinnoki-smoked-walnut_ba35ad13.jpeg',
  'Pure Walnut': 'https://media.architonic.com/m-on/3101951/product/1366400/decospan_shinnoki-granite-walnut_13e3d5c7.jpeg',
  'Shadow Eucalyptus': 'https://media.architonic.com/m-on/3101951/product/1366415/decospan_shinnoki-shadow-macassar_03c140fa.jpeg',
  'Burley Oak': 'https://media.architonic.com/m-on/3101951/product/1366374/decospan_shinnoki-antique-oak_19eed38c.jpeg',
  'Stardust Walnut': 'https://media.architonic.com/m-on/3101951/product/1366405/decospan_shinnoki-smoked-walnut_ba35ad13.jpeg',
  'Raven Oak': 'https://media.architonic.com/m-on/3101951/product/1366418/decospan_shinnoki-nero-lati_0314ee39.jpeg',
};

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
  const isTFL = brand === 'Tafisa' || brand === 'Egger';
  const imageUrl = FINISH_IMAGE_URLS[finish];
  
  // Fallback color mapping if no image available
  const getFinishColors = () => {
    switch (finish) {
      // Tafisa - Whites & Creams
      case 'White': return { from: '#FFFFFF', to: '#F5F5F5', via: '#FAFAFA' };
      case 'Cream Puff': return { from: '#FFF8E7', to: '#F5E6D3', via: '#FAF0E0' };
      case 'Sand Castle': return { from: '#F5E6D3', to: '#E6D4BE', via: '#EAD9C5' };
      case 'Tiramisu': return { from: '#E8D5B7', to: '#D4BFA3', via: '#DECAA8' };
      case 'Gardenia': return { from: '#FAF5EE', to: '#F0EAE0', via: '#F5EFE7' };
      case 'Cashmere': return { from: '#E8DDD0', to: '#D9C9B8', via: '#E0D3C4' };
      
      // Tafisa - Grays
      case 'Froth of Sea': return { from: '#E8F0F2', to: '#D4E0E3', via: '#DDE8EB' };
      case 'Morning Dew': return { from: '#E8E8E0', to: '#D6D6CE', via: '#DFDFD7' };
      case 'Daybreak': return { from: '#F2E8E0', to: '#E3D6CE', via: '#EADFD7' };
      case 'Milky Way': return { from: '#E8E8E8', to: '#D6D6D6', via: '#DFDFDF' };
      case 'Summer Drops': return { from: '#C9C9C9', to: '#B5B5B5', via: '#BFBFBF' };
      case 'Moonlight': return { from: '#D6D6D6', to: '#C4C4C4', via: '#CDCDCD' };
      case 'Secret Garden': return { from: '#D9E3D3', to: '#C7D4BC', via: '#D0DBC7' };
      
      // Tafisa - Woods
      case 'White Chocolate': return { from: '#F5EDE0', to: '#E6D9C9', via: '#EDE3D4' };
      case 'Natural Affinity': return { from: '#E8D4B8', to: '#D9C5A3', via: '#E0CCA8' };
      case 'Free Spirit': return { from: '#E0C9A8', to: '#D1BA99', via: '#D8C1A0' };
      case 'Niagara': return { from: '#D6C9B8', to: '#C7BAA9', via: '#CEC1B0' };
      case 'Summer Breeze': return { from: '#E0D9CE', to: '#D1CAB8', via: '#D8D1C3' };
      case 'Mojave': return { from: '#D4BFA3', to: '#C5B094', via: '#CCB79B' };
      case 'Fogo Harbour': return { from: '#D1BFA8', to: '#C2B099', via: '#C9B7A0' };
      case 'Weekend Getaway': return { from: '#CEB89C', to: '#BFA98D', via: '#C6B094' };
      case 'Crème de la Crème': return { from: '#F5F0E6', to: '#E6E0D6', via: '#EDE8DD' };
      case 'Love at First Sight': return { from: '#E8DACC', to: '#D9CBBD', via: '#E0D2C4' };
      
      // Shinnoki - Light Oaks
      case 'Bondi Oak': return { from: '#F5EDD9', to: '#E6DEC9', via: '#EDE5D1' };
      case 'Milk Oak': return { from: '#F5F0E6', to: '#E6E0D6', via: '#EDE8DD' };
      case 'Ivory Oak': return { from: '#F5E8D6', to: '#E6D9C7', via: '#EDE0CE' };
      case 'Ivory Infinite Oak': return { from: '#F5E8D6', to: '#E6D9C7', via: '#EDE0CE' };
      case 'Natural Oak': return { from: '#E8D4B8', to: '#D9C5A3', via: '#E0CCA8' };
      case 'Pebble Triba': return { from: '#D9CEC4', to: '#CABFB5', via: '#D1C6BC' };
      
      // Shinnoki - Medium Oaks
      case 'Sahara Oak': return { from: '#D9BF99', to: '#CAB08A', via: '#D1B791' };
      case 'Desert Oak': return { from: '#D9C4A3', to: '#CAB594', via: '#D1BC9B' };
      case 'Manhattan Oak': return { from: '#C9B099', to: '#BAA18A', via: '#C1A891' };
      case 'Burley Oak': return { from: '#B8A08A', to: '#A9917B', via: '#B09880' };
      
      // Shinnoki - Walnuts
      case 'Frozen Walnut': return { from: '#A39687', to: '#948778', via: '#9B8E7F' };
      case 'Smoked Walnut': return { from: '#705E4D', to: '#614F3E', via: '#685647' };
      case 'Pure Walnut': return { from: '#5E4D3E', to: '#4F3E2F', via: '#564536' };
      case 'Stardust Walnut': return { from: '#8A735C', to: '#7B644D', via: '#826B54' };
      
      // Shinnoki - Dark Woods
      case 'Raven Oak': return { from: '#3D3833', to: '#2E2924', via: '#35302B' };
      case 'Shadow Eucalyptus': return { from: '#524740', to: '#433832', via: '#4A3F39' };
      case 'Terra Sapele': return { from: '#8A5E4D', to: '#7B4F3E', via: '#825645' };
      case 'Cinnamon Triba': return { from: '#A37356', to: '#946447', via: '#9B6B4E' };
      
      // Default
      default: return { from: '#E8D4B8', to: '#D9C5A3', via: '#E0CCA8' };
    }
  };

  const colors = getFinishColors();

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm">Finish Preview</h3>
        <p className="text-xs text-muted-foreground">Actual product image from manufacturer</p>
      </div>
      
      {isLoading ? (
        <Skeleton className="w-full aspect-square rounded-lg" />
      ) : (
        <div className="space-y-3">
          {/* Large Preview - Show actual manufacturer image */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border shadow-lg bg-muted">
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={`${brand} ${finish} finish sample`}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`;
                  }
                }}
              />
            ) : (
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
                  }}
                >
                  {isWoodVeneer && (
                    <>
                      {/* Wood grain pattern */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 3px,
                            rgba(0,0,0,0.15) 3px,
                            rgba(0,0,0,0.15) 4px
                          ), repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 40px,
                            rgba(0,0,0,0.08) 40px,
                            rgba(0,0,0,0.08) 42px
                          )`,
                        }}
                      />
                      {/* Subtle wood texture */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                      />
                    </>
                  )}
                  {!isWoodVeneer && (
                    /* Melamine subtle texture */
                    <div 
                      className="absolute inset-0 opacity-10 mix-blend-overlay"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      }}
                    />
                  )}
                </div>
            )}
          </div>
          
          {/* Finish info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
            <div>
              <h4 className="font-bold text-base">{finish}</h4>
              <p className="text-xs text-muted-foreground">{brand} Collection</p>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[70px]">Material:</span>
                <span className="text-muted-foreground">
                  {isWoodVeneer ? 'Wood Veneer' : isTFL ? 'Melamine (TFL/HPL)' : 'Premium Surface'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[70px]">Features:</span>
                <span className="text-muted-foreground">
                  {isWoodVeneer 
                    ? 'Scratch resistant, Natural beauty'
                    : 'Durable, Easy to clean'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};