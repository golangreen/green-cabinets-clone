import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Green Cabinets Logo" className="h-10 w-auto" style={{ mixBlendMode: 'lighten' }} />
              <span className="text-xl font-bold text-foreground">Green Cabinets</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium custom cabinetry for modern living.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Kitchen Cabinets</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Bathroom Vanities</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Custom Storage</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Installation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Our Process</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contact@greencabinets.com</li>
              <li>1-800-GREEN-CAB</li>
              <li>Mon-Fri 9am-6pm EST</li>
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
