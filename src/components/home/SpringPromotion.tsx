import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoMuteToggle from "@/components/marketing/VideoMuteToggle";

const STORAGE_KEY = "spring-promo-dismissed";

const SpringPromotion = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
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
        className="absolute top-2 right-2 z-[60] h-11 w-11 rounded-full bg-foreground/70 text-background hover:bg-foreground/85"
        onClick={handleDismiss}
        aria-label="Dismiss promotion"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Video */}
      <div className="relative w-full aspect-[9/16] max-h-[80dvh] bg-muted">
        <img
          src="/spring-promotion-poster.webp"
          alt="Green Cabinets spring promotion kitchen and cabinet installation preview"
          width={720}
          height={1280}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          poster="/spring-promotion-poster.webp"
          preload="metadata"
          onLoadedData={() => setVideoReady(true)}
        >
          <source src="/spring-promotion-optimized.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <VideoMuteToggle videoRef={videoRef} />
      </div>
    </section>
  );
};

export default SpringPromotion;
