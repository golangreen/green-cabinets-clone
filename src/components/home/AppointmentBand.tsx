import ObfuscatedPhone from "@/components/privacy/ObfuscatedPhone";
import ObfuscatedEmail from "@/components/privacy/ObfuscatedEmail";

const AppointmentBand = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-[#0a0a0a]">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90">
            Green Cabinets NY is appointment-only. There is no walk-in shop, showroom, or factory. We bring finish and door samples to your home in Brooklyn, Manhattan, and Queens.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90">
            <ObfuscatedPhone 
              encoded="NzE4ODA0NTQ4OA==" 
              alwaysReveal 
              className="hover:text-white transition-colors"
              type="tel"
            />
            <span className="mx-2">·</span>
            <ObfuscatedEmail 
              encoded="b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20=" 
              alwaysReveal 
              className="hover:text-white transition-colors"
            />
          </p>
          
          <p className="text-sm sm:text-base text-primary-foreground/80">
            Follow:{" "}
            <a 
              href="https://instagram.com/green_cabinets_" 
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              instagram.com/green_cabinets_
            </a>{" "}
            only.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AppointmentBand;
