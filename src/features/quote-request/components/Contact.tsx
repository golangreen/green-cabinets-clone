import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuoteForm from "./QuoteForm";

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
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-gray-900">Get in Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your space? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Email */}
          <div className="group p-8 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 hover:bg-brand-teal/20 hover:border-brand-teal hover:shadow-2xl hover:shadow-brand-teal/50 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-brand-teal/20 flex items-center justify-center mb-6 group-hover:bg-brand-teal/30 transition-colors">
              <Mail className="w-8 h-8 text-brand-teal" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Email Us</h3>
            <a 
              href="mailto:greencabinets@gmail.com"
              className="text-gray-600 hover:text-brand-teal transition-colors"
            >
              greencabinets@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="group p-8 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 hover:bg-brand-teal/20 hover:border-brand-teal hover:shadow-2xl hover:shadow-brand-teal/50 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-brand-teal/20 flex items-center justify-center mb-6 group-hover:bg-brand-teal/30 transition-colors">
              <Phone className="w-8 h-8 text-brand-teal" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Call Us</h3>
            <a 
              href="tel:+17188045488"
              className="text-gray-600 hover:text-brand-teal transition-colors"
            >
              (718) 804-5488
            </a>
          </div>

          {/* Address */}
          <div className="group p-8 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 hover:bg-brand-teal/20 hover:border-brand-teal hover:shadow-2xl hover:shadow-brand-teal/50 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-brand-teal/20 flex items-center justify-center mb-6 group-hover:bg-brand-teal/30 transition-colors">
              <MapPin className="w-8 h-8 text-brand-teal" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Visit Us</h3>
            <address className="text-gray-600 not-italic">
              BUSHWICK<br />
              Brooklyn, NY 11206
            </address>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12">
          <p className="text-lg text-foreground font-semibold">
            Contact Us:
          </p>
        </div>

        {/* Contact Method Selector & CTA */}
        <div className="flex flex-col items-center justify-center gap-4 mt-12 max-w-md mx-auto">
          <Button 
            size="lg"
            variant="hero"
            className="w-full"
            onClick={() => setShowQuoteForm(true)}
          >
            Get Detailed Quote
          </Button>
          
          <div className="text-center text-muted-foreground">or</div>
          
          <Select value={contactMethod} onValueChange={(value: "email" | "text") => setContactMethod(value)}>
            <SelectTrigger className="w-full">
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
            className="w-full"
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
