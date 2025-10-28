import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website: string;
  details: string;
  products: string[];
}

const suppliers: Supplier[] = [
  {
    id: "blum",
    name: "Blum",
    description: "Premium cabinet hardware and lifting systems",
    website: "https://www.blum.com",
    details: "Blum is a leading manufacturer of furniture fittings. We use their innovative hinge systems, drawer runners, and lift systems to ensure your cabinets operate smoothly and reliably for years to come.",
    products: [
      "AVENTOS lift systems",
      "TANDEM drawer runners",
      "CLIP top hinges",
      "SERVO-DRIVE electronic opening systems"
    ]
  }
];

const Suppliers = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We work with industry-leading suppliers to ensure the highest quality materials and hardware for your custom cabinetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedSupplier(supplier)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{supplier.name}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {supplier.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedSupplier?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-muted-foreground">
                {selectedSupplier?.details}
              </p>
              
              {selectedSupplier?.products && (
                <div>
                  <h4 className="font-semibold mb-3">Featured Products:</h4>
                  <ul className="space-y-2">
                    {selectedSupplier.products.map((product, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{product}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={selectedSupplier?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit {selectedSupplier?.name} Website
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Suppliers;
