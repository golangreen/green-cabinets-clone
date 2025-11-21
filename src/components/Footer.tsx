import logo from "@/assets/logo-new.png";
import { Instagram } from "lucide-react";
import ObfuscatedPhone from "@/components/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Logo and Tagline */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <img src={logo} alt="Green Cabinets Logo" className="h-12 sm:h-16 w-auto" />
            <span className="font-display text-lg sm:text-xl font-bold text-white">Green Cabinets</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400 px-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 max-w-4xl mx-auto">
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#services" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#gallery?category=kitchens" className="hover:text-white transition-colors">Kitchen Cabinets</a></li>
              <li><a href="#gallery?category=vanities" className="hover:text-white transition-colors">Bathroom Vanities</a></li>
              <li><a href="#gallery?category=closets" className="hover:text-white transition-colors">Custom Storage</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Our Solutions</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <ObfuscatedEmail 
                  encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20="
                  className="hover:text-white transition-colors"
                />
              </li>
              <li>
                <ObfuscatedPhone 
                  encoded="NzE4ODA0NTQ4OA=="
                  className="hover:text-white transition-colors"
                  type="tel"
                />
              </li>
              <li>BUSHWICK<br />Brooklyn, NY 11206</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; 2025 Green Cabinets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
