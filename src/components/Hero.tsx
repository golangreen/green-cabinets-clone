import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-kitchen-clean.jpg";
import logo from "@/assets/logo.jpg";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Premium Green Cabinets Kitchen" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-32 text-center">
        
      </div>
    </section>;
};
export default Hero;