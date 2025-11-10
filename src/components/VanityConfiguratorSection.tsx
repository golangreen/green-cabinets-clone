import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Ruler, Palette, Calculator, ArrowRight, Sparkles } from "lucide-react";

export const VanityConfiguratorSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Ruler,
      title: "Precise Dimensions",
      description: "Customize with exact measurements down to 1/16 inch"
    },
    {
      icon: Palette,
      title: "100+ Premium Finishes",
      description: "Choose from Tafisa, Egger, and Shinnoki materials"
    },
    {
      icon: Calculator,
      title: "Instant Pricing",
      description: "Real-time pricing with tax and shipping calculations"
    },
    {
      icon: Sparkles,
      title: "3D Preview",
      description: "Visualize your custom vanity before ordering"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Custom Vanity Configurator
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design your perfect bathroom vanity with our interactive configurator - get instant pricing and 3D previews
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            onClick={() => {
              // Navigate to product page which will show the configurator
              navigate("/product/custom-bathroom-vanity");
            }}
            className="text-lg px-8 py-6 group"
          >
            Start Configuring
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Free 3D preview • Instant pricing • Save your designs
          </p>
        </div>
      </div>
    </section>
  );
};
