import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import logo from "@/assets/logo.jpg";
import walnutTexture from "@/assets/walnut-wood-texture.jpg";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToGallery = (category: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      window.location.hash = `gallery?category=${category}`;
      setTimeout(() => {
        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 50);
  };

  return <header 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border overflow-hidden cursor-pointer" 
      style={{ position: 'relative' }}
      onClick={scrollToTop}
    >
      {/* Black to wood gradient overlay */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(to right, #000000 0%, #000000 15%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 70%)`,
        zIndex: 1
      }} />
      {/* Wood texture background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${walnutTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 1,
        imageRendering: 'crisp-edges',
        zIndex: 0
      }} />
      <nav className="container relative mx-auto px-4 md:px-6 py-3 md:py-4" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Green Cabinets Logo" className="h-16 md:h-20 w-auto" style={{
              mixBlendMode: 'lighten'
            }} />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-display ml-auto mr-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-black hover:text-black/70 transition-colors flex items-center gap-1 outline-none text-xl font-semibold">
                Catalog
                <ChevronDown className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border z-50">
                <DropdownMenuItem 
                  onClick={() => scrollToGallery('kitchens')}
                  className="cursor-pointer"
                >
                  Kitchens
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => scrollToGallery('vanities')}
                  className="cursor-pointer"
                >
                  Vanities
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => scrollToGallery('closets')}
                  className="cursor-pointer"
                >
                  Closets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#solutions" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              Solutions
            </a>
            <a href="#about" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              About
            </a>
            <a href="#contact" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-4 font-display">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] font-display">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mb-2">Catalog</h3>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => scrollToGallery('kitchens')}
                    >
                      Kitchens
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => scrollToGallery('vanities')}
                    >
                      Vanities
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => scrollToGallery('closets')}
                    >
                      Closets
                    </Button>
                  </div>
                  <a 
                    href="#solutions" 
                    className="text-black hover:text-black/70 transition-colors px-2 text-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Solutions
                  </a>
                  <a 
                    href="#about" 
                    className="text-black hover:text-black/70 transition-colors px-2 text-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </a>
                  <a 
                    href="#contact" 
                    className="text-black hover:text-black/70 transition-colors px-2 text-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
              </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>;
};
export default Header;