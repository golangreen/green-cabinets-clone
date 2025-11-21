const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-5xl font-bold text-foreground mb-6">
            About Green Cabinets
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p className="text-xl">
              Based in the heart of <span className="text-foreground font-semibold">New York City since 2009</span>, 
              Green Cabinets has been crafting exceptional cabinetry solutions that transform spaces into works of art.
            </p>
            <p>
              We specialize in both <span className="text-foreground font-semibold">stock and custom cabinets</span>, 
              serving a diverse clientele including developers, architects, and private homeowners. 
              Each project is approached with the same dedication to quality and attention to detail, 
              regardless of scale or complexity.
            </p>
            <p>
              What sets us apart is our unwavering commitment to excellence. We take immense 
              <span className="text-foreground font-semibold"> pride in our craftsmanship</span>, 
              ensuring that every cabinet we create meets the highest standards of design, functionality, and durability. 
              Our track record speaks for itself—we've earned exceptional satisfaction ratings across all our client segments.
            </p>
            <p className="text-xl font-semibold text-foreground pt-4">
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
