import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GALLERY_IMAGES, getImagesByCategory } from "@/constants/galleryImages";
import type { GalleryCategory } from "@/types/gallery";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all");
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      // Handle both #gallery?category=X and direct category changes
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

    // Check on mount
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    // Also check when window gains focus (helps with iOS)
    window.addEventListener("focus", handleHashChange);
    
    // Listen for custom category change event (for mobile navigation)
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

  // Reset loaded images when category or display changes
  useEffect(() => {
    setLoadedImages(new Set());
  }, [activeCategory, showAllImages]);

  const filteredImages = getImagesByCategory(activeCategory);
  const displayedImages = showAllImages ? filteredImages : filteredImages.slice(0, 12);

  const kitchens = GALLERY_IMAGES.filter(img => img.category === "kitchens");
  const vanities = GALLERY_IMAGES.filter(img => img.category === "vanities");
  const closets = GALLERY_IMAGES.filter(img => img.category === "closets");
  const designToReality = GALLERY_IMAGES.filter(img => img.category === "design-to-reality");

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
          <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">Our Work</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of custom cabinetry and woodwork projects
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <Button
            variant={activeCategory === "kitchens" ? "brand" : "brand-outline"}
            onClick={() => {
              setActiveCategory("kitchens");
              setShowAllImages(false);
            }}
          >
            Kitchens ({kitchens.length})
          </Button>
          <Button
            variant={activeCategory === "vanities" ? "brand" : "brand-outline"}
            onClick={() => {
              setActiveCategory("vanities");
              setShowAllImages(false);
            }}
          >
            Vanities ({vanities.length})
          </Button>
          <Button
            variant={activeCategory === "closets" ? "brand" : "brand-outline"}
            onClick={() => {
              setActiveCategory("closets");
              setShowAllImages(false);
            }}
          >
            Closets ({closets.length})
          </Button>
          <Button
            variant={activeCategory === "design-to-reality" ? "brand" : "brand-outline"}
            onClick={() => {
              setActiveCategory("design-to-reality");
              setShowAllImages(false);
            }}
          >
            Design to Reality ({designToReality.length})
          </Button>
          <Button
            variant={activeCategory === "all" ? "brand" : "brand-outline"}
            onClick={() => {
              setActiveCategory("all");
              setShowAllImages(false);
            }}
          >
            All Projects
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedImages.map((image, index) => {
            const isLoaded = loadedImages.has(index);
            
            return (
              <div 
                key={index}
                className="group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 bg-card cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    {/* Loading skeleton with brand colors - visible until image loads */}
                    {!isLoaded && (
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
                      src={image.path}
                      alt={image.alt}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading={index < 6 ? "eager" : "lazy"}
                      onLoad={() => {
                        setLoadedImages(prev => new Set(prev).add(index));
                      }}
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium">{image.alt}</p>
                  </div>
                </div>
              </div>
              
              {image.products && image.products.length > 0 && (
                <div className="p-4 border-t bg-card">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Materials & Hardware
                  </h4>
                  <div className="space-y-2">
                    {image.products.map((product, prodIndex) => (
                      <div key={prodIndex} className="text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-foreground">{product.supplier}:</span>
                          <span className="text-muted-foreground font-mono">{product.code}</span>
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground ml-2 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>

        {/* Show All / Show Less Button */}
        {filteredImages.length > 4 && (
          <div className="flex justify-center mt-12">
            <Button
              variant="brand-outline"
              size="lg"
              onClick={() => setShowAllImages(!showAllImages)}
              className="min-w-[200px]"
            >
              {showAllImages ? `Show Less` : `View All ${filteredImages.length} Images`}
            </Button>
          </div>
        )}

        {/* Lightbox Modal */}
        <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
            {selectedImageIndex !== null && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Previous Button */}
                {displayedImages.length > 1 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 z-50 p-3 rounded-full bg-brand-teal/20 hover:bg-brand-teal/40 border border-brand-teal/60 hover:border-brand-teal shadow-2xl hover:shadow-brand-teal/50 transition-all duration-300 hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                )}

                {/* Image */}
                <div className="flex flex-col items-center justify-center max-w-full max-h-full p-16">
                  <img
                    src={displayedImages[selectedImageIndex].path}
                    alt={displayedImages[selectedImageIndex].alt}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                  <p className="text-white text-center mt-4 text-sm md:text-base max-w-2xl">
                    {displayedImages[selectedImageIndex].alt}
                  </p>
                  <p className="text-white/60 text-center mt-2 text-xs">
                    {selectedImageIndex + 1} / {displayedImages.length}
                  </p>
                </div>

                {/* Next Button */}
                {displayedImages.length > 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 z-50 p-3 rounded-full bg-brand-teal/20 hover:bg-brand-teal/40 border border-brand-teal/60 hover:border-brand-teal shadow-2xl hover:shadow-brand-teal/50 transition-all duration-300 hover:scale-105"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Gallery;
