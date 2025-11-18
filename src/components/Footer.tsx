import logo from "@/assets/logo-new.png";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Green Cabinets Logo" className="h-10 w-auto" />
              <span className="font-display text-xl font-bold text-foreground">Green Cabinets</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium custom cabinetry for modern living.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/green_cabinets_" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#services" className="hover:text-foreground transition-colors">Our Services</a></li>
              <li><a href="#gallery?category=kitchens" className="hover:text-foreground transition-colors">Kitchen Cabinets</a></li>
              <li><a href="#gallery?category=vanities" className="hover:text-foreground transition-colors">Bathroom Vanities</a></li>
              <li><a href="#gallery?category=closets" className="hover:text-foreground transition-colors">Custom Storage</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#solutions" className="hover:text-foreground transition-colors">Our Solutions</a></li>
              <li><a href="#gallery" className="hover:text-foreground transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:greencabinets@gmail.com" className="hover:text-foreground transition-colors">
                  greencabinets@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+17188045488" className="hover:text-foreground transition-colors">
                  (718) 804-5488
                </a>
              </li>
              <li>BUSHWICK<br />Brooklyn, NY 11206</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Green Cabinets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
