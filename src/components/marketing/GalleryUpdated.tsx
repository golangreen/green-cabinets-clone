import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GALLERY_IMAGES, getImagesByCategory } from "@/constants/galleryImages";
import type { GalleryCategory } from "@/types/gallery";
import { LazyImage } from "@/features/gallery";

const GalleryUpdated = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const images = getImagesByCategory(activeCategory);
  
  // Calculate category counts
  const categories = {
    kitchens: GALLERY_IMAGES.filter(img => img.category === 'kitchens'),
    vanities: GALLERY_IMAGES.filter(img => img.category === 'vanities'),
    closets: GALLERY_IMAGES.filter(img => img.category === 'closets'),
    'design-to-reality': GALLERY_IMAGES.filter(img => img.category === 'design-to-reality'),
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('category=')) {
        const categoryMatch = hash.match(/category=([^&]*)/);
        if (categoryMatch) {
          const category = categoryMatch[1] as GalleryCategory;
          if (["kitchens", "vanities", "closets", "design-to-reality"].includes(category)) {
            setActiveCategory(category);
          }
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("focus", handleHashChange);
    
    const handleCategoryChange = (e: CustomEvent) => {
      setActiveCategory(e.detail.category);
    };
    window.addEventListener("categoryChange" as any, handleCategoryChange as any);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("focus", handleHashChange);
      window.removeEventListener("categoryChange" as any, handleCategoryChange as any);
    };
  }, []);

  useEffect(() => {
    setLoadedImages(new Set());
  }, [activeCategory, showAllImages]);

  const displayedImages = showAllImages ? images : images.slice(0, 12);

  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + displayedImages.length) % displayedImages.length);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % displayedImages.length);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex !== null) {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setSelectedImageIndex(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, displayedImages.length]);

  const categories_menu = [
    { id: "all" as const, label: "All", count: images.length },
    { id: "kitchens" as const, label: "Kitchens", count: categories.kitchens.length },
    { id: "vanities" as const, label: "Vanities", count: categories.vanities.length },
    { id: "closets" as const, label: "Closets", count: categories.closets.length },
    { id: "design-to-reality" as const, label: "Design to Reality", count: categories['design-to-reality'].length },
  ];

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      id="gallery" 
      className={`py-24 bg-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Our Gallery</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of custom cabinetry and transformations
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories_menu.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowAllImages(false);
              }}
              className="transition-all duration-300 hover:scale-105"
            >
              {cat.label} <span className="ml-2 text-sm opacity-70">({cat.count})</span>
            </Button>
          ))}
        </div>

        {images.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <LazyImage
                    src={image.path}
                    alt={image.alt}
                    className="w-full h-full object-cover aspect-[4/3]"
                    onLoad={() => setLoadedImages(prev => new Set([...prev, index]))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium">{image.alt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showAllImages && images.length > 12 && (
              <div className="text-center mt-12">
                <Button
                  onClick={() => setShowAllImages(true)}
                  variant="outline"
                  size="lg"
                  className="transition-all duration-300 hover:scale-105"
                >
                  Load More ({images.length - 12} more)
                </Button>
              </div>
            )}
          </>
        )}

        <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
          <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-none">
            <div className="relative w-full h-[80vh]">
              {selectedImageIndex !== null && displayedImages[selectedImageIndex] && (
                <>
              <img
                src={displayedImages[selectedImageIndex].path}
                alt={displayedImages[selectedImageIndex].alt}
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                    onClick={() => setSelectedImageIndex(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                    {selectedImageIndex + 1} / {displayedImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default GalleryUpdated;
