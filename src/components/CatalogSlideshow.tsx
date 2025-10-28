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
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicNodesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDirection(slideDirections[Math.floor(Math.random() * slideDirections.length)]);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      // Clean up all audio nodes
      musicNodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {
          // Already stopped
        }
      });
      musicNodesRef.current = [];
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isOpen, images.length]);

  const toggleMute = () => {
    if (isMuted) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        // Create a beautiful ambient soundscape with actual musical harmony
        // Using soft pad sounds with gentle chord progressions
        
        // Soft pad chords - C major (C, E, G) and A minor (A, C, E)
        const chordProgression = [
          [261.63, 329.63, 392.00], // C major (C4, E4, G4)
          [220.00, 261.63, 329.63], // A minor (A3, C4, E4)
          [293.66, 369.99, 440.00], // D minor (D4, F4, A4)
          [246.94, 293.66, 369.99], // G major (G3, D4, F4)
        ];
        
        let chordIndex = 0;
        
        const playChord = () => {
          if (!isMuted || !ctx) return;
          
          const chord = chordProgression[chordIndex];
          chordIndex = (chordIndex + 1) % chordProgression.length;
          
          chord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 7);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 8);
            
            musicNodesRef.current.push(osc);
          });
          
          setTimeout(playChord, 8000);
        };
        
        playChord();
        
        setIsMuted(false);
        console.log("✅ Calm ambient music playing");
      } catch (error) {
        console.error("❌ Error:", error);
        alert(`Could not create audio: ${error}`);
      }
    } else {
      musicNodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
        } catch (e) {
          // Already stopped
        }
      });
      musicNodesRef.current = [];
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
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
