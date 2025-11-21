import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledImages] = useState(() => shuffleArray(heroImages));
  const [recentIndices, setRecentIndices] = useState<number[]>([0]);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);

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
      {/* Hero Text Section */}
      <section className="bg-background py-16 sm:py-24 md:py-36">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-6 text-foreground">
            Transform Your Space
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
            Premium custom cabinetry for kitchens, bathrooms, and closets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-start">
            <div className="flex flex-col items-center gap-2">
              <Button 
                size="lg"
                onClick={() => navigate('/designer')}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white border-2 border-[#0d9488] hover:border-[#0f766e] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              >
                Launch Designer
              </Button>
              <p className="text-sm text-[#2dd4bf]">* temporary under construction</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button 
                size="lg"
                onClick={() => navigate('/shop')}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white border-2 border-[#0d9488] hover:border-[#0f766e] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              >
                Shop
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Carousel */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background images with crossfade */}
        <div className="absolute inset-0">
          <img
            src={shuffledImages[currentImageIndex].src}
            alt={shuffledImages[currentImageIndex].alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[5000ms] ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            loading="eager"
            fetchPriority="high"
          />
          <img
            src={shuffledImages[getNextIndex()].src}
            alt={shuffledImages[getNextIndex()].alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[5000ms] ${
              isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </section>
    </>
  );
};
export default Hero;