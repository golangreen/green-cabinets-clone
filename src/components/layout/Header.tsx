import { useState } from "react";
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
import { ChevronDown, Menu, Download, User, LogOut, Shield, Users, FileText } from "lucide-react";
import logo from "@/assets/logo.jpg";
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
  const { isInstallable, promptInstall } = usePWAInstall();
  const { user, isAuthenticated, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

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

  return <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border overflow-hidden" style={{
      position: 'relative'
    }}>
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
      <nav className="container relative mx-auto px-4 md:px-6 py-3 md:py-4" style={{ zIndex: 2 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer">
              <img src={logo} alt="Green Cabinets Logo" className="h-16 md:h-20 w-auto" style={{
              mixBlendMode: 'lighten'
            }} />
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-display ml-auto mr-8">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="text-black hover:text-black/70 transition-colors flex items-center gap-1 outline-none text-xl font-semibold">
                Catalog
                <ChevronDown className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border z-50">
                <DropdownMenuItem 
                  onClick={(e) => scrollToGallery('kitchens', e)}
                  className="cursor-pointer"
                >
                  Kitchens
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => scrollToGallery('vanities', e)}
                  className="cursor-pointer"
                >
                  Vanities
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => scrollToGallery('closets', e)}
                  className="cursor-pointer"
                >
                  Closets
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => scrollToGallery('design-to-reality', e)}
                  className="cursor-pointer"
                >
                  Design to Reality
                </DropdownMenuItem>
                <DropdownMenuItem 
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
                  className="cursor-pointer"
                >
                  Suppliers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#solutions" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              Solutions
            </a>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="text-black hover:text-black/70 transition-colors flex items-center gap-1 outline-none text-xl font-semibold">
                Documentation
                <ChevronDown className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border z-50">
                <DropdownMenuItem 
                  onClick={() => window.location.href = ROUTES.DOCS_GETTING_STARTED}
                  className="cursor-pointer"
                >
                  Getting Started
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = ROUTES.DOCS_AUTH}
                  className="cursor-pointer"
                >
                  Authentication Guide
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = ROUTES.DOCS_API}
                  className="cursor-pointer"
                >
                  API Reference
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  Developer Guide (Coming Soon)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = ROUTES.DOCS_TROUBLESHOOTING}
                  className="cursor-pointer"
                >
                  Troubleshooting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#about" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              About
            </a>
            <a href="#contact" className="text-black hover:text-black/70 transition-colors text-xl font-semibold">
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-4 font-display">
            {/* Install PWA Button */}
            {isInstallable && (
              <Button
                size="default"
                variant="outline"
                className="hidden sm:inline-flex text-sm px-4"
                onClick={() => setShowInstallDialog(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Install
              </Button>
            )}

            <ThemeToggle />

            {/* User Menu or Auth Link */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-4 w-4" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = ROUTES.PROFILE}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => window.location.href = ROUTES.ADMIN_SECURITY}
                        className="cursor-pointer"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Security Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.location.href = ROUTES.ADMIN_USERS}
                        className="cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>User Management</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.location.href = ROUTES.ADMIN_AUDIT_LOG}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Audit Log</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = ROUTES.AUTH}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
            )}

            <CartDrawer />

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] font-display">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Auth Section */}
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2 pb-4 border-b">
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