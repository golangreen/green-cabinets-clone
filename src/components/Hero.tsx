import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-kitchen.jpg";
import logo from "@/assets/logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-90" />
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Premium Green Cabinets Kitchen"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {/* Logo as Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-25">
        <img 
          src={logo} 
          alt=""
          className="w-[70%] max-w-4xl h-auto"
          style={{ mixBlendMode: 'lighten' }}
        />
      </div>
      
      {/* Decorative Circle */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold text-primary-foreground leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            One solution
            <br />
            for all spaces
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Transform your home with premium custom cabinetry.
          </p>
          
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
    </section>
  );
};

export default Hero;
