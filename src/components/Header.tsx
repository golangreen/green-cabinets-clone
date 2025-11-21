import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logoColor from "@/assets/logos/logo-color.png";
import logoBlack from "@/assets/logos/logo-black.png";
import { CartDrawer } from "@/components/CartDrawer";
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToGallery = (category: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const categoryEvent = new CustomEvent('categoryChange', {
      detail: {
        category
      }
    });
    window.dispatchEvent(categoryEvent);
    window.history.replaceState(null, '', `#gallery?category=${category}`);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 50);
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
    }, 400);
  };
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-in-out ${scrolled ? 'bg-white border-b border-gray-200' : 'bg-[#0a0a0a] border-b border-gray-800'}`}>
      <nav className="container mx-auto px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-between relative">
          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500">
            <a href="/" onClick={e => {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }} className="cursor-pointer flex flex-col items-center">
              <div className="relative h-16 sm:h-20 md:h-24 w-auto">
                <img 
                  src={logoColor} 
                  alt="Green Cabinets Logo" 
                  className={`h-16 sm:h-20 md:h-24 w-auto transition-opacity duration-200 ${scrolled ? 'opacity-0' : 'opacity-100'}`}
                />
                <img 
                  src={logoBlack} 
                  alt="Green Cabinets Logo" 
                  className={`absolute top-0 left-0 h-16 sm:h-20 md:h-24 w-auto transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>
              
            </a>
          </div>

          {/* Right Side - Hamburger Menu */}
          <div className="ml-auto flex items-center gap-2">
            <CartDrawer />
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`transition-colors duration-500 ${scrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`} aria-label="Open menu">
                  <Menu className={`h-6 w-6 transition-colors duration-500 ${scrolled ? 'text-foreground' : 'text-white'}`} />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-[300px] sm:w-[400px] font-display">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-muted-foreground">GALLERY</h3>
                    <div className="flex flex-col gap-3">
                      <button onClick={e => scrollToGallery('kitchens', e)} className="text-left text-xl hover:text-primary transition-colors">
                        Kitchens
                      </button>
                      <button onClick={e => scrollToGallery('vanities', e)} className="text-left text-xl hover:text-primary transition-colors">
                        Vanities
                      </button>
                      <button onClick={e => scrollToGallery('closets', e)} className="text-left text-xl hover:text-primary transition-colors">
                        Closets
                      </button>
                      <button onClick={e => scrollToGallery('design-to-reality', e)} className="text-left text-xl hover:text-primary transition-colors">
                        Design to Reality
                      </button>
                      <button onClick={e => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        const suppliers = document.getElementById('suppliers');
                        if (suppliers) {
                          suppliers.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }
                      }, 100);
                    }} className="text-left text-xl hover:text-primary transition-colors">
                        Suppliers
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <a href="#services" className="block text-xl hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Services
                    </a>
                    <a href="#solutions" className="block text-xl hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Solutions
                    </a>
                    <a href="#about" className="block text-xl hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      About
                    </a>
                    <a href="#contact" className="block text-xl hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                      Contact
                    </a>
                  </div>

                  <div className="border-t pt-4">
                    <Button size="lg" className="w-full" onClick={() => {
                    setIsMobileMenuOpen(false);
                    const ctaSection = document.querySelector('section[class*="py-24"]');
                    if (ctaSection) {
                      ctaSection.scrollIntoView({
                        behavior: 'smooth'
                      });
                      setTimeout(() => {
                        const button = ctaSection.querySelector('button') as HTMLButtonElement;
                        button?.click();
                      }, 500);
                    }
                  }}>
                      Get Quote
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>;
};
export default Header;