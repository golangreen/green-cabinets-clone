import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Menu, Download, User, LogOut, Shield, Users, FileText, HardDrive, Settings } from "lucide-react";
import logoTeal from "@/assets/logo-teal.svg";
import logoBlack from "@/assets/logo-black.svg";
import walnutTexture from "@/assets/walnut-wood-texture.jpg";
import { CartDrawer } from "@/features/shopping-cart";
import { ThemeToggle } from "@/features/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { InstallPWADialog } from "@/features/pwa";
import { ROUTES } from "@/constants/routes";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isInstallable, promptInstall } = usePWAInstall();
  const { user, isAuthenticated, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowInstallDialog(false);
    }
  };

  const scrollToGallery = (category: string, event?: React.MouseEvent) => {
    // Prevent any default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Immediately dispatch the category change
    const categoryEvent = new CustomEvent('categoryChange', { 
      detail: { category } 
    });
    window.dispatchEvent(categoryEvent);
    
    // Update hash without triggering navigation
    window.history.replaceState(null, '', `#gallery?category=${category}`);
    
    // Close menu after category is set
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 50);
    
    // Scroll with longer delay to ensure rendering completes
    setTimeout(() => {
      const gallery = document.getElementById('gallery');
      if (gallery) {
        // Get fresh position after category change
        const rect = gallery.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 80;
        
        // Force scroll without smooth behavior for iOS reliability
        window.scrollTo({
          top: targetPosition,
          behavior: 'auto'
        });
        
        // Then smooth scroll to the exact position
        setTimeout(() => {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }, 50);
      }
    }, 400);
  };

  return <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border overflow-hidden transition-colors duration-300 ${
      isScrolled ? 'bg-background/95' : 'bg-background'
    }`} style={{
      position: 'relative'
    }}>
      <nav className="container relative mx-auto px-4 md:px-6 py-3 md:py-4" style={{ zIndex: 2 }}>
        <div className="flex items-center justify-between">
          {/* Centered Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer">
              <img 
                src={isScrolled ? logoBlack : logoTeal} 
                alt="Green Cabinets Logo" 
                className="h-16 md:h-20 w-auto transition-all duration-300" 
              />
            </a>
          </div>
          
          {/* Spacer for left side */}
          <div className="flex-1"></div>
          
          {/* Right side utilities */}
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <CartDrawer />
            {/* Hamburger Menu for ALL navigation */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] font-display overflow-y-auto">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Main Navigation */}
                  <div className="flex flex-col gap-4 pb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h3>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          scrollToGallery('kitchens', e);
                        }}
                        className="text-left py-2 hover:text-primary transition-colors font-medium"
                      >
                        Kitchens
                      </button>
                      <button
                        onClick={(e) => {
                          scrollToGallery('vanities', e);
                        }}
                        className="text-left py-2 hover:text-primary transition-colors font-medium"
                      >
                        Vanities
                      </button>
                      <button
                        onClick={(e) => {
                          scrollToGallery('closets', e);
                        }}
                        className="text-left py-2 hover:text-primary transition-colors font-medium"
                      >
                        Closets
                      </button>
                      <button
                        onClick={(e) => {
                          scrollToGallery('design-to-reality', e);
                        }}
                        className="text-left py-2 hover:text-primary transition-colors font-medium"
                      >
                        Design to Reality
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          setTimeout(() => {
                            const suppliers = document.getElementById('suppliers');
                            if (suppliers) {
                              suppliers.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                        className="text-left py-2 hover:text-primary transition-colors font-medium"
                      >
                        Suppliers
                      </button>
                      <a href="#solutions" className="py-2 hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        Solutions
                      </a>
                      <a href="#about" className="py-2 hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        About
                      </a>
                      <a href="#contact" className="py-2 hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        Contact
                      </a>
                    </div>
                  </div>

                  {/* Documentation */}
                  <div className="flex flex-col gap-4 pb-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Documentation</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = ROUTES.DOCS_GETTING_STARTED;
                        }}
                        className="text-left py-2 hover:text-primary transition-colors"
                      >
                        Getting Started
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = ROUTES.DOCS_AUTH;
                        }}
                        className="text-left py-2 hover:text-primary transition-colors"
                      >
                        Authentication Guide
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = ROUTES.DOCS_API;
                        }}
                        className="text-left py-2 hover:text-primary transition-colors"
                      >
                        API Reference
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = ROUTES.DOCS_TROUBLESHOOTING;
                        }}
                        className="text-left py-2 hover:text-primary transition-colors"
                      >
                        Troubleshooting
                      </button>
                    </div>
                  </div>
                  
                  {/* PWA Install */}
                  {isInstallable && (
                    <div className="pb-4 border-t pt-4">
                      <Button
                        size="default"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowInstallDialog(true);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Install App
                      </Button>
                    </div>
                  )}
                  {/* Auth Section */}
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2 pb-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">Signed in as</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = ROUTES.PROFILE;
                        }}
                        className="justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              window.location.href = ROUTES.ADMIN_SECURITY;
                            }}
                            className="justify-start"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Security Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              window.location.href = ROUTES.ADMIN_USERS;
                            }}
                            className="justify-start"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            User Management
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              window.location.href = ROUTES.ADMIN_AUDIT_LOG;
                            }}
                            className="justify-start"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Audit Log
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              window.location.href = ROUTES.ADMIN_CACHE;
                            }}
                            className="justify-start"
                          >
                            <HardDrive className="mr-2 h-4 w-4" />
                            Cache Management
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              window.location.href = '/admin/config';
                            }}
                            className="justify-start"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configuration
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = ROUTES.AUTH;
                      }}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Theme</h3>
                    <ThemeToggle />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mb-2">Catalog</h3>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={(e) => scrollToGallery('kitchens', e)}
                    >
                      Kitchens
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={(e) => scrollToGallery('vanities', e)}
                    >
                      Vanities
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={(e) => scrollToGallery('closets', e)}
                    >
                      Closets
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={(e) => scrollToGallery('design-to-reality', e)}
                    >
                      Design to Reality
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        setTimeout(() => {
                          const suppliers = document.getElementById('suppliers');
                          if (suppliers) {
                            suppliers.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                    >
                      Suppliers
                    </Button>
                  </div>
                  <a 
                    href="#solutions" 
                    className="text-black hover:text-black/70 transition-colors px-2 text-xl font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Solutions
                  </a>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold mb-2">Documentation</h3>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = ROUTES.DOCS_GETTING_STARTED;
                      }}
                    >
                      Getting Started
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = ROUTES.DOCS_AUTH;
                      }}
                    >
                      Authentication Guide
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = ROUTES.DOCS_API;
                      }}
                    >
                      API Reference
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start opacity-50" 
                      disabled
                    >
                      Developer Guide (Coming Soon)
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.location.href = ROUTES.DOCS_TROUBLESHOOTING;
                      }}
                    >
                      Troubleshooting
                    </Button>
                  </div>
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

      <InstallPWADialog 
        open={showInstallDialog} 
        onOpenChange={setShowInstallDialog}
        onInstall={handleInstall}
      />
    </header>;
};
export default Header;