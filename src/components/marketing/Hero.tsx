import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Camera } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ROUTES } from "@/constants/routes";
import { HERO_IMAGES } from "@/constants/galleryImages";
import logo from "@/assets/logo.jpg";

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
  const [shuffledImages] = useState(() => shuffleArray(HERO_IMAGES));
  const [recentIndices, setRecentIndices] = useState<number[]>([0]);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

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
          {/* Loading skeleton with brand colors - visible until image loads */}
          {!loadedImages.has(currentImageIndex) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-[#2dd4bf]/10 to-gray-200 animate-pulse z-10" />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2dd4bf]/20 to-transparent z-20"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              />
            </>
          )}
          
          <img 
            src={shuffledImages[currentImageIndex].path} 
            alt={shuffledImages[currentImageIndex].alt} 
            className={`w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${
              loadedImages.has(currentImageIndex) ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              filter: 'brightness(1.1) contrast(1.05)',
            }}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => {
              setLoadedImages(prev => new Set(prev).add(currentImageIndex));
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20" />
        </div>
      </section>
    </>
  );
};
export default Hero;