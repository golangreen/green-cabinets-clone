import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuoteForm } from "@/features/quote-request";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CTA = () => {
  const [contactMethod, setContactMethod] = useState<"email" | "text">("email");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  const handleConsultation = () => {
    if (contactMethod === "email") {
      window.location.href = 'mailto:greencabinets@gmail.com';
    } else {
      window.location.href = 'sms:+16465493955';
    }
  };

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-32 relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-[image:var(--gradient-soft)] opacity-40" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-6xl font-serif text-white leading-tight drop-shadow-2xl">
            All your storage needs,
            <br />
            in one place.
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
            Join thousands of happy homeowners who transformed their spaces with Green Cabinets.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 pt-8 max-w-md mx-auto">
          <Button 
            size="lg" 
            variant="hero" 
            className="text-lg px-8 py-6 w-full"
            onClick={() => setShowQuoteForm(true)}
          >
              Get Your Free Quote
            </Button>
            
            <div className="w-full space-y-3">
              <Select value={contactMethod} onValueChange={(value: "email" | "text") => setContactMethod(value)}>
                <SelectTrigger className="w-full border-primary-foreground/30 text-primary-foreground bg-primary-foreground/5">
                  <SelectValue placeholder="Choose contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="lg" 
                variant="hero" 
                className="text-lg px-8 py-6 w-full"
                onClick={handleConsultation}
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <QuoteForm isOpen={showQuoteForm} onClose={() => setShowQuoteForm(false)} />
    </section>
  );
};

export default CTA;
