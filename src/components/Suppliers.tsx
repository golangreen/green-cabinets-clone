import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Image } from "lucide-react";
import { CatalogSlideshow } from "./CatalogSlideshow";
import blumLogo from "@/assets/logos/blum-logo.png";
import tafisaLogo from "@/assets/logos/tafisa-logo.png";
import richelieuLogo from "@/assets/logos/richelieu-logo.png";
import shinnokiLogo from "@/assets/logos/shinnoki-logo.png";
import wilsonartLogo from "@/assets/logos/wilsonart-logo.png";
import greenCabinetsLogo from "@/assets/logos/green-cabinets-logo.jpg";
import eggerLogo from "@/assets/logos/egger-logo.png";

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
    id: "egger",
    name: "Egger",
    description: "Premium decorative wood-based materials",
    logo: eggerLogo,
    website: "https://www.egger.com/en/furniture-interior-design/?country=US",
    details: "EGGER is a leading manufacturer of wood-based materials for furniture and interior design. We use their premium TFL panels, laminates, and decorative surfaces to create stunning, durable cabinetry with an extensive range of contemporary woodgrain reproductions and solid colors.",
    products: [
      "Thermally fused laminate panels (TFL)",
      "High-pressure laminates (HPL)",
      "PerfectSense Matt surfaces",
      "Feelwood synchronized pore textures",
      "98+ woodgrain and solid color options"
    ]
  },
  {
    id: "blum",
    name: "Blum",
    description: "Premium cabinet hardware and lifting systems",
    logo: blumLogo,
    website: "https://www.blum.com/us/en/",
    details: "Blum is a leading manufacturer of furniture fittings. We use their innovative hinge systems, drawer runners, and lift systems to ensure your cabinets operate smoothly and reliably for years to come.",
    products: [
      "AVENTOS lift systems",
      "TANDEM drawer runners",
      "CLIP top hinges",
      "SERVO-DRIVE electronic opening systems"
    ]
  },
  {
    id: "shinnoki",
    name: "Shinnoki",
    description: "Real wood veneer with innovative backing",
    logo: shinnokiLogo,
    website: "https://www.decospan.com/en-us/shinnoki",
    details: "Shinnoki by Decospan combines the authentic beauty of real wood veneer with innovative backing technology. We use their premium wood veneers to create stunning, natural-looking cabinetry that brings warmth and elegance to any space.",
    products: [
      "Real wood veneer panels",
      "Innovative backing technology",
      "Wide variety of wood species",
      "Natural and authentic finishes"
    ]
  },
  {
    id: "tafisa",
    name: "Tafisa TFL",
    description: "Premium thermally fused laminate panels",
    logo: tafisaLogo,
    website: "https://tafisa.ca/en/our-colours",
    details: "Tafisa is a leading manufacturer of thermally fused laminate (TFL) panels. We source their high-quality decorative surfaces to create beautiful, durable cabinetry with a wide range of colors and textures.",
    products: [
      "Thermally fused laminate panels",
      "Wide range of colors and finishes",
      "Durable decorative surfaces",
      "Contemporary and classic designs"
    ]
  },
  {
    id: "tafisa-lummia",
    name: "Tafisa LUMMIA",
    description: "Revolutionary light-diffusing technology for surfaces",
    logo: tafisaLogo,
    website: "https://tafisa.ca/en/Lummia-Technology",
    details: "Tafisa LUMMIA represents cutting-edge innovation in decorative surfaces. This revolutionary technology creates unique light-diffusing effects that add depth and visual interest to cabinetry, transforming spaces with sophisticated illuminated designs.",
    products: [
      "Light-diffusing decorative panels",
      "Innovative LUMMIA technology",
      "Unique visual effects",
      "Modern illuminated surface solutions"
    ]
  },
  {
    id: "richelieu",
    name: "Richelieu",
    description: "Comprehensive hardware and accessories solutions",
    logo: richelieuLogo,
    website: "https://www.richelieu.com/us/en/",
    details: "Richelieu is a leading distributor and manufacturer of specialty hardware and complementary products. We partner with them to source a wide range of cabinet hardware, decorative accessories, and functional solutions for custom cabinetry.",
    products: [
      "Cabinet hardware and pulls",
      "Decorative accessories",
      "Functional storage solutions",
      "Lighting and organizational systems"
    ]
  },
  {
    id: "wilsonart",
    name: "Wilsonart",
    description: "Premium thermally fused laminate surfaces",
    logo: wilsonartLogo,
    website: "https://www.wilsonart.com/laminate/thermally-fused-laminate/design-library",
    details: "Wilsonart is a world-leading manufacturer of engineered surfaces. We use their premium thermally fused laminate (TFL) products to create stunning, durable cabinetry with an extensive range of contemporary designs and finishes.",
    products: [
      "Thermally fused laminate panels",
      "Extensive design library",
      "Durable decorative surfaces",
      "Modern colors and textures"
    ]
  },
  {
    id: "greencabinets",
    name: "Green Cabinets",
    description: "Premium custom cabinetry and design excellence",
    logo: greenCabinetsLogo,
    website: "catalog",
    details: "Green Cabinets specializes in creating stunning, custom-designed cabinetry solutions. Our portfolio showcases exceptional craftsmanship and innovative design approaches that transform spaces into beautiful, functional environments.",
    products: [
      "Custom kitchen designs",
      "Luxury bathroom vanities",
      "Walk-in closet systems",
      "Contemporary and traditional styles"
    ]
  }
];

// Import all gallery images
const galleryImages = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' });
const allGalleryImages = Object.values(galleryImages);

const Suppliers = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showCatalogSlideshow, setShowCatalogSlideshow] = useState(false);

  return (
    <section id="suppliers" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-5xl font-bold text-[#1a1a1a] mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto">
            We work with industry-leading suppliers to ensure the highest quality materials and hardware for your custom cabinetry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="p-8 rounded-2xl bg-[#5C7650]/10 hover:bg-[#5C7650]/20 transition-all duration-300 cursor-pointer relative group"
              onClick={() => {
                if (supplier.website === "catalog") {
                  setShowCatalogSlideshow(true);
                } else {
                  setSelectedSupplier(supplier);
                }
              }}
            >
              <a
                href={supplier.website !== "catalog" ? supplier.website : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (supplier.website !== "catalog") {
                    e.stopPropagation();
                  } else {
                    e.preventDefault();
                  }
                }}
                className="absolute top-4 right-4 text-[#666666] hover:text-[#1a1a1a] transition-colors z-10"
                aria-label={`Visit ${supplier.name} website`}
              >
                {supplier.website === "catalog" ? (
                  <Image className="h-5 w-5" />
                ) : (
                  <ExternalLink className="h-5 w-5" />
                )}
              </a>

              <div className="mb-6 bg-card rounded-xl p-6 h-32 flex items-center justify-center">
                {supplier.logo ? (
                  <img
                    src={supplier.logo}
                    alt={`${supplier.name} logo`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#1a1a1a]">{supplier.name}</span>
                )}
              </div>

              <p className="text-[#666666] leading-relaxed">
                {supplier.description}
              </p>
            </div>
          ))}
        </div>
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

            {selectedSupplier?.website !== "catalog" && (
              <a
                href={selectedSupplier?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CatalogSlideshow 
        isOpen={showCatalogSlideshow} 
        onClose={() => setShowCatalogSlideshow(false)}
        images={allGalleryImages}
      />
    </section>
  );
};

export default Suppliers;
