import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Camera } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ROUTES } from "@/constants/routes";
import { useHeroImages } from "@/features/gallery";
import logo from "@/assets/logo.jpg";

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const HeroUpdated = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const { data: heroImages = [], isLoading } = useHeroImages();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledImages, setShuffledImages] = useState<typeof heroImages>([]);
  const [recentIndices, setRecentIndices] = useState<number[]>([0]);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (heroImages.length > 0 && shuffledImages.length === 0) {
      setShuffledImages(shuffleArray(heroImages));
    }
  }, [heroImages]);

  const handleLaunchClick = () => {
    if (isMobile) {
      navigate(ROUTES.ROOM_SCAN);
    } else {
      navigate(ROUTES.VANITY_DESIGNER);
    }
  };

  const getNextRandomIndex = () => {
    if (shuffledImages.length === 0) return 0;
    
    const availableIndices = shuffledImages
      .map((_, idx) => idx)
      .filter(idx => !recentIndices.includes(idx));
    
    if (availableIndices.length === 0) {
      const resetIndices = shuffledImages
        .map((_, idx) => idx)
        .filter(idx => idx !== currentImageIndex);
      return resetIndices[Math.floor(Math.random() * resetIndices.length)];
    }
    
    return availableIndices[Math.floor(Math.random() * availableIndices.length)];
  };

  useEffect(() => {
    if (shuffledImages.length === 0) return;

    const interval = setInterval(() => {
      const nextIdx = getNextRandomIndex();
      setNextImageIndex(nextIdx);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex(nextIdx);
        setRecentIndices(prev => {
          const updated = [...prev, nextIdx];
          return updated.slice(-5);
        });
        setIsTransitioning(false);
      }, 2500);
    }, 7000);

    return () => clearInterval(interval);
  }, [shuffledImages.length, currentImageIndex, recentIndices]);

  const getNextIndex = () => nextImageIndex !== null ? nextImageIndex : (currentImageIndex + 1) % shuffledImages.length;

  if (isLoading || shuffledImages.length === 0) {
    return (
      <section className="relative bg-gray-50 pt-36 md:pt-44 pb-12 md:pb-16">
        <div className="container mx-auto px-6 text-center">
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  return (
    <>
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
                Scan Your Space
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

      <section className="relative bg-gray-900 overflow-hidden" style={{ height: isMobile ? '50vh' : '70vh' }}>
        <div className="absolute inset-0">
          {shuffledImages[currentImageIndex] && (
            <img
              src={shuffledImages[currentImageIndex].url}
              alt={shuffledImages[currentImageIndex].alt}
              className={`w-full h-full object-cover transition-all duration-[5000ms] ${
                isTransitioning ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              }`}
              onLoad={() => setLoadedImages(prev => new Set([...prev, currentImageIndex]))}
            />
          )}
          {shuffledImages[getNextIndex()] && (
            <img
              src={shuffledImages[getNextIndex()].url}
              alt={shuffledImages[getNextIndex()].alt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: 'none' }}
              onLoad={() => setLoadedImages(prev => new Set([...prev, getNextIndex()]))}
            />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto">
            <div className="max-w-2xl">
              <p className="text-white/90 text-sm md:text-base mb-4 font-light">
                Featured Project
              </p>
              <h2 className="text-2xl md:text-4xl font-serif text-white mb-4 drop-shadow-lg">
                {shuffledImages[currentImageIndex]?.displayName || shuffledImages[currentImageIndex]?.alt}
              </h2>
              <Link to={`${ROUTES.HOME}#gallery`}>
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                >
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <img 
            src={logo} 
            alt="Green Cabinets Logo" 
            className="h-16 md:h-20 w-auto opacity-90 drop-shadow-lg"
          />
        </div>
      </section>
    </>
  );
};

export default HeroUpdated;
