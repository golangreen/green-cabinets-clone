import { useEffect, useState } from "react";
import { isIOS } from "@/utils/capacitor";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const isiOS = isIOS();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 400); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${isiOS ? 'ios-safe-area' : ''}`}
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 0%) 0%, hsl(150 50% 8%) 100%)',
      }}
    >
      {/* iOS-style glow effect */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 30%, hsl(150 60% 25% / 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with iOS-style animation */}
        <div 
          className={`relative mb-12 transition-all duration-700 ${
            logoLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
          style={{
            filter: 'drop-shadow(0 20px 40px hsl(150 60% 40% / 0.4))',
          }}
        >
          <div className="absolute inset-0 animate-pulse" 
            style={{
              background: 'radial-gradient(circle, hsl(150 60% 50% / 0.2) 0%, transparent 70%)',
              transform: 'scale(1.5)',
            }}
          />
          <img 
            src="/logo.png" 
            alt="Green Cabinets" 
            className="relative w-28 h-28 object-contain rounded-3xl ios-rounded-large"
            onLoad={() => setLogoLoaded(true)}
            style={{
              boxShadow: '0 10px 30px hsl(0 0% 0% / 0.5), 0 0 60px hsl(150 60% 40% / 0.3)',
            }}
          />
        </div>

        {/* Brand name with iOS typography */}
        <h1 
          className="text-4xl font-bold mb-3 tracking-tight transition-all duration-700 delay-200"
          style={{
            color: 'hsl(0 0% 98%)',
            textShadow: '0 2px 20px hsl(150 60% 40% / 0.5)',
            opacity: logoLoaded ? 1 : 0,
            transform: logoLoaded ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          Green Cabinets
        </h1>

        {/* Tagline */}
        <p 
          className="text-base mb-16 transition-all duration-700 delay-300"
          style={{
            color: 'hsl(0 0% 70%)',
            opacity: logoLoaded ? 1 : 0,
            transform: logoLoaded ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          Professional Cabinet Design
        </p>

        {/* iOS-style loading indicator */}
        <div className="flex items-center gap-2">
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: 'hsl(150 60% 50%)',
              animationDelay: '0s',
              boxShadow: '0 0 10px hsl(150 60% 50% / 0.8)',
            }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: 'hsl(150 60% 50%)',
              animationDelay: '0.15s',
              boxShadow: '0 0 10px hsl(150 60% 50% / 0.8)',
            }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: 'hsl(150 60% 50%)',
              animationDelay: '0.3s',
              boxShadow: '0 0 10px hsl(150 60% 50% / 0.8)',
            }}
          />
        </div>
      </div>

      {/* iOS home indicator spacing */}
      {isiOS && <div className="ios-home-indicator-spacing" />}
    </div>
  );
};

export default SplashScreen;
