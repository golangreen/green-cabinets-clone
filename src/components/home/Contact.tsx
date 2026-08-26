import { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteForm from "@/components/marketing/QuoteForm";
import ObfuscatedPhone from "@/components/privacy/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/privacy/ObfuscatedEmail";
import ContactGateDialog from "@/components/privacy/ContactGateDialog";
import { useContactUnlock } from "@/components/privacy/contactUnlock";

const Contact = () => {
  const [contactMethod, setContactMethod] = useState<string>("email-golan");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const { unlocked } = useContactUnlock();

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setIsNight(h >= 22 || h < 6 || prefersDark);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  const contactOptions = {
    "email-golan": { href: `mailto:${atob('b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20=')}`, label: "Email Us" },
    "text-golan": { href: `sms:+1${atob('NzE4ODA0NTQ4OA==')}`, label: "Text Golan" },
  };

  const openContact = () => {
    const option = contactOptions[contactMethod as keyof typeof contactOptions];
    if (option) {
      window.location.href = option.href;
    }
  };

  const handleContact = () => {
    if (!unlocked) {
      setGateOpen(true);
      return;
    }
    openContact();
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6">Get in Touch</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Ready to transform your space? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 px-4">
          {/* Email */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#5C7650]/10">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Email Us</h3>
            <ObfuscatedEmail 
              encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20="
              className="text-sm md:text-base text-muted-foreground hover:text-[#1a1a1a] transition-colors break-words block"
            />
          </div>

          {/* Phone */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#5C7650]/10">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Call Us</h3>
            <div className="flex gap-1 items-center">
              <span className="text-sm md:text-base text-muted-foreground">Golan Achdary:</span>
              <ObfuscatedPhone 
                encoded="NzE4ODA0NTQ4OA=="
                className="text-sm md:text-base text-muted-foreground hover:text-[#1a1a1a] transition-colors"
                type="tel"
              />
            </div>
          </div>

          {/* Service area */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#5C7650]/10">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Service Area</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Brooklyn, Manhattan &amp; Queens
              <br />
              By appointment only
            </p>
          </div>
        </div>

        {/* By-appointment note */}
        <div className="max-w-5xl mx-auto mb-12 px-4">
          <div className="p-4 sm:p-5 rounded-xl bg-[#5C7650]/5 border border-[#5C7650]/10">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm md:text-base text-muted-foreground">
                <p className="font-semibold text-[#1a1a1a] mb-1">
                  We come to you
                </p>
                <p>
                  Green Cabinets NY is an appointment-based custom cabinetry
                  service — there is no walk-in location. We bring finish and
                  door samples to your home for measuring and selection anywhere
                  in Brooklyn, Manhattan, or Queens, then handle delivery and
                  installation on site.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
          <Button 
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => setShowQuoteForm(true)}
          >
            Get Detailed Quote
          </Button>
          
          <div className="text-center text-muted-foreground">or</div>
          
          <Select value={contactMethod} onValueChange={(value: string) => setContactMethod(value)}>
            <SelectTrigger aria-label="Choose contact method" className="w-full bg-[#1a1a1a] text-white border-0">
              <SelectValue placeholder="Choose contact method" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="email-golan">Email Us</SelectItem>
              <SelectItem value="text-golan">Text Golan</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            size="lg"
            className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
            onClick={handleContact}
          >
            {contactOptions[contactMethod as keyof typeof contactOptions]?.label || "Contact Us"}
          </Button>
        </div>
      </div>

      <QuoteForm isOpen={showQuoteForm} onClose={() => setShowQuoteForm(false)} />
      <ContactGateDialog open={gateOpen} onOpenChange={setGateOpen} onVerified={openContact} />
    </section>
  );
};

export default Contact;
