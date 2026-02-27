import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import springPromoVideo from "@/assets/spring-promotion.mp4";

const STORAGE_KEY = "spring-promo-dismissed";

const SpringPromotion = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-[60] bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
        onClick={handleDismiss}
        aria-label="Dismiss promotion"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Video */}
      <div className="w-full">
        <video
          className="w-full h-auto max-h-[80vh] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={springPromoVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default SpringPromotion;
