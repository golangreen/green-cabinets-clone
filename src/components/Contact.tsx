import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteForm from "@/components/QuoteForm";
import ObfuscatedPhone from "@/components/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

const Contact = () => {
  const [contactMethod, setContactMethod] = useState<"email" | "text">("email");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const handleContact = () => {
    if (contactMethod === "email") {
      // Decode email client-side to protect from bots
      const encoded = 'b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20='; // Base64 encoded: orders@greencabinetsny.com
      const email = atob(encoded);
      window.location.href = `mailto:${email}`;
    } else {
      // Decode phone number client-side to protect from bots
      const encoded = 'NjQ2NTQ5Mzk1NQ=='; // Base64 encoded: 6465493955
      const phone = atob(encoded);
      window.location.href = `sms:+1${phone}`;
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6">Get in Touch</h2>
          <p className="text-base sm:text-lg text-[#666666] max-w-2xl mx-auto px-4">
            Ready to transform your space? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 px-4">
          {/* Email */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Email Us</h3>
            <ObfuscatedEmail 
              encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20="
              className="text-sm md:text-base text-[#666666] hover:text-[#1a1a1a] transition-colors break-words block"
            />
          </div>

          {/* Phone */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Call Us</h3>
            <ObfuscatedPhone 
              encoded="NzE4ODA0NTQ4OA=="
              className="text-sm md:text-base text-[#666666] hover:text-[#1a1a1a] transition-colors break-words block"
              type="tel"
            />
          </div>

          {/* Address */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-lg md:text-xl font-bold text-[#1a1a1a] mb-3">Visit Us</h3>
            <address className="text-sm md:text-base text-[#666666] not-italic">
              BUSHWICK<br />
              Brooklyn, NY 11206
            </address>
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
          
          <div className="text-center text-[#999999]">or</div>
          
          <Select value={contactMethod} onValueChange={(value: "email" | "text") => setContactMethod(value)}>
            <SelectTrigger className="w-full bg-[#1a1a1a] text-white border-0">
              <SelectValue placeholder="Choose contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="text">Text Message</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            size="lg"
            className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
            onClick={handleContact}
          >
            {contactMethod === "email" ? "Send Email" : "Send Text"}
          </Button>
        </div>
      </div>

      <QuoteForm isOpen={showQuoteForm} onClose={() => setShowQuoteForm(false)} />
    </section>
  );
};

export default Contact;
