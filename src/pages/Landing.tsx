import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteForm } from "@/hooks/useQuoteForm";
import { Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { RECAPTCHA_SITE_KEY } from "@/config/recaptcha";
import logo from "@/assets/logos/logo-color.svg";
import modernKitchenIslandBarStools from "@/assets/gallery/modern-kitchen-island-bar-stools.jpeg";

const Landing = () => {
  const navigate = useNavigate();
  const { submitQuote, isSubmitting } = useQuoteForm();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      return;
    }

    const result = await submitQuote({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      projectType: "landing_page_inquiry",
      recaptchaToken,
    });

    if (result.success) {
      setFormData({ name: "", email: "", phone: "", message: "" });
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <img src={logo} alt="Green Cabinets" className="h-12 sm:h-14" />
          <a 
            href="tel:+19293881830"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            (929) 388-1830
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={modernKitchenIslandBarStools}
            alt="Modern custom kitchen"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Transform Your Home with{" "}
              <span className="text-primary">Premium Custom Cabinets</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              NYC's trusted cabinetry experts since 2009. Get a free quote in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg"
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 w-full sm:w-auto min-w-[200px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Get Free Quote
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/designer')}
                className="border-2 text-lg px-8 py-6 w-full sm:w-auto min-w-[200px] hover:bg-primary/10 transition-all duration-300"
              >
                Try Our Designer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-foreground">
            Why Choose Green Cabinets?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "Custom Design",
                description: "Every project is tailored to your exact specifications and style preferences."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "Premium Materials",
                description: "Top-quality wood and finishes from trusted European and North American suppliers."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "Expert Installation",
                description: "Professional installation by our experienced team ensures perfect results."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "Fast Turnaround",
                description: "Get your quote in 24 hours and completed project within weeks, not months."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "Eco-Friendly",
                description: "Sustainable materials and practices that are better for you and the environment."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
                title: "NYC Based",
                description: "Local NYC company serving homeowners, developers, and architects since 2009."
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote-form" className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Get Your Free Quote
              </h2>
              <p className="text-lg text-muted-foreground">
                Tell us about your project and we'll get back to you within 24 hours
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <Input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Tell us about your project (kitchen, bathroom, closet, etc.) *"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="text-base resize-none"
                />
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  theme="light"
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : "Get My Free Quote"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                We respect your privacy. Your information will never be shared.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Or Contact Us Directly</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <a 
                href="tel:+19293881830"
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Phone className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-foreground">Call Us</div>
                  <div className="text-sm text-muted-foreground">(929) 388-1830</div>
                </div>
              </a>
              <a 
                href="mailto:orders@greencabinetsny.com"
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Mail className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-foreground">Email Us</div>
                  <div className="text-sm text-muted-foreground">orders@greencabinetsny.com</div>
                </div>
              </a>
              <div className="flex flex-col items-center gap-3 p-4">
                <MapPin className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">Visit Us</div>
                  <div className="text-sm text-muted-foreground">New York, NY</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Green Cabinets NYC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
