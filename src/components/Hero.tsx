import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Camera } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ROUTES } from "@/constants/routes";
import logo from "@/assets/logo.jpg";
import modernKitchenIslandBarStools from "@/assets/gallery/modern-kitchen-island-bar-stools.jpeg";
import luxuryKitchenMarbleDining from "@/assets/gallery/luxury-kitchen-marble-dining.jpeg";
import modernBathroomWoodMarble from "@/assets/gallery/modern-bathroom-wood-marble.jpeg";
import contemporaryPowderRoomWood from "@/assets/gallery/contemporary-powder-room-wood.jpeg";
import luxuryMarbleBathroomShower from "@/assets/gallery/luxury-marble-bathroom-shower.jpeg";
import modernBathroomFloatingWoodVanity from "@/assets/gallery/modern-bathroom-floating-wood-vanity.jpeg";
import loftKitchenExposedBrickNaturalWood from "@/assets/gallery/loft-kitchen-exposed-brick-natural-wood.jpeg";
import naturalWoodOpenConceptKitchen from "@/assets/gallery/natural-wood-open-concept-kitchen.jpeg";
import woodKitchenOutdoorAccess from "@/assets/gallery/wood-kitchen-outdoor-access.jpeg";

const heroImages = [
  { src: modernKitchenIslandBarStools, alt: "Modern kitchen island with wood bar stools and marble waterfall edge" },
  { src: luxuryKitchenMarbleDining, alt: "Luxury kitchen with marble island and wood dining table integration" },
  { src: modernBathroomWoodMarble, alt: "Modern bathroom with floating wood cabinets and marble vanity" },
  { src: contemporaryPowderRoomWood, alt: "Contemporary powder room with wood vanity and marble countertop" },
  { src: luxuryMarbleBathroomShower, alt: "Luxury marble bathroom with wood vanity and walk-in glass shower" },
  { src: modernBathroomFloatingWoodVanity, alt: "Modern bathroom with floating wood vanity and marble walk-in shower" },
  { src: loftKitchenExposedBrickNaturalWood, alt: "Loft kitchen with natural wood cabinetry, exposed brick wall, and pendant lighting" },
  { src: naturalWoodOpenConceptKitchen, alt: "Natural wood open concept kitchen with dining area" },
  { src: woodKitchenOutdoorAccess, alt: "Wood kitchen with marble countertops and outdoor patio access" },
];

// Shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Hero = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledImages] = useState(() => shuffleArray(heroImages));
  const [recentIndices, setRecentIndices] = useState<number[]>([0]);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);

  const handleLaunchClick = () => {
    if (isMobile) {
      navigate(ROUTES.ROOM_SCAN);
    } else {
      navigate(ROUTES.VANITY_DESIGNER);
    }
  };

  // Get a random index that hasn't been used recently
  const getNextRandomIndex = () => {
    const availableIndices = shuffledImages
      .map((_, idx) => idx)
      .filter(idx => !recentIndices.includes(idx));
    
    if (availableIndices.length === 0) {
      // If all images have been shown recently, reset but keep current image excluded
      const resetIndices = shuffledImages
        .map((_, idx) => idx)
        .filter(idx => idx !== currentImageIndex);
      return resetIndices[Math.floor(Math.random() * resetIndices.length)];
    }
    
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = getNextRandomIndex();
      setNextImageIndex(nextIdx);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex(nextIdx);
        setRecentIndices(prev => {
          const updated = [...prev, nextIdx];
          // Keep only the last 5 indices
          return updated.slice(-5);
        });
        setIsTransitioning(false);
      }, 2500); // Half of transition time
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval);
  }, [shuffledImages.length, currentImageIndex, recentIndices]);

  const getNextIndex = () => nextImageIndex !== null ? nextImageIndex : (currentImageIndex + 1) % shuffledImages.length;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden touch-pan-y">
      {/* Background Images with Enhanced Crossfade */}
      <div className="absolute inset-0 bg-black select-none">
        {/* Current Image - fades out */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 2500ms ease-in-out',
            zIndex: 1,
          }}
        >
          <img 
            src={shuffledImages[currentImageIndex].src} 
            alt={shuffledImages[currentImageIndex].alt} 
            className="w-full h-full object-cover pointer-events-none" 
            style={{ 
              filter: 'brightness(1.22) contrast(1.1) saturate(1.05) hue-rotate(0deg)',
              willChange: 'opacity'
            }}
            loading="eager"
            decoding="async"
          />
        </div>
        
        {/* Next Image - fades in */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 2500ms ease-in-out',
            zIndex: 2,
          }}
        >
          <img 
            src={shuffledImages[getNextIndex()].src} 
            alt={shuffledImages[getNextIndex()].alt} 
            className="w-full h-full object-cover pointer-events-none" 
            style={{ 
              filter: 'brightness(1.22) contrast(1.1) saturate(1.05) hue-rotate(0deg)',
              willChange: 'opacity'
            }}
            loading="eager"
            decoding="async"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/25" style={{ zIndex: 3 }} />
      </div>
      
      {/* Logo Overlay - Full Size Glass Effect */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <img 
          src={logo} 
          alt="Company Logo" 
          className="pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'grayscale(100%) brightness(2.5) contrast(0.2)',
            opacity: 0.18,
            mixBlendMode: 'overlay'
          }}
          loading="eager"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
          Design Your Dream
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 drop-shadow-lg max-w-2xl mx-auto">
          {isMobile 
            ? "Scan your room with your camera to get started. Design on a larger device later."
            : "Create custom cabinets with our intuitive 3D design tool. See your vision come to life in real-time."
          }
        </p>
        <Button 
          size="lg" 
          onClick={handleLaunchClick}
          className="text-lg px-8 py-6 h-auto bg-green-500/40 hover:bg-green-400/50 border-2 border-green-400/60 backdrop-blur-sm text-white shadow-2xl hover:shadow-green-400/50 transition-all duration-300 hover:scale-105"
        >
          {isMobile ? (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Scan Room
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Launch Designer
            </>
          )}
        </Button>
      </div>
    </section>
  );
};
export default Hero;