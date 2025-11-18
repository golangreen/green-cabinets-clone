import logo from "@/assets/logo-new.png";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        {/* Logo and Tagline */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="Green Cabinets Logo" className="h-12 w-auto" />
            <span className="font-display text-xl font-bold text-white">Green Cabinets</span>
          </div>
          <p className="text-gray-400">
            Premium custom cabinetry for modern living.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://instagram.com/green_cabinets_" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#gallery?category=kitchens" className="hover:text-white transition-colors">Kitchen Cabinets</a></li>
              <li><a href="#gallery?category=vanities" className="hover:text-white transition-colors">Bathroom Vanities</a></li>
              <li><a href="#gallery?category=closets" className="hover:text-white transition-colors">Custom Storage</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Our Solutions</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:greencabinets@gmail.com" className="hover:text-white transition-colors">
                  greencabinets@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+17188045488" className="hover:text-white transition-colors">
                  (718) 804-5488
                </a>
              </li>
              <li>BUSHWICK<br />Brooklyn, NY 11206</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; 2025 Green Cabinets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
