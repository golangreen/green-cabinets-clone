import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoMuteToggle from "@/components/VideoMuteToggle";

const STORAGE_KEY = "spring-promo-dismissed";

const SpringPromotion = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  // Pause the video when it scrolls out of view. On iOS, an off-screen
  // playing video keeps decoding on the main thread and stalls scroll
  // events / rAF, which makes the thin progress bar lurch. Pausing it
  // restores smooth scroll tracking once the user moves past the hero.
  useEffect(() => {
    if (isDismissed) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused) {
            video.play().catch(() => { /* autoplay may be blocked */ });
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <section ref={containerRef} className="relative w-full bg-background overflow-hidden">
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
      <div className="relative w-full">
        <video
          ref={videoRef}
          className="w-full h-auto max-h-[80vh] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/spring-promotion.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <VideoMuteToggle videoRef={videoRef} />
      </div>
    </section>
  );
};

export default SpringPromotion;
