import { Card } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import customImage from "@/assets/feature-custom.jpg";
import sustainableImage from "@/assets/feature-sustainable.jpg";
import installationImage from "@/assets/feature-installation.jpg";

const features = [
  {
    image: customImage,
    title: "Custom Solutions",
    description: "Every space is unique. Our designers work with you to create cabinets that maximize functionality and beauty.",
    stats: "500+ Custom Designs",
  },
  {
    image: sustainableImage,
    title: "Sustainable Choice",
    description: "We source responsibly and build to last. Quality materials that stand the test of time.",
    stats: "100% Eco-Friendly",
  },
  {
    image: installationImage,
    title: "Professional Service",
    description: "From consultation to installation, our team ensures every detail is perfect.",
    stats: "15+ Years Experience",
  },
];

const Features = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      id="solutions" 
      className={`py-24 bg-white transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`overflow-hidden border-0 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } flex flex-col md:flex`}
            >
              <div className="md:w-1/2 relative overflow-hidden group">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full min-h-[300px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold w-fit">
                  {feature.stats}
                </div>
                <h3 className="font-display text-4xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
