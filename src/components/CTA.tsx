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
      // Decode phone number client-side to protect from bots
      const encoded = 'NjQ2NTQ5Mzk1NQ=='; // Base64 encoded: 6465493955
      const phone = atob(encoded);
      window.location.href = `sms:+1${phone}`;
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0a0a]">
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">
            All your storage needs,
            <br />
            in one place.
          </h2>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of happy homeowners who transformed their spaces with Green Cabinets.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6 pt-8 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 w-full bg-primary hover:bg-primary/90 text-white border-2 border-primary"
              onClick={() => setShowQuoteForm(true)}
            >
              Get Your Free Quote
            </Button>
            
            <div className="w-full space-y-3">
              <Select value={contactMethod} onValueChange={(value: "email" | "text") => setContactMethod(value)}>
                <SelectTrigger className="w-full border-gray-700 text-white bg-[#1a1a1a]">
                  <SelectValue placeholder="Choose contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 w-full bg-primary hover:bg-primary/90 text-white border-2 border-primary"
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
