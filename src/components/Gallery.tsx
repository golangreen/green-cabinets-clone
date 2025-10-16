import bathroomMarble from "@/assets/gallery/bathroom-marble.jpg";
import kitchenModernWhite from "@/assets/gallery/kitchen-modern-white.jpg";
import kitchenFireplace from "@/assets/gallery/kitchen-fireplace.jpg";
import kitchenPendantLights from "@/assets/gallery/kitchen-pendant-lights.jpg";
import kitchenIslandView from "@/assets/gallery/kitchen-island-view.jpg";
import kitchenTraditional from "@/assets/gallery/kitchen-traditional.jpg";
import bedroomCloset from "@/assets/gallery/bedroom-closet.jpg";
import grayCabinetsCorner from "@/assets/gallery/gray-cabinets-corner.jpg";
import blackCabinet from "@/assets/gallery/black-cabinet.jpg";
import laundryRoom from "@/assets/gallery/laundry-room.jpg";
import radiatorCover from "@/assets/gallery/radiator-cover.jpg";
import grayKitchenCorner from "@/assets/gallery/gray-kitchen-corner.jpg";
import twoToneKitchenIsland from "@/assets/gallery/two-tone-kitchen-island.jpg";
import twoToneKitchenWide from "@/assets/gallery/two-tone-kitchen-wide.jpg";
import classicWhiteKitchen from "@/assets/gallery/classic-white-kitchen.jpg";
import marbleCountertopKitchen from "@/assets/gallery/marble-countertop-kitchen.jpg";
import brightKitchenIsland from "@/assets/gallery/bright-kitchen-island.jpg";
import kitchenIslandSeating from "@/assets/gallery/kitchen-island-seating.jpg";

const Gallery = () => {
  const galleryImages = [
    { src: bathroomMarble, alt: "Elegant marble bathroom with modern fixtures" },
    { src: kitchenModernWhite, alt: "Modern white kitchen with pendant lighting" },
    { src: kitchenFireplace, alt: "Contemporary kitchen with fireplace feature" },
    { src: kitchenPendantLights, alt: "White kitchen with glass pendant lights" },
    { src: kitchenIslandView, alt: "Kitchen island with bar seating" },
    { src: kitchenTraditional, alt: "Traditional style kitchen installation" },
    { src: bedroomCloset, alt: "Custom gray bedroom built-in closet" },
    { src: grayCabinetsCorner, alt: "Gray corner cabinet installation" },
    { src: blackCabinet, alt: "Modern black freestanding cabinet" },
    { src: laundryRoom, alt: "White laundry room cabinetry" },
    { src: radiatorCover, alt: "Custom radiator cover with mesh panels" },
    { src: grayKitchenCorner, alt: "Gray L-shaped kitchen installation" },
    { src: twoToneKitchenIsland, alt: "Two-tone kitchen with marble island" },
    { src: twoToneKitchenWide, alt: "Modern two-tone kitchen with wood accents" },
    { src: classicWhiteKitchen, alt: "Classic white kitchen with gray island" },
    { src: marbleCountertopKitchen, alt: "Kitchen with marble countertops and wood trim" },
    { src: brightKitchenIsland, alt: "Bright open kitchen with large island" },
    { src: kitchenIslandSeating, alt: "Kitchen island with built-in seating" },
  ];

  return (
    <section id="gallery" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Work</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of custom cabinetry and woodwork projects
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
