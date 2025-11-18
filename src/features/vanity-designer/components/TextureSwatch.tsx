import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";

interface TextureSwatchProps {
  finishName: string;
  brand: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const getTextureStyle = (finishName: string, brand: string): React.CSSProperties => {
  const lowerFinish = finishName.toLowerCase();
  
  // White finishes
  if (lowerFinish.includes('white') || lowerFinish.includes('snow') || lowerFinish.includes('ivory')) {
    return {
      background: 'linear-gradient(90deg, #f5f5f0 0%, #fafafa 25%, #f0f0eb 50%, #fafafa 75%, #f5f5f0 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Cream/Beige finishes
  if (lowerFinish.includes('cream') || lowerFinish.includes('beige') || lowerFinish.includes('sand')) {
    return {
      background: 'linear-gradient(90deg, #f5f0e8 0%, #faf5ed 25%, #f0ebe3 50%, #faf5ed 75%, #f5f0e8 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Gray finishes
  if (lowerFinish.includes('gray') || lowerFinish.includes('grey') || lowerFinish.includes('concrete') || lowerFinish.includes('slate')) {
    return {
      background: 'linear-gradient(90deg, #6b6b6b 0%, #7d7d7d 25%, #6b6b6b 50%, #8a8a8a 75%, #7d7d7d 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Dark/Black finishes
  if (lowerFinish.includes('black') || lowerFinish.includes('dark') || lowerFinish.includes('espresso') || lowerFinish.includes('raven')) {
    return {
      background: 'linear-gradient(90deg, #1a1a1a 0%, #2c2420 25%, #1a1a1a 50%, #2c2420 75%, #1a1a1a 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Oak finishes (light)
  if (lowerFinish.includes('oak') && (lowerFinish.includes('light') || lowerFinish.includes('natural') || lowerFinish.includes('ivory') || lowerFinish.includes('milk') || lowerFinish.includes('bondi'))) {
    return {
      background: 'linear-gradient(90deg, #d4b896 0%, #e5d4b8 25%, #cdb08a 50%, #e5d4b8 75%, #d4b896 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Oak finishes (medium)
  if (lowerFinish.includes('oak') && (lowerFinish.includes('desert') || lowerFinish.includes('sahara') || lowerFinish.includes('manhattan') || lowerFinish.includes('burley'))) {
    return {
      background: 'linear-gradient(90deg, #a8866d 0%, #c4a582 25%, #9d7d63 50%, #c4a582 75%, #a8866d 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Oak finishes (dark/casella)
  if (lowerFinish.includes('oak') || lowerFinish.includes('casella')) {
    return {
      background: 'linear-gradient(90deg, #8b7355 0%, #a38968 25%, #7d6650 50%, #a38968 75%, #8b7355 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Walnut finishes
  if (lowerFinish.includes('walnut')) {
    if (lowerFinish.includes('frozen') || lowerFinish.includes('light')) {
      return {
        background: 'linear-gradient(90deg, #8b7b6d 0%, #a39687 25%, #7d6d5f 50%, #a39687 75%, #8b7b6d 100%)',
        backgroundSize: '200% 100%',
      };
    } else if (lowerFinish.includes('smoked') || lowerFinish.includes('dark')) {
      return {
        background: 'linear-gradient(90deg, #4a3f35 0%, #5c4f42 25%, #3d342b 50%, #5c4f42 75%, #4a3f35 100%)',
        backgroundSize: '200% 100%',
      };
    }
    return {
      background: 'linear-gradient(90deg, #5d4e3e 0%, #6f5e4d 25%, #4f4033 50%, #6f5e4d 75%, #5d4e3e 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Maple finishes
  if (lowerFinish.includes('maple')) {
    return {
      background: 'linear-gradient(90deg, #e8d4b8 0%, #f5e8d4 25%, #dcc7ab 50%, #f5e8d4 75%, #e8d4b8 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Cherry finishes
  if (lowerFinish.includes('cherry')) {
    return {
      background: 'linear-gradient(90deg, #8b4a3c 0%, #a35f4d 25%, #7a3f31 50%, #a35f4d 75%, #8b4a3c 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Eucalyptus/Sapele/Triba
  if (lowerFinish.includes('eucalyptus') || lowerFinish.includes('sapele') || lowerFinish.includes('triba')) {
    if (lowerFinish.includes('shadow') || lowerFinish.includes('dark')) {
      return {
        background: 'linear-gradient(90deg, #5a4a3a 0%, #6c5a47 25%, #4d3d2f 50%, #6c5a47 75%, #5a4a3a 100%)',
        backgroundSize: '200% 100%',
      };
    }
    return {
      background: 'linear-gradient(90deg, #9d7d63 0%, #b59575 25%, #8b6d53 50%, #b59575 75%, #9d7d63 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Default wood texture for brand-specific
  if (brand === 'Tafisa') {
    return {
      background: 'linear-gradient(90deg, #8b7355 0%, #a38968 25%, #7d6650 50%, #a38968 75%, #8b7355 100%)',
      backgroundSize: '200% 100%',
    };
  } else if (brand === 'Egger') {
    return {
      background: 'linear-gradient(90deg, #6b5b4d 0%, #7d6b5a 25%, #5d4d3f 50%, #7d6b5a 75%, #6b5b4d 100%)',
      backgroundSize: '200% 100%',
    };
  } else if (brand === 'Shinnoki') {
    return {
      background: 'linear-gradient(90deg, #9b8b7e 0%, #b5a493 25%, #8a7a6d 50%, #b5a493 75%, #9b8b7e 100%)',
      backgroundSize: '200% 100%',
    };
  }
  
  // Fallback
  return {
    background: 'linear-gradient(90deg, #8b7355 0%, #a38968 25%, #7d6650 50%, #a38968 75%, #8b7355 100%)',
    backgroundSize: '200% 100%',
  };
};

const TextureSwatchComponent = ({ finishName, brand, selected, onClick, size = "md" }: TextureSwatchProps) => {
  const textureStyle = useMemo(() => getTextureStyle(finishName, brand), [finishName, brand]);
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };
  
  return (
    <div
      className={cn(
        "rounded-md overflow-hidden cursor-pointer transition-all relative group",
        sizeClasses[size],
        selected ? "ring-2 ring-primary shadow-lg scale-105" : "hover:scale-105 hover:shadow-md",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      style={textureStyle}
    >
      {/* Wood grain overlay effect */}
      <div 
        className="absolute inset-0 opacity-30"
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
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export const TextureSwatch = memo(TextureSwatchComponent);
