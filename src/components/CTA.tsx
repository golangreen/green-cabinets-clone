import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteForm from "@/components/QuoteForm";

const CTA = () => {
  const [contactMethod, setContactMethod] = useState<"email" | "text">("email");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const handleConsultation = () => {
    if (contactMethod === "email") {
      window.location.href = 'mailto:greencabinets@gmail.com';
    } else {
      window.location.href = 'sms:+17184545480';
    }
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-[image:var(--gradient-soft)] opacity-40" />
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
            All your storage needs,
            <br />
            in one place.
          </h2>
          
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
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
                variant="outline" 
                className="text-lg px-8 py-6 w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
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
