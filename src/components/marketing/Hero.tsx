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
    <>
      {/* Hero Text Section - Above Images */}
      <section className="relative bg-gray-50 pt-36 md:pt-44 pb-12 md:pb-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-gray-900 mb-6 leading-tight drop-shadow-2xl opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            Transform Your Space
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light drop-shadow-lg mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            Premium custom cabinetry for kitchens, bathrooms, and closets
          </p>
          <Button
            onClick={handleLaunchClick}
            size="lg"
            variant="hero"
            className="bg-brand-teal/20 hover:bg-brand-teal/40 text-gray-900 border border-brand-teal/60 hover:border-brand-teal shadow-2xl hover:shadow-brand-teal/50 transition-all duration-300 hover:scale-105 text-lg px-8 py-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            {isMobile ? (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Scan Your Room
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

      {/* Hero Images Section - Single Image */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 select-none">
          <img 
            src={shuffledImages[currentImageIndex].src} 
            alt={shuffledImages[currentImageIndex].alt} 
            className="w-full h-full object-cover pointer-events-none" 
            style={{ 
              filter: 'brightness(1.1) contrast(1.05)',
            }}
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20" />
        </div>
      </section>
    </>
  );
};
export default Hero;