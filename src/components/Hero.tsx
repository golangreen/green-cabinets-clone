import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const [shuffledImages] = useState(() => shuffleArray(heroImages));
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
        setIsTransitioning(false);
      }, 1000); // Duration of fade out
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [shuffledImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Crossfade */}
      <div className="absolute inset-0">
        {shuffledImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={image.src} 
              alt={image.alt} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-32 text-center">
        
      </div>
    </section>
  );
};
export default Hero;