import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteForm from "@/components/QuoteForm";

const Contact = () => {
  const [contactMethod, setContactMethod] = useState<"email" | "text">("email");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const handleContact = () => {
    if (contactMethod === "email") {
      window.location.href = 'mailto:greencabinets@gmail.com';
    } else {
      window.location.href = 'sms:+16465493955';
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-bold text-[#1a1a1a] mb-6">Get in Touch</h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Ready to transform your space? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {/* Email */}
          <div className="p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-3">Email Us</h3>
            <a 
              href="mailto:greencabinets@gmail.com"
              className="text-[#666666] hover:text-[#1a1a1a] transition-colors"
            >
              greencabinets@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-3">Call Us</h3>
            <a 
              href="tel:+17188045488"
              className="text-[#666666] hover:text-[#1a1a1a] transition-colors"
            >
              (718) 804-5488
            </a>
          </div>

          {/* Address */}
          <div className="p-8 rounded-2xl bg-[#c5f3f0]">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-3">Visit Us</h3>
            <address className="text-[#666666] not-italic">
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
