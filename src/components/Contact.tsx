import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your space? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Email */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-poppins text-xl font-bold text-foreground mb-3">Email Us</h3>
            <a 
              href="mailto:greencabinets@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              greencabinets@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-poppins text-xl font-bold text-foreground mb-3">Call Us</h3>
            <a 
              href="tel:+16465493955"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              646-549-3955
            </a>
          </div>

          {/* Address */}
          <div className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-poppins text-xl font-bold text-foreground mb-3">Visit Us</h3>
            <address className="text-muted-foreground not-italic">
              10 Montieth St<br />
              Brooklyn, NY 11206
            </address>
          </div>
        </div>

        {/* Owner Info */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            Contact: <span className="text-foreground font-semibold">Golan Achdary</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          <Button 
            size="lg"
            onClick={() => window.location.href = 'mailto:greencabinets@gmail.com'}
          >
            Send Email
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = 'tel:+16465493955'}
          >
            Call Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
