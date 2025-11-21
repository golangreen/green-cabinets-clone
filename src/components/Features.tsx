import { Card } from "@/components/ui/card";
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
  return (
    <section id="solutions" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#f8f8f8]">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-4">
            Why Choose Green Cabinets
          </h2>
        </div>

        <div className="max-w-7xl mx-auto space-y-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-12 items-center`}
            >
              <div className="md:w-1/2 relative overflow-hidden rounded-2xl">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="md:w-1/2 space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  {feature.stats}
                </div>
                <h3 className="font-display text-4xl font-bold text-[#1a1a1a]">
                  {feature.title}
                </h3>
                <p className="text-lg text-[#666666] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
