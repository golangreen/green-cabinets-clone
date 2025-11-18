import { useState, useEffect } from "react";
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
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
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
  );
};
export default Hero;