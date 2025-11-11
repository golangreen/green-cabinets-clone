import { useScrollReveal } from "@/hooks/useScrollReveal";

const About = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      id="about" 
      className={`py-24 bg-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">
            About Green Cabinets
          </h2>
          <div className="space-y-6 text-lg text-gray-800 leading-relaxed">
            <p className="text-xl">
              Based in the heart of <span className="text-gray-900 font-semibold">New York City since 2009</span>, 
              Green Cabinets has been crafting exceptional cabinetry solutions that transform spaces into works of art.
            </p>
            <p>
              We specialize in both <span className="text-gray-900 font-semibold">stock and custom cabinets</span>, 
              serving a diverse clientele including developers, architects, and private homeowners. 
              Each project is approached with the same dedication to quality and attention to detail, 
              regardless of scale or complexity.
            </p>
            <p>
              What sets us apart is our unwavering commitment to excellence. We take immense 
              <span className="text-gray-900 font-semibold"> pride in our craftsmanship</span>, 
              ensuring that every cabinet we create meets the highest standards of design, functionality, and durability. 
              Our track record speaks for itself—we've earned exceptional satisfaction ratings across all our client segments.
            </p>
            <p className="text-xl font-semibold text-gray-900 pt-4">
              From concept to completion, we're dedicated to bringing your vision to life with 
              precision, professionalism, and passion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
