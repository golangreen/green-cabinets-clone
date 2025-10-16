import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.jpg";
const Header = () => {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000] backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer">
              <img src={logo} alt="Green Cabinets Logo" className="h-20 w-auto" style={{
              mixBlendMode: 'lighten'
            }} />
            </a>
            
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 outline-none">
                Services
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border z-50">
                <DropdownMenuItem asChild>
                  <a href="#gallery?category=kitchens" className="cursor-pointer">
                    Kitchens
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#gallery?category=vanities" className="cursor-pointer">
                    Vanities
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#gallery?category=closets" className="cursor-pointer">
                    Closets
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </nav>
    </header>;
};
export default Header;