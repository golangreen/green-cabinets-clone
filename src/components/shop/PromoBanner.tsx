import { useState } from "react";
import { X, Truck, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#5C7650] to-[#445339] text-white overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Promotional Messages */}
          <div className="flex flex-wrap items-center gap-4 md:gap-8 flex-1">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base font-semibold">
                Save 15% on Kitchen Cabinets
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base font-medium">
                Free Shipping on Orders Over $5,000
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base font-medium">
                New Vanity Collection Available
              </span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
            onClick={() => setIsVisible(false)}
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
