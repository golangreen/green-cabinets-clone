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
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDirection(slideDirections[Math.floor(Math.random() * slideDirections.length)]);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      // Clean up audio context when closing
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isOpen, images.length]);

  const toggleMute = () => {
    if (isMuted) {
      try {
        // Create audio context and generate calming ambient sound
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Create a gentle, nature-like ambient sound using white noise
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate filtered white noise (sounds like gentle wind/water)
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.1; // Gentle white noise
        }
        
        // Create and configure source
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.15;
        gainNodeRef.current = gainNode;
        
        // Create a low-pass filter for softer, nature-like sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Makes it sound more like gentle water/wind
        
        // Connect nodes
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start playing
        source.start(0);
        oscillatorRef.current = source as any;
        
        setIsMuted(false);
        console.log("✅ Audio playing successfully");
      } catch (error) {
        console.error("❌ Error creating audio:", error);
        alert(`Could not create audio: ${error}`);
      }
    } else {
      // Stop audio
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current = null;
        } catch (e) {
          console.error("Error stopping audio:", e);
        }
      }
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
