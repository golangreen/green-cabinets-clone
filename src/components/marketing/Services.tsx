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
    <section id="services" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-foreground">
            Simple, Fast & Reliable
          </h2>
          <p className="text-xl text-muted-foreground">
            From design to installation, we make premium cabinetry accessible to everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
