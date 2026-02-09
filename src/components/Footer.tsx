import logo from "@/assets/logo-new.png";
import { Instagram } from "lucide-react";
import ObfuscatedPhone from "@/components/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";

const Footer = () => {
  const scrollToGallery = (category: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    const categoryEvent = new CustomEvent('categoryChange', {
      detail: { category }
    });
    window.dispatchEvent(categoryEvent);
    window.history.replaceState(null, '', `#gallery?category=${category}`);
    
    setTimeout(() => {
      const gallery = document.getElementById('gallery');
      if (gallery) {
        const rect = gallery.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 80;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800 py-16 sm:py-20 md:py-28 lg:py-32">
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
              <li>
                <button 
                  onClick={(e) => scrollToGallery('kitchens', e)} 
                  className="hover:text-white transition-colors text-left"
                >
                  Kitchen Cabinets
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => scrollToGallery('vanities', e)} 
                  className="hover:text-white transition-colors text-left"
                >
                  Bathroom Vanities
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => scrollToGallery('closets', e)} 
                  className="hover:text-white transition-colors text-left"
                >
                  Custom Storage
                </button>
              </li>
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
              <li className="flex gap-1">
                <span>Golan Achdary:</span>
                <ObfuscatedPhone 
                  encoded="NzE4ODA0NTQ4OA=="
                  className="hover:text-white transition-colors"
                  type="tel"
                />
              </li>
              <li className="flex gap-1">
                <span>Andy Lopez:</span>
                <ObfuscatedPhone 
                  encoded="OTE3ODE5NTUzOA=="
                  className="hover:text-white transition-colors"
                  type="tel"
                />
              </li>
              <li>
                <address className="not-italic">
                  10 Montieth St<br />
                  Bushwick, Brooklyn, NY 11206
                </address>
              </li>
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
