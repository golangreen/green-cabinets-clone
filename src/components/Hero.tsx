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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              View Catalog
            </Button>
          </div>
          
          <div className="pt-12 text-primary-foreground/80 text-sm animate-in fade-in duration-1000 delay-500">
            Scroll to explore
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;