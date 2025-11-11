import { Hammer, Leaf, Ruler } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      id="services" 
      className="py-32 bg-white"
    >
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-5xl md:text-6xl font-serif text-gray-900">
            Our interior design services
          </h2>
          <p className="text-xl text-gray-600">
            From design to installation, we make premium cabinetry accessible to everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-2"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <div className="w-16 h-16 rounded-xl bg-[#2dd4bf]/10 flex items-center justify-center mb-6 group-hover:bg-[#2dd4bf]/20 transition-colors">
                <service.icon className="w-8 h-8 text-[#2dd4bf]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
