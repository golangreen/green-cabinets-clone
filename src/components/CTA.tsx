import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-[image:var(--gradient-soft)] opacity-40" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-poppins text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
            All your storage needs,
            <br />
            in one place.
          </h2>
          
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of happy homeowners who transformed their spaces with Green Cabinets.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6">
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
