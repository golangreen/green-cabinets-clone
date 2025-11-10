import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="animate-scale-in">
        <img 
          src={logo} 
          alt="Kitchen Designer Pro" 
          className="w-32 h-32 object-contain mb-8 rounded-xl shadow-2xl"
        />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in">
        Kitchen Designer Pro
      </h1>
      
      <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Professional Cabinet Design
      </p>
      
      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default SplashScreen;
