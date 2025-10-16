import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import bathroomMarble from "@/assets/gallery/bathroom-marble.jpg";
import kitchenModernWhite from "@/assets/gallery/kitchen-modern-white.jpg";
import kitchenFireplace from "@/assets/gallery/kitchen-fireplace.jpg";
import kitchenPendantLights from "@/assets/gallery/kitchen-pendant-lights.jpg";
import kitchenIslandView from "@/assets/gallery/kitchen-island-view.jpg";
import kitchenTraditional from "@/assets/gallery/kitchen-traditional.jpg";
import bedroomCloset from "@/assets/gallery/bedroom-closet.jpg";
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
import modernGrayConstruction from "@/assets/gallery/modern-gray-construction.jpg";
import grayKitchenConstruction from "@/assets/gallery/gray-kitchen-construction.jpg";
import darkModernKitchen from "@/assets/gallery/dark-modern-kitchen.jpg";
import openConceptMarbleKitchen from "@/assets/gallery/open-concept-marble-kitchen.jpg";
import marbleWoodKitchenIsland from "@/assets/gallery/marble-wood-kitchen-island.jpg";
import contemporaryWoodCabinets from "@/assets/gallery/contemporary-wood-cabinets.jpg";
import darkKitchenMarbleConstruction from "@/assets/gallery/dark-kitchen-marble-construction.jpeg";
import modernWhiteWoodIsland from "@/assets/gallery/modern-white-wood-island-kitchen.jpg";
import whiteWoodIslandSideView from "@/assets/gallery/white-wood-island-side-view.jpg";
import modernKitchenDarkIsland from "@/assets/gallery/modern-kitchen-dark-island.jpg";
import whiteKitchenGlassPendants from "@/assets/gallery/white-kitchen-glass-pendants.jpeg";
import greenKitchenMarbleIsland from "@/assets/gallery/green-kitchen-marble-island.png";
import greenOpenConceptKitchen from "@/assets/gallery/green-open-concept-kitchen.png";
import naturalWoodKitchenMarble from "@/assets/gallery/natural-wood-kitchen-marble.jpeg";
import modernBathroomMarbleVanity from "@/assets/gallery/modern-bathroom-marble-vanity.jpeg";
import modernPowderRoomMarble from "@/assets/gallery/modern-powder-room-marble.jpeg";
import modernKitchenIslandConstruction from "@/assets/gallery/modern-kitchen-island-construction.jpg";
import whiteKitchenIslandCabinets from "@/assets/gallery/white-kitchen-island-cabinets.jpg";
import modernKitchenCabinetsGray from "@/assets/gallery/modern-kitchen-cabinets-gray.jpg";
import kitchenConstructionCabinets from "@/assets/gallery/kitchen-construction-cabinets.jpeg";
import whiteKitchenCabinetsProgress from "@/assets/gallery/white-kitchen-cabinets-progress.jpeg";
import kitchenIslandCabinetInstall from "@/assets/gallery/kitchen-island-cabinet-install.jpeg";
import grayKitchenIslandConstruction from "@/assets/gallery/gray-kitchen-island-construction.jpeg";
import customKitchenCabinetsInstall from "@/assets/gallery/custom-kitchen-cabinets-install.jpg";
import naturalWoodGalleyKitchen from "@/assets/gallery/natural-wood-galley-kitchen.jpeg";
import naturalWoodOpenConceptKitchen from "@/assets/gallery/natural-wood-open-concept-kitchen.jpeg";
import woodKitchenOutdoorAccess from "@/assets/gallery/wood-kitchen-outdoor-access.jpeg";
import modernBathroomWoodMarble from "@/assets/gallery/modern-bathroom-wood-marble.jpeg";
import contemporaryPowderRoomWood from "@/assets/gallery/contemporary-powder-room-wood.jpeg";
import marbleBathroomOutdoorAccess from "@/assets/gallery/marble-bathroom-outdoor-access.jpeg";
import luxuryKitchenMarbleDining from "@/assets/gallery/luxury-kitchen-marble-dining.jpeg";
import modernKitchenIslandBarStools from "@/assets/gallery/modern-kitchen-island-bar-stools.jpeg";
import luxuryMarbleBathroomShower from "@/assets/gallery/luxury-marble-bathroom-shower.jpeg";
import contemporaryBathroomMixedMarble from "@/assets/gallery/contemporary-bathroom-mixed-marble.jpeg";
import naturalWoodHallwayCabinets from "@/assets/gallery/natural-wood-hallway-cabinets.jpeg";
import modernWorkspaceWoodDeskBrick from "@/assets/gallery/modern-workspace-wood-desk-brick.jpeg";
import modernStudioWoodCabinetry from "@/assets/gallery/modern-studio-wood-cabinetry.jpeg";
import compactKitchenWoodIslandWhite from "@/assets/gallery/compact-kitchen-wood-island-white.jpeg";
import naturalWoodKitchenWhiteCountertops from "@/assets/gallery/natural-wood-kitchen-white-countertops.jpeg";
import modernOpenLivingWoodKitchen from "@/assets/gallery/modern-open-living-wood-kitchen.jpeg";
import contemporaryLivingWoodKitchenIsland from "@/assets/gallery/contemporary-living-wood-kitchen-island.jpeg";
import modernKitchenIslandGlassPendants from "@/assets/gallery/modern-kitchen-island-glass-pendants.jpeg";
import contemporaryWhiteGrayKitchen from "@/assets/gallery/contemporary-white-gray-kitchen.jpeg";
import brightModernWhiteKitchenOpen from "@/assets/gallery/bright-modern-white-kitchen-open.jpeg";
import modernWhiteKitchenPendants from "@/assets/gallery/modern-white-kitchen-pendants.jpeg";
import twoToneWoodWhiteKitchenConstruction from "@/assets/gallery/two-tone-wood-white-kitchen-construction.jpeg";
import traditionalWhiteKitchenGrayIsland from "@/assets/gallery/traditional-white-kitchen-gray-island.jpg";
import kitchenConstructionTwoToneCabinets from "@/assets/gallery/kitchen-construction-two-tone-cabinets.jpeg";
import minimalistWhiteKitchenIsland from "@/assets/gallery/minimalist-white-kitchen-island.jpg";
import contemporaryWhiteKitchenBlueWall from "@/assets/gallery/contemporary-white-kitchen-blue-wall.jpg";
import blumDrawerHardwareCloseup from "@/assets/gallery/blum-drawer-hardware-closeup.jpg";
import minimalistCabinetDetail from "@/assets/gallery/minimalist-cabinet-detail.jpg";
import whiteKitchenIslandDrawerOrganization from "@/assets/gallery/white-kitchen-island-drawer-organization.jpg";
import whiteKitchenDrawerStorageOrganization from "@/assets/gallery/white-kitchen-drawer-storage-organization.jpg";
import whiteCabinetLiftMechanismHardware from "@/assets/gallery/white-cabinet-lift-mechanism-hardware.jpg";
import darkCherryKitchenGraniteIsland from "@/assets/gallery/dark-cherry-kitchen-granite-island.jpg";
import whiteKitchenConstructionDarkIsland from "@/assets/gallery/white-kitchen-construction-dark-island.jpg";
import whiteKitchenDualIslandsPendants from "@/assets/gallery/white-kitchen-dual-islands-pendants.jpg";
import whiteKitchenGrayIslandBarSeating from "@/assets/gallery/white-kitchen-gray-island-bar-seating.jpg";
import whiteKitchenIslandDiningNook from "@/assets/gallery/white-kitchen-island-dining-nook.jpg";
import whiteKitchenIslandOpenShelving from "@/assets/gallery/white-kitchen-island-open-shelving.jpg";
import customRadiatorCoverMeshPanels from "@/assets/gallery/custom-radiator-cover-mesh-panels.jpg";
import grayWoodBedroomCloset from "@/assets/gallery/gray-wood-bedroom-closet.jpg";
import grayWoodWardrobeConstruction from "@/assets/gallery/gray-wood-wardrobe-construction.jpg";
import customClosetAngledCeiling from "@/assets/gallery/custom-closet-angled-ceiling.jpg";
import lightGrayTallStorageCabinet from "@/assets/gallery/light-gray-tall-storage-cabinet.jpg";
import whiteBathroomStorageDrawers from "@/assets/gallery/white-bathroom-storage-drawers.jpg";
import darkWoodCornerWardrobe from "@/assets/gallery/dark-wood-corner-wardrobe.jpg";
import modernBathroomFloatingWoodVanity from "@/assets/gallery/modern-bathroom-floating-wood-vanity.jpeg";
import loftKitchenExposedBrickNaturalWood from "@/assets/gallery/loft-kitchen-exposed-brick-natural-wood.jpeg";

