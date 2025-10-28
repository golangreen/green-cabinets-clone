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
  const soundSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDirection(slideDirections[Math.floor(Math.random() * slideDirections.length)]);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      // Clean up all audio sources when closing
      soundSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      soundSourcesRef.current = [];
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isOpen, images.length]);

  const createBirdChirp = (audioContext: AudioContext, time: number, frequency: number) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    // Use sine wave for more natural bird-like sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, time);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, time + 0.1);
    
    // Quick fade in and out like a chirp
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(time);
    osc.stop(time + 0.3);
    
    return osc;
  };

  const scheduleRandomChirps = (audioContext: AudioContext) => {
    const currentTime = audioContext.currentTime;
    
    // Schedule multiple chirps at random intervals
    const birdFrequencies = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200];
    
    for (let i = 0; i < 8; i++) {
      const time = currentTime + Math.random() * 3;
      const freq = birdFrequencies[Math.floor(Math.random() * birdFrequencies.length)];
      createBirdChirp(audioContext, time, freq);
    }
    
    // Continue scheduling chirps
    setTimeout(() => {
      if (!isMuted && audioContextRef.current) {
        scheduleRandomChirps(audioContext);
      }
    }, 2500);
  };

  const toggleMute = () => {
    if (isMuted) {
      try {
        // Create audio context for lively nature sounds
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Add gentle background ambiance
        const bufferSize = audioContext.sampleRate * 3;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Very gentle pink noise background
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.03;
          b6 = white * 0.115926;
        }
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start(0);
        soundSourcesRef.current.push(source);
        
        // Start scheduling bird chirps
        scheduleRandomChirps(audioContext);
        
        setIsMuted(false);
        console.log("✅ Lively nature sounds playing");
      } catch (error) {
        console.error("❌ Error creating audio:", error);
        alert(`Could not create audio: ${error}`);
      }
    } else {
      // Stop all audio sources
      soundSourcesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      soundSourcesRef.current = [];
      
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
