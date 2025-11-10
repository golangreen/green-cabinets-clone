import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Ruler, Palette, Box, Sparkles, ArrowRight, Eye } from "lucide-react";

export const VanityDesignerSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Ruler,
      title: "Custom Dimensions",
      description: "Design to your exact specifications with precision measurements"
    },
    {
      icon: Palette,
      title: "Material Selection",
      description: "Choose from 100+ premium finishes and wood veneers"
    },
    {
      icon: Box,
      title: "3D Preview",
      description: "See your vanity come to life with real-time 3D visualization"
    },
    {
      icon: Sparkles,
      title: "Instant Quote",
      description: "Get pricing instantly as you customize your design"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Design Your Dream Vanity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Use our interactive designer to create a custom bathroom vanity tailored to your space and style
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
            onClick={() => navigate("/vanity-designer")}
            className="text-lg px-8 py-6 group"
          >
            Start Designing
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate("/vanity-designer")}
            className="text-lg px-8 py-6"
          >
            <Eye className="mr-2 w-5 h-5" />
            View Examples
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Free design tool • Instant pricing • Save and share your designs
          </p>
        </div>
      </div>
    </section>
  );
};