type Category = "kitchens" | "vanities" | "closets" | "all";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('?category=')) {
        const params = new URLSearchParams(hash.split("?")[1] || "");
        const category = params.get("category") as Category;
        if (category && ["kitchens", "vanities", "closets"].includes(category)) {
          setActiveCategory(category);
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const galleryImages = [
    // ==================== KITCHENS ====================
    
    // === WHITE KITCHENS ===
    { src: kitchenModernWhite, alt: "Modern white kitchen with pendant lighting", category: "kitchens" },
    { src: kitchenPendantLights, alt: "White kitchen with glass pendant lights", category: "kitchens" },
    { src: classicWhiteKitchen, alt: "Classic white kitchen with gray island", category: "kitchens" },
    { src: laundryRoom, alt: "White laundry room cabinetry", category: "kitchens" },
    { src: whiteKitchenGlassPendants, alt: "White traditional kitchen with glass pendant lights and open shelving", category: "kitchens" },
    { src: whiteKitchenIslandCabinets, alt: "White kitchen island with custom cabinet installation", category: "kitchens" },
    { src: whiteKitchenCabinetsProgress, alt: "White kitchen cabinets installation progress", category: "kitchens" },
    { src: brightModernWhiteKitchenOpen, alt: "Bright modern white kitchen with open concept dining and living area", category: "kitchens" },
    { src: modernWhiteKitchenPendants, alt: "Modern white kitchen with island and globe pendant lights", category: "kitchens" },
    { src: traditionalWhiteKitchenGrayIsland, alt: "Traditional white kitchen with gray island and subway tile backsplash", category: "kitchens" },
    { src: minimalistWhiteKitchenIsland, alt: "Minimalist white kitchen with modern island and contemporary lighting", category: "kitchens" },
    { src: contemporaryWhiteKitchenBlueWall, alt: "Contemporary white kitchen with blue accent wall and modern design", category: "kitchens" },
    { src: minimalistCabinetDetail, alt: "Minimalist white cabinet detail showing clean lines and craftsmanship", category: "kitchens" },
    { src: whiteKitchenIslandDrawerOrganization, alt: "White kitchen island with organized Blum drawer system", category: "kitchens" },
    { src: whiteKitchenDrawerStorageOrganization, alt: "White kitchen with multi-level drawer storage organization", category: "kitchens" },
    { src: whiteCabinetLiftMechanismHardware, alt: "White cabinet with premium lift-up mechanism hardware", category: "kitchens" },
    { src: whiteKitchenConstructionDarkIsland, alt: "White kitchen construction with dark wood island in progress", category: "kitchens" },
    { src: whiteKitchenDualIslandsPendants, alt: "White kitchen with dual islands and glass globe pendant lights", category: "kitchens" },
    { src: whiteKitchenGrayIslandBarSeating, alt: "White kitchen with gray island and wood bar stool seating", category: "kitchens" },
    { src: whiteKitchenIslandDiningNook, alt: "White kitchen island with adjacent dining nook and built-in seating", category: "kitchens" },
    { src: whiteKitchenIslandOpenShelving, alt: "White kitchen island featuring open shelving and glass pendants", category: "kitchens" },

    // === GRAY KITCHENS ===
    { src: grayKitchenCorner, alt: "Gray L-shaped kitchen installation", category: "kitchens" },
    { src: modernGrayConstruction, alt: "Modern gray kitchen under construction", category: "kitchens" },
    { src: grayKitchenConstruction, alt: "Contemporary gray kitchen in progress", category: "kitchens" },
    { src: modernKitchenCabinetsGray, alt: "Modern gray kitchen cabinets installation", category: "kitchens" },
    { src: grayKitchenIslandConstruction, alt: "Gray kitchen island under construction", category: "kitchens" },
    { src: contemporaryWhiteGrayKitchen, alt: "Contemporary white and gray kitchen with wood island and waterfall edge", category: "kitchens" },

    // === DARK WOOD & CHERRY KITCHENS ===
    { src: blackCabinet, alt: "Modern black freestanding cabinet", category: "kitchens" },
    { src: darkModernKitchen, alt: "Modern dark kitchen installation", category: "kitchens" },
    { src: darkKitchenMarbleConstruction, alt: "Dark kitchen with marble backsplash under construction", category: "kitchens" },
    { src: modernKitchenDarkIsland, alt: "Modern kitchen with dark island and pendant lighting", category: "kitchens" },
    { src: darkCherryKitchenGraniteIsland, alt: "Dark cherry kitchen with granite island and bar seating", category: "kitchens" },

    // === NATURAL WOOD KITCHENS ===
    { src: contemporaryWoodCabinets, alt: "Contemporary wood cabinet installation", category: "kitchens" },
    { src: marbleWoodKitchenIsland, alt: "Marble waterfall island with wood cabinetry", category: "kitchens" },
    { src: modernWhiteWoodIsland, alt: "Modern white kitchen with wood island and pendant lights", category: "kitchens" },
    { src: whiteWoodIslandSideView, alt: "White kitchen with natural wood island side view", category: "kitchens" },
    { src: naturalWoodKitchenMarble, alt: "Natural wood kitchen with marble backsplash and countertops", category: "kitchens" },
    { src: naturalWoodGalleyKitchen, alt: "Natural wood galley kitchen with marble backsplash and white countertops", category: "kitchens" },
    { src: naturalWoodOpenConceptKitchen, alt: "Natural wood open concept kitchen with dining area", category: "kitchens" },
    { src: woodKitchenOutdoorAccess, alt: "Wood kitchen with marble countertops and outdoor patio access", category: "kitchens" },
    { src: compactKitchenWoodIslandWhite, alt: "Compact kitchen with wood island and white countertops", category: "kitchens" },
    { src: naturalWoodKitchenWhiteCountertops, alt: "Natural wood kitchen with white countertops and glass pendant lights", category: "kitchens" },
    { src: modernOpenLivingWoodKitchen, alt: "Modern open concept living area with wood kitchen and pendant lighting", category: "kitchens" },
    { src: contemporaryLivingWoodKitchenIsland, alt: "Contemporary living room with open wood kitchen island and bar seating", category: "kitchens" },
    { src: modernKitchenIslandGlassPendants, alt: "Modern kitchen island with wood cabinets and glass globe pendant lights", category: "kitchens" },
    { src: loftKitchenExposedBrickNaturalWood, alt: "Loft kitchen with natural wood cabinetry, exposed brick wall, and pendant lighting", category: "kitchens" },

    // === TWO-TONE KITCHENS ===
    { src: twoToneKitchenIsland, alt: "Two-tone kitchen with marble island", category: "kitchens" },
    { src: twoToneKitchenWide, alt: "Modern two-tone kitchen with wood accents", category: "kitchens" },
    { src: twoToneWoodWhiteKitchenConstruction, alt: "Two-tone kitchen construction with wood island and white cabinets", category: "kitchens" },
    { src: kitchenConstructionTwoToneCabinets, alt: "Kitchen construction showing two-tone wood and white cabinet installation", category: "kitchens" },

    // === GREEN KITCHENS ===
    { src: greenKitchenMarbleIsland, alt: "Green cabinets with marble waterfall island and brass accents", category: "kitchens" },
    { src: greenOpenConceptKitchen, alt: "Green open concept kitchen with marble island", category: "kitchens" },

    // === KITCHEN SPECIAL FEATURES ===
    { src: kitchenFireplace, alt: "Contemporary kitchen with fireplace feature", category: "kitchens" },
    { src: kitchenIslandView, alt: "Kitchen island with bar seating", category: "kitchens" },
    { src: kitchenTraditional, alt: "Traditional style kitchen installation", category: "kitchens" },
    { src: marbleCountertopKitchen, alt: "Kitchen with marble countertops and wood trim", category: "kitchens" },
    { src: brightKitchenIsland, alt: "Bright open kitchen with large island", category: "kitchens" },
    { src: kitchenIslandSeating, alt: "Kitchen island with built-in seating", category: "kitchens" },
    { src: openConceptMarbleKitchen, alt: "Open concept kitchen with marble and wood accents", category: "kitchens" },
    { src: luxuryKitchenMarbleDining, alt: "Luxury kitchen with marble island and wood dining table integration", category: "kitchens" },
    { src: modernKitchenIslandBarStools, alt: "Modern kitchen island with wood bar stools and marble waterfall edge", category: "kitchens" },
    { src: blumDrawerHardwareCloseup, alt: "Close-up of premium Blum drawer hardware installation", category: "kitchens" },

    // === KITCHEN CONSTRUCTION & INSTALLATION ===
    { src: modernKitchenIslandConstruction, alt: "Modern kitchen island construction and installation process", category: "kitchens" },
    { src: kitchenConstructionCabinets, alt: "Kitchen construction with cabinet assembly", category: "kitchens" },
    { src: kitchenIslandCabinetInstall, alt: "Kitchen island cabinet installation process", category: "kitchens" },
    { src: customKitchenCabinetsInstall, alt: "Custom kitchen cabinets professional installation", category: "kitchens" },

    // ==================== VANITIES (BATHROOMS) ====================
    { src: bathroomMarble, alt: "Elegant marble bathroom with modern fixtures", category: "vanities" },
    { src: modernBathroomMarbleVanity, alt: "Modern bathroom with floating marble vanity and walk-in shower", category: "vanities" },
    { src: modernPowderRoomMarble, alt: "Modern powder room with marble countertop and storage", category: "vanities" },
    { src: modernBathroomWoodMarble, alt: "Modern bathroom with floating wood cabinets and marble vanity", category: "vanities" },
    { src: contemporaryPowderRoomWood, alt: "Contemporary powder room with wood vanity and marble countertop", category: "vanities" },
    { src: marbleBathroomOutdoorAccess, alt: "Luxury marble bathroom with wood vanity and outdoor access", category: "vanities" },
    { src: luxuryMarbleBathroomShower, alt: "Luxury marble bathroom with wood vanity and walk-in glass shower", category: "vanities" },
    { src: contemporaryBathroomMixedMarble, alt: "Contemporary bathroom with wood floating vanity and mixed marble tiles", category: "vanities" },
    { src: modernBathroomFloatingWoodVanity, alt: "Modern bathroom with floating wood vanity and marble walk-in shower", category: "vanities" },
    { src: whiteBathroomStorageDrawers, alt: "White bathroom storage cabinet with multiple drawers", category: "vanities" },

    // ==================== CLOSETS & STORAGE ====================
    { src: bedroomCloset, alt: "Custom gray bedroom built-in closet", category: "closets" },
    { src: grayWoodBedroomCloset, alt: "Gray wood bedroom closet with integrated drawer storage", category: "closets" },
    { src: grayWoodWardrobeConstruction, alt: "Gray wood wardrobe construction with open shelving design", category: "closets" },
    { src: lightGrayTallStorageCabinet, alt: "Light gray tall storage cabinet with minimalist design", category: "closets" },
    { src: darkWoodCornerWardrobe, alt: "Dark wood corner wardrobe with floor-to-ceiling design", category: "closets" },
    { src: customClosetAngledCeiling, alt: "Custom closet installation with angled ceiling accommodation", category: "closets" },
    { src: naturalWoodHallwayCabinets, alt: "Natural wood hallway with built-in storage cabinets and ceiling panels", category: "closets" },
    
    // === OTHER STORAGE & SPECIALTY ===
    { src: radiatorCover, alt: "Custom radiator cover with mesh panels", category: "closets" },
    { src: customRadiatorCoverMeshPanels, alt: "Custom radiator cover with decorative mesh panels and wood finish", category: "closets" },
    { src: modernWorkspaceWoodDeskBrick, alt: "Modern workspace with natural wood desk and exposed brick wall", category: "closets" },
    { src: modernStudioWoodCabinetry, alt: "Modern studio apartment with custom wood cabinetry and dining area", category: "closets" },
  ].map(img => ({ ...img, category: img.category || "kitchens" as Category }));

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const kitchens = galleryImages.filter(img => img.category === "kitchens");
  const vanities = galleryImages.filter(img => img.category === "vanities");
  const closets = galleryImages.filter(img => img.category === "closets");

  return (
    <section id="gallery" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Work</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of custom cabinetry and woodwork projects
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <Button
            variant={activeCategory === "kitchens" ? "default" : "outline"}
            onClick={() => setActiveCategory("kitchens")}
          >
            Kitchens ({kitchens.length})
          </Button>
          <Button
            variant={activeCategory === "vanities" ? "default" : "outline"}
            onClick={() => setActiveCategory("vanities")}
          >
            Vanities ({vanities.length})
          </Button>
          <Button
            variant={activeCategory === "closets" ? "default" : "outline"}
            onClick={() => setActiveCategory("closets")}
          >
            Closets ({closets.length})
          </Button>
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
          >
            All Projects
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
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
