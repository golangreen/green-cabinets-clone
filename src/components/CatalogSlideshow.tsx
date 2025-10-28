import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}

const slideDirections = [
  "translate-x-full",
  "-translate-x-full",
  "translate-y-full",
  "-translate-y-full",
  "translate-x-full translate-y-full",
  "-translate-x-full -translate-y-full",
  "translate-x-full -translate-y-full",
  "-translate-x-full translate-y-full",
];

export const CatalogSlideshow = ({ isOpen, onClose, images }: CatalogSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(slideDirections[0]);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize nature ambiance audio
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Using reliable public domain nature sound
      audioRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
      audioRef.current.preload = "auto";
      
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log("✅ Audio loaded and ready to play");
      });
      
      audioRef.current.addEventListener('playing', () => {
        console.log("✅ Audio is now playing");
      });
      
      audioRef.current.addEventListener('loadeddata', () => {
        console.log("✅ Audio data loaded");
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("❌ Audio error:", audioRef.current?.error);
      });
    }

    // Don't autoplay - wait for user interaction
    if (!isMuted) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play error:", error);
      });
    }

    const interval = setInterval(() => {
      setDirection(slideDirections[Math.floor(Math.random() * slideDirections.length)]);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isOpen, images.length, isMuted]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      // Reload audio element to ensure fresh start
      audioRef.current.load();
      
      // Wait a moment for load, then play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              console.log("Audio playing successfully at volume:", audioRef.current?.volume);
              setIsMuted(false);
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
              // Show user-friendly message
              const message = `Audio playback failed. Error: ${error.message}. Please check your device volume and browser audio permissions.`;
              alert(message);
            });
        }
      }, 100);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsMuted(true);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-muted/95">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full"
          size="icon"
          variant="secondary"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={toggleMute}
          className="absolute top-4 right-20 z-50 rounded-full"
          size="icon"
          variant="secondary"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        
        <div className="relative w-full h-[80vh] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              key={currentIndex}
              className={`absolute inset-0 transition-transform duration-[2000ms] ease-in-out ${direction}`}
              style={{
                animation: "slideIn 2s ease-in-out forwards",
              }}
            >
              <img
                src={images[currentIndex]}
                alt={`Catalog ${currentIndex + 1}`}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            0% {
              opacity: 0;
            }
            10% {
              opacity: 1;
              transform: translate(0, 0) scale(0.95);
            }
            90% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(0, 0) scale(1.05);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
