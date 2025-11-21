import { Hammer, Leaf, Ruler } from "lucide-react";

const services = [
  {
    icon: Ruler,
    title: "Custom Design",
    description: "Tailored cabinetry designed to fit your unique space and style perfectly.",
  },
  {
    icon: Leaf,
    title: "Sustainable Materials",
    description: "Eco-friendly materials that are beautiful, durable, and kind to the planet.",
  },
  {
    icon: Hammer,
    title: "Expert Installation",
    description: "Professional installation by experienced craftsmen who care about quality.",
  },
];

const Services = () => {
  return (
    <>
      {/* Our Solutions Intro */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#f8f8f8]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            Our Solutions
          </h2>
          <p className="text-xl text-[#666666] max-w-3xl mx-auto">
            Professional cabinetry solutions tailored to your needs
          </p>
        </div>
      </section>

      {/* Services Cards */}
      <section id="services" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#1a1a1a] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#666666] leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
