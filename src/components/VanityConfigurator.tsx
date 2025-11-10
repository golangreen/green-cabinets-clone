import { useState, useEffect, useMemo } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingCart, ZoomIn, Save } from "lucide-react";
import { FinishPreview } from "./FinishPreview";
import { TextureSwatch } from "./TextureSwatch";
import { TexturePreviewModal } from "./TexturePreviewModal";
import { getTafisaColorNames, getTafisaCategories, getTafisaColorsByCategory } from "@/lib/tafisaColors";
import { getEggerColorNames, getEggerCategories, getEggerColorsByCategory } from "@/lib/eggerColors";
import { useCartStore } from "@/stores/cartStore";
import { z } from "zod";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { TemplateGallery } from "./TemplateGallery";
import { VanityTemplate } from "@/lib/vanityTemplates";
import { useSavedTemplates } from "@/hooks/useSavedTemplates";

const dimensionSchema = z.object({
  width: z.number().min(12, "Width must be at least 12 inches").max(120, "Width cannot exceed 120 inches"),
  height: z.number().min(12, "Height must be at least 12 inches").max(60, "Height cannot exceed 60 inches"),
  depth: z.number().min(12, "Depth must be at least 12 inches").max(36, "Depth cannot exceed 36 inches"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
});

interface VanityConfiguratorProps {
  product: ShopifyProduct;
}

const TAX_RATES: { [key: string]: number } = {
  "NY": 0.08875, // 8.875%
  "NJ": 0.06625, // 6.625%
  "CT": 0.0635,  // 6.35%
  "PA": 0.06,    // 6%
  "other": 0,    // No tax for other states
};

const SHIPPING_RATES: { [key: string]: number } = {
  "NY": 150,
  "NJ": 200,
  "CT": 250,
  "PA": 300,
  "other": 400,
};

// Get Tafisa finish options from comprehensive color library
const TAFISA_FINISHES = getTafisaColorNames();
const TAFISA_CATEGORIES = getTafisaCategories();

// Get Egger finish options from comprehensive color library
const EGGER_FINISHES = getEggerColorNames();
const EGGER_CATEGORIES = getEggerCategories();

// Shinnoki finish options - Prefinished wood veneer (organized by wood type)
const SHINNOKI_FINISHES = [
  // Light Oaks
  'Bondi Oak',
  'Milk Oak',
  'Ivory Oak',
  'Ivory Infinite Oak',
  
  // Natural & Medium Oaks
  'Natural Oak',
  'Manhattan Oak',
  'Desert Oak',
  'Sahara Oak',
  'Burley Oak',
  
  // Dark Oak
  'Raven Oak',
  
  // Walnuts
  'Frozen Walnut',
  'Smoked Walnut',
  'Pure Walnut',
  'Stardust Walnut',
  
  // Other Woods
  'Pebble Triba',
  'Terra Sapele',
  'Cinnamon Triba',
  'Shadow Eucalyptus',
];

const BRAND_INFO = {
  'Tafisa': {
    price: 250,
    description: 'Premium melamine panels - 60+ colors available',
  },
  'Egger': {
    price: 300,
    description: 'Premium TFL & HPL panels - 98+ woodgrain and solid colors',
  },
  'Shinnoki': {
    price: 350,
    description: 'Prefinished wood veneer panels - Natural wood beauty',
  },
};

// Helper function to display fractions in simplified form
const getFractionDisplay = (sixteenths: string): string => {
  const fractions: Record<string, string> = {
    '0': '',
    '1': '1/16',
    '2': '1/8',
    '3': '3/16',
    '4': '1/4',
    '5': '5/16',
    '6': '3/8',
    '7': '7/16',
    '8': '1/2',
    '9': '9/16',
    '10': '5/8',
    '11': '11/16',
    '12': '3/4',
    '13': '13/16',
    '14': '7/8',
    '15': '15/16',
  };
  return fractions[sixteenths] || '';
};

export const VanityConfigurator = ({ product }: VanityConfiguratorProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("Tafisa");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [widthFraction, setWidthFraction] = useState<string>("0");
  const [height, setHeight] = useState<string>("");
  const [heightFraction, setHeightFraction] = useState<string>("0");
  const [depth, setDepth] = useState<string>("");
  const [depthFraction, setDepthFraction] = useState<string>("0");
  const [zipCode, setZipCode] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);
  const [doorStyle, setDoorStyle] = useState<string>("double");
  const [numDrawers, setNumDrawers] = useState<number>(2);
  const [handleStyle, setHandleStyle] = useState<string>("bar");
  const [cabinetPosition, setCabinetPosition] = useState<string>("left");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [texturePreviewOpen, setTexturePreviewOpen] = useState(false);
  const [previewFinish, setPreviewFinish] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const { savedTemplates, saveTemplate, deleteTemplate } = useSavedTemplates();

  const handleTextureClick = (finish: string) => {
    setSelectedFinish(finish);
    setPreviewFinish(finish);
  };

  const handleTextureRightClick = (e: React.MouseEvent, finish: string) => {
    e.preventDefault();
    setPreviewFinish(finish);
    setTexturePreviewOpen(true);
  };

  const handleSelectTemplate = (template: VanityTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedBrand(template.config.brand);
    setSelectedFinish(template.config.finish);
    setWidth(template.config.width);
    setWidthFraction(template.config.widthFraction);
    setHeight(template.config.height);
    setHeightFraction(template.config.heightFraction);
    setDepth(template.config.depth);
    setDepthFraction(template.config.depthFraction);
    setDoorStyle(template.config.doorStyle);
    setNumDrawers(template.config.numDrawers);
    setHandleStyle(template.config.handleStyle);
    if (template.config.cabinetPosition) {
      setCabinetPosition(template.config.cabinetPosition);
    }
    
    toast.success(`Applied ${template.name} template`, {
      description: "Customize the configuration to your needs",
    });
  };

  const handleSaveTemplate = () => {
    if (!selectedBrand || !selectedFinish || !width || !height || !depth) {
      toast.error("Please complete the configuration first", {
        description: "All dimensions and selections are required",
      });
      return;
    }
    setSaveDialogOpen(true);
  };

  const confirmSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim() || "Custom saved configuration",
      config: {
        brand: selectedBrand,
        finish: selectedFinish,
        width,
        widthFraction,
        height,
        heightFraction,
        depth,
        depthFraction,
        doorStyle,
        numDrawers,
        handleStyle,
        cabinetPosition,
      },
      tags: ["custom", selectedBrand.toLowerCase()],
    };

    saveTemplate(newTemplate);
    setSelectedTemplateId(newTemplate.id);
    
    toast.success("Template saved!", {
      description: `"${templateName}" has been saved to your templates`,
    });

    setSaveDialogOpen(false);
    setTemplateName("");
    setTemplateDescription("");
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    if (selectedTemplateId === id) {
      setSelectedTemplateId("");
    }
    toast.success("Template deleted");
  };

  const openLightbox = (imageUrl: string, imageAlt: string) => {
    setLightboxImage({ url: imageUrl, alt: imageAlt });
    setLightboxOpen(true);
  };

  // Get all available brands from BRAND_INFO
  const brands = Object.keys(BRAND_INFO);
  
  // Get finishes based on selected brand
  const availableFinishes = selectedBrand === 'Tafisa' ? TAFISA_FINISHES : 
                            selectedBrand === 'Egger' ? EGGER_FINISHES :
                            selectedBrand === 'Shinnoki' ? SHINNOKI_FINISHES : [];
  
  // Update finish when brand changes
  useEffect(() => {
    if (selectedBrand) {
      setSelectedFinish(availableFinishes[0] || '');
    }
  }, [selectedBrand]);

  // Calculate price based on linear feet (width)
  const calculatePrice = () => {
    if (!width || !selectedBrand) return 0;
    
    const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
    const linearFeet = widthInches / 12; // Convert inches to feet
    
    const pricePerLinearFoot = BRAND_INFO[selectedBrand as keyof typeof BRAND_INFO]?.price || 0;
    
    return linearFeet * pricePerLinearFoot;
  };

  const calculateTax = (subtotal: number) => {
    if (!state) return 0;
    const taxRate = TAX_RATES[state] || 0;
    return subtotal * taxRate;
  };

  const calculateShipping = () => {
    if (!state) return 0;
    return SHIPPING_RATES[state] || SHIPPING_RATES["other"];
  };

  const basePrice = calculatePrice();
  const tax = calculateTax(basePrice);
  const shipping = calculateShipping();
  const totalPrice = basePrice + tax + shipping;

  // Calculate dimensions in inches (with fractions) for 3D preview
  const dimensionsInInches = useMemo(() => {
    const widthInches = (parseFloat(width || "0") + parseInt(widthFraction) / 16);
    const heightInches = (parseFloat(height || "0") + parseInt(heightFraction) / 16);
    const depthInches = (parseFloat(depth || "0") + parseInt(depthFraction) / 16);
    return { widthInches, heightInches, depthInches };
  }, [width, widthFraction, height, heightFraction, depth, depthFraction]);

  // Determine zip code state
  useEffect(() => {
    if (zipCode.length === 5) {
      const zip = parseInt(zipCode);
      if (zip >= 10000 && zip <= 14999) setState("NY");
      else if (zip >= 7000 && zip <= 8999) setState("NJ");
      else if (zip >= 6000 && zip <= 6999) setState("CT");
      else if (zip >= 15000 && zip <= 19999) setState("PA");
      else setState("other");
    }
  }, [zipCode]);

  const handleAddToCart = () => {
    if (!selectedBrand || !selectedFinish || !width || !height || !depth || !zipCode) {
      toast.error("Please complete all fields", {
        description: "Brand, finish, measurements, and zip code are required",
      });
      return;
    }

    // Validate dimensions and zip code
    const validationResult = dimensionSchema.safeParse({
      width: parseFloat(width),
      height: parseFloat(height),
      depth: parseFloat(depth),
      zipCode
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
    const heightInches = parseFloat(height) + (parseInt(heightFraction) / 16);
    const depthInches = parseFloat(depth) + (parseInt(depthFraction) / 16);

    // Use the first available variant (custom products typically have one default variant)
    const matchingVariant = product.node.variants.edges[0];

    if (!matchingVariant) {
      toast.error("Configuration error", {
        description: "Product variant not available.",
      });
      return;
    }

    const cartItem = {
      product,
      variantId: matchingVariant.node.id,
      variantTitle: matchingVariant.node.title,
      price: {
        amount: totalPrice.toFixed(2),
        currencyCode: matchingVariant.node.price.currencyCode
      },
      quantity: 1,
      selectedOptions: [
        { name: "Brand", value: selectedBrand },
        { name: "Finish", value: selectedFinish }
      ],
      customAttributes: [
        { key: "Brand", value: selectedBrand },
        { key: "Finish", value: selectedFinish },
        { key: "Width", value: `${widthInches.toFixed(4)}"` },
        { key: "Height", value: `${heightInches.toFixed(4)}"` },
        { key: "Depth", value: `${depthInches.toFixed(4)}"` },
        { key: "Zip Code", value: zipCode },
        { key: "State", value: state || "Unknown" },
        { 
          key: "Door Style", 
          value: doorStyle === "single" ? "Single Door" : 
                 doorStyle === "double" ? "Double Doors" : 
                 doorStyle === "drawers" ? "All Drawers" : 
                 doorStyle === "mixed" ? "Drawers + Doors" :
                 doorStyle === "door-drawer-split" ? `Door + Drawer Side-by-Side (${cabinetPosition === 'left' ? 'Cabinet Left' : 'Cabinet Right'})` :
                 doorStyle === "door-shelf-split" ? `Door + Open Shelf (${cabinetPosition === 'left' ? 'Cabinet Left' : 'Cabinet Right'})` :
                 doorStyle === "open-shelves" ? "Open Shelves Only" :
                 "Custom Configuration"
        },
        { key: "Number of Drawers", value: numDrawers.toString() },
        { key: "Handle Style", value: handleStyle === "bar" ? "Bar Handles" : handleStyle === "knob" ? "Knobs" : "Push-to-Open" },
        { key: "Calculated Price", value: `$${basePrice.toFixed(2)}` },
        { key: "Tax", value: `$${tax.toFixed(2)}` },
        { key: "Shipping", value: `$${shipping.toFixed(2)}` },
        { key: "Total Estimate", value: `$${totalPrice.toFixed(2)}` },
      ],
    };

    addItem(cartItem);
    toast.success("Added to cart!", {
      description: "Your custom vanity configuration has been added. Note: Final pricing will be confirmed by our team.",
      position: "top-center",
    });
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
        {/* 3D Preview and Product Images */}
        <div className="space-y-4 lg:col-span-1">
          {/* 3D Preview */}
          <div className="animate-fade-in">
            <Vanity3DPreview
              width={dimensionsInInches.widthInches}
              height={dimensionsInInches.heightInches}
              depth={dimensionsInInches.depthInches}
              brand={selectedBrand}
              finish={selectedFinish}
              doorStyle={doorStyle}
              numDrawers={numDrawers}
              handleStyle={handleStyle}
              cabinetPosition={cabinetPosition}
            />
          </div>

          {/* Product Images */}
          {product.node.images.edges[0] && (
            <div 
              className="aspect-square overflow-hidden rounded-lg bg-secondary/20 cursor-pointer group relative touch-manipulation"
              onClick={() => openLightbox(product.node.images.edges[0].node.url, product.node.images.edges[0].node.altText || product.node.title)}
            >
              <img
                src={product.node.images.edges[0].node.url}
                alt={product.node.images.edges[0].node.altText || product.node.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-active:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-active:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-10 h-10 sm:w-12 sm:h-12 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {product.node.images.edges.slice(1).map((image, idx) => (
              <div 
                key={idx} 
                className="aspect-square overflow-hidden rounded-lg bg-secondary/20 cursor-pointer group relative touch-manipulation"
                onClick={() => openLightbox(image.node.url, image.node.altText || `${product.node.title} ${idx + 2}`)}
              >
                <img
                  src={image.node.url}
                  alt={image.node.altText || `${product.node.title} ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-active:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 group-active:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Configurator */}
      <div className="space-y-4 sm:space-y-6 lg:col-span-2 md:col-span-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.node.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {product.node.description.replace(/NY TAX/gi, 'tax').trim()}
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p>
              <strong>Available Brands:</strong> Tafisa (60+ melamine colors), Egger (98+ TFL & HPL finishes), and Shinnoki (prefinished wood veneer)
            </p>
            <p>
              <strong>Pricing:</strong> Tafisa $250/sq ft • Egger $300/sq ft • Shinnoki $350/sq ft
            </p>
            <p>
              <strong>Shipping:</strong> Approximately 14-21 business days
            </p>
          </div>
        </div>

        {/* Template Gallery */}
        <TemplateGallery 
          onSelectTemplate={handleSelectTemplate}
          selectedTemplateId={selectedTemplateId}
          savedTemplates={savedTemplates}
          onDeleteTemplate={handleDeleteTemplate}
        />

        <div className="space-y-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Vanity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* Brand Selection */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand" className="bg-background">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="cursor-pointer">
                      {brand} - ${BRAND_INFO[brand as keyof typeof BRAND_INFO]?.price}/sq ft
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBrand && (
                <p className="text-xs text-muted-foreground">
                  {BRAND_INFO[selectedBrand as keyof typeof BRAND_INFO]?.description}
                </p>
              )}
            </div>

            {/* Finish Selection */}
            <div className="space-y-2">
              <Label htmlFor="finish">
                Finish / Color {selectedBrand && `- ${selectedBrand} Collection`}
              </Label>
              <Select value={selectedFinish} onValueChange={setSelectedFinish} disabled={!selectedBrand}>
                <SelectTrigger id="finish" className="bg-background">
                  <SelectValue placeholder={selectedBrand ? "Select finish" : "Select brand first"} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-80">
                  {selectedBrand === 'Tafisa' ? (
                    // Group Tafisa colors by category
                    TAFISA_CATEGORIES.map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary/50">
                          {category}
                        </div>
                        {getTafisaColorsByCategory(category).map((color) => (
                          <SelectItem key={color.name} value={color.name} className="cursor-pointer pl-4">
                            {color.name} <span className="text-xs text-muted-foreground">({color.code})</span>
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  ) : selectedBrand === 'Egger' ? (
                    // Group Egger colors by category
                    EGGER_CATEGORIES.map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary/50">
                          {category}
                        </div>
                        {getEggerColorsByCategory(category).map((color) => (
                          <SelectItem key={color.name} value={color.name} className="cursor-pointer pl-4">
                            {color.name} <span className="text-xs text-muted-foreground">({color.code})</span>
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  ) : (
                    // Shinnoki colors without grouping
                    availableFinishes.map((finish) => (
                      <SelectItem key={finish} value={finish} className="cursor-pointer">
                        {finish}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedBrand && (
                <p className="text-xs text-muted-foreground">
                  {availableFinishes.length} finishes available for {selectedBrand}
                  {selectedBrand === 'Tafisa' && ` across ${TAFISA_CATEGORIES.length} categories`}
                  {selectedBrand === 'Egger' && ` across ${EGGER_CATEGORIES.length} categories`}
                </p>
              )}
              
              {/* Texture Swatch Gallery */}
              {selectedBrand && availableFinishes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-medium">Material Textures (Click to select, Right-click for details)</Label>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 bg-secondary/10 rounded-lg">
                    {availableFinishes.slice(0, 24).map((finish) => (
                      <div 
                        key={finish} 
                        className="flex flex-col items-center gap-1"
                        onContextMenu={(e) => handleTextureRightClick(e, finish)}
                      >
                        <TextureSwatch
                          finishName={finish}
                          brand={selectedBrand}
                          selected={selectedFinish === finish}
                          onClick={() => handleTextureClick(finish)}
                          size="md"
                        />
                        <span className="text-xs text-center text-muted-foreground max-w-[64px] truncate">
                          {finish}
                        </span>
                      </div>
                    ))}
                  </div>
                  {availableFinishes.length > 24 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Showing 24 of {availableFinishes.length} finishes. Use dropdown to see all options.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Finish Preview - Shows manufacturer image */}
            {selectedFinish && selectedBrand && (
              <FinishPreview 
                brand={selectedBrand}
                finish={selectedFinish}
              />
            )}

            {/* Width Input with Slider and Fraction */}
            <div className="space-y-3">
              <Label>Width (inches)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="0"
                  max="120"
                  className="flex-1"
                />
                <Select value={widthFraction} onValueChange={setWidthFraction}>
                  <SelectTrigger className="w-24 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="0">0"</SelectItem>
                    <SelectItem value="1">1/16"</SelectItem>
                    <SelectItem value="2">1/8"</SelectItem>
                    <SelectItem value="3">3/16"</SelectItem>
                    <SelectItem value="4">1/4"</SelectItem>
                    <SelectItem value="5">5/16"</SelectItem>
                    <SelectItem value="6">3/8"</SelectItem>
                    <SelectItem value="7">7/16"</SelectItem>
                    <SelectItem value="8">1/2"</SelectItem>
                    <SelectItem value="9">9/16"</SelectItem>
                    <SelectItem value="10">5/8"</SelectItem>
                    <SelectItem value="11">11/16"</SelectItem>
                    <SelectItem value="12">3/4"</SelectItem>
                    <SelectItem value="13">13/16"</SelectItem>
                    <SelectItem value="14">7/8"</SelectItem>
                    <SelectItem value="15">15/16"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(width || "0") * 16 + parseInt(widthFraction)]}
                  onValueChange={(value) => {
                    const totalSixteenths = value[0];
                    const wholeInches = Math.floor(totalSixteenths / 16);
                    const fraction = totalSixteenths % 16;
                    setWidth(wholeInches.toString());
                    setWidthFraction(fraction.toString());
                  }}
                  min={0}
                  max={1920}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {width || "0"}{widthFraction !== "0" && ` ${getFractionDisplay(widthFraction)}`}" 
                  {width && ` (${(parseFloat(width) + parseInt(widthFraction) / 16).toFixed(4)}")`}
                </p>
              </div>
            </div>

            {/* Height Input with Slider and Fraction */}
            <div className="space-y-3">
              <Label>Height (inches)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="0"
                  max="120"
                  className="flex-1"
                />
                <Select value={heightFraction} onValueChange={setHeightFraction}>
                  <SelectTrigger className="w-24 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="0">0"</SelectItem>
                    <SelectItem value="1">1/16"</SelectItem>
                    <SelectItem value="2">1/8"</SelectItem>
                    <SelectItem value="3">3/16"</SelectItem>
                    <SelectItem value="4">1/4"</SelectItem>
                    <SelectItem value="5">5/16"</SelectItem>
                    <SelectItem value="6">3/8"</SelectItem>
                    <SelectItem value="7">7/16"</SelectItem>
                    <SelectItem value="8">1/2"</SelectItem>
                    <SelectItem value="9">9/16"</SelectItem>
                    <SelectItem value="10">5/8"</SelectItem>
                    <SelectItem value="11">11/16"</SelectItem>
                    <SelectItem value="12">3/4"</SelectItem>
                    <SelectItem value="13">13/16"</SelectItem>
                    <SelectItem value="14">7/8"</SelectItem>
                    <SelectItem value="15">15/16"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(height || "0") * 16 + parseInt(heightFraction)]}
                  onValueChange={(value) => {
                    const totalSixteenths = value[0];
                    const wholeInches = Math.floor(totalSixteenths / 16);
                    const fraction = totalSixteenths % 16;
                    setHeight(wholeInches.toString());
                    setHeightFraction(fraction.toString());
                  }}
                  min={0}
                  max={1920}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {height || "0"}{heightFraction !== "0" && ` ${getFractionDisplay(heightFraction)}`}" 
                  {height && ` (${(parseFloat(height) + parseInt(heightFraction) / 16).toFixed(4)}")`}
                </p>
              </div>
            </div>

            {/* Depth Input with Slider and Fraction */}
            <div className="space-y-3">
              <Label>Depth (inches)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  min="0"
                  max="120"
                  className="flex-1"
                />
                <Select value={depthFraction} onValueChange={setDepthFraction}>
                  <SelectTrigger className="w-24 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="0">0"</SelectItem>
                    <SelectItem value="1">1/16"</SelectItem>
                    <SelectItem value="2">1/8"</SelectItem>
                    <SelectItem value="3">3/16"</SelectItem>
                    <SelectItem value="4">1/4"</SelectItem>
                    <SelectItem value="5">5/16"</SelectItem>
                    <SelectItem value="6">3/8"</SelectItem>
                    <SelectItem value="7">7/16"</SelectItem>
                    <SelectItem value="8">1/2"</SelectItem>
                    <SelectItem value="9">9/16"</SelectItem>
                    <SelectItem value="10">5/8"</SelectItem>
                    <SelectItem value="11">11/16"</SelectItem>
                    <SelectItem value="12">3/4"</SelectItem>
                    <SelectItem value="13">13/16"</SelectItem>
                    <SelectItem value="14">7/8"</SelectItem>
                    <SelectItem value="15">15/16"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[parseFloat(depth || "0") * 16 + parseInt(depthFraction)]}
                  onValueChange={(value) => {
                    const totalSixteenths = value[0];
                    const wholeInches = Math.floor(totalSixteenths / 16);
                    const fraction = totalSixteenths % 16;
                    setDepth(wholeInches.toString());
                    setDepthFraction(fraction.toString());
                  }}
                  min={0}
                  max={1920}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {depth || "0"}{depthFraction !== "0" && ` ${getFractionDisplay(depthFraction)}`}" 
                  {depth && ` (${(parseFloat(depth) + parseInt(depthFraction) / 16).toFixed(4)}")`}
                </p>
              </div>
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code (for shipping)</Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="12345"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                maxLength={5}
              />
              {state && (
                <p className="text-sm text-muted-foreground">
                  Detected state: {state}
                </p>
              )}
            </div>

            {/* Door Style Selection */}
            <div className="space-y-2">
              <Label htmlFor="doorStyle">Cabinet Configuration</Label>
              <Select value={doorStyle} onValueChange={setDoorStyle}>
                <SelectTrigger id="doorStyle" className="bg-background">
                  <SelectValue placeholder="Select configuration" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="single">Single Door</SelectItem>
                  <SelectItem value="double">Double Doors</SelectItem>
                  <SelectItem value="drawers">All Drawers</SelectItem>
                  <SelectItem value="mixed">Drawers + Doors</SelectItem>
                  <SelectItem value="door-drawer-split">Door + Drawer Side-by-Side</SelectItem>
                  <SelectItem value="door-shelf-split">Door + Open Shelf Side-by-Side</SelectItem>
                  <SelectItem value="open-shelves">Open Shelves Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {doorStyle === 'single' && 'One large door for full access'}
                {doorStyle === 'double' && 'Two doors opening from center'}
                {doorStyle === 'drawers' && 'Multiple drawers for organized storage'}
                {doorStyle === 'mixed' && 'Drawers on top, cabinet doors below'}
                {doorStyle === 'door-drawer-split' && 'Door and drawers side-by-side'}
                {doorStyle === 'door-shelf-split' && 'Door with open shelf storage'}
                {doorStyle === 'open-shelves' && 'Open shelving for easy access'}
              </p>
            </div>

            {/* Position selector for split configurations */}
            {(doorStyle === 'door-drawer-split' || doorStyle === 'door-shelf-split') && (
              <div className="space-y-2">
                <Label htmlFor="cabinetPosition">Cabinet Position</Label>
                <Select value={cabinetPosition} onValueChange={setCabinetPosition}>
                  <SelectTrigger id="cabinetPosition" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="left">Cabinet on Left</SelectItem>
                    <SelectItem value="right">Cabinet on Right</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {cabinetPosition === 'left' ? 'Door/drawers on the left side' : 'Door/drawers on the right side'}
                </p>
              </div>
            )}

            {/* Number of Drawers (only show if drawers or mixed or door-drawer-split) */}
            {(doorStyle === 'drawers' || doorStyle === 'mixed' || doorStyle === 'door-drawer-split') && (
              <div className="space-y-2">
                <Label htmlFor="numDrawers">Number of Drawers</Label>
                <Select value={numDrawers.toString()} onValueChange={(val) => setNumDrawers(parseInt(val))}>
                  <SelectTrigger id="numDrawers" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="1">1 Drawer</SelectItem>
                    <SelectItem value="2">2 Drawers</SelectItem>
                    <SelectItem value="3">3 Drawers</SelectItem>
                    <SelectItem value="4">4 Drawers</SelectItem>
                    <SelectItem value="5">5 Drawers</SelectItem>
                    <SelectItem value="6">6 Drawers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Handle Style Selection (hide for open shelves) */}
            {doorStyle !== 'open-shelves' && (
              <div className="space-y-2">
                <Label htmlFor="handleStyle">Handle Style</Label>
                <Select value={handleStyle} onValueChange={setHandleStyle}>
                  <SelectTrigger id="handleStyle" className="bg-background">
                    <SelectValue placeholder="Select handle style" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="bar">Bar Handles</SelectItem>
                    <SelectItem value="knob">Knobs</SelectItem>
                    <SelectItem value="recessed">Push-to-Open (No Handles)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {handleStyle === 'bar' && 'Modern horizontal bar handles'}
                  {handleStyle === 'knob' && 'Classic round knob handles'}
                  {handleStyle === 'recessed' && 'Minimalist handleless design with push mechanism'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Price Breakdown */}
        {basePrice > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price ({selectedBrand}):</span>
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Sales Tax ({state} - {(TAX_RATES[state] * 100).toFixed(3)}%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Shipping to {state}:</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/50 p-4 rounded-lg text-sm">
          <p className="text-muted-foreground">
            <strong>Note:</strong> Cart uses base Shopify pricing. Your custom dimensions and calculated price (${totalPrice.toFixed(2)}) will be included in the order details for manual price adjustment.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleSaveTemplate} 
            variant="outline"
            className="flex-1 touch-manipulation" 
            size="lg"
          >
            <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Save Template</span>
          </Button>
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 touch-manipulation" 
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Add to Cart</span>
          </Button>
        </div>
      </div>
    </div>

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration as Template</DialogTitle>
            <DialogDescription>
              Save your current configuration to quickly access it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Master Bathroom Vanity"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (optional)</Label>
              <Input
                id="template-description"
                placeholder="e.g., Double door with modern finish"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <p className="font-medium">Current Configuration:</p>
              <p className="text-muted-foreground">
                {selectedBrand} - {selectedFinish} • {width}×{height}×{depth}" • {doorStyle}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSaveTemplate}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-[95vw] sm:w-full p-2 sm:p-6">
          {lightboxImage && (
            <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Texture Preview Modal */}
      {previewFinish && (
        <TexturePreviewModal
          open={texturePreviewOpen}
          onOpenChange={setTexturePreviewOpen}
          finishName={previewFinish}
          brand={selectedBrand}
        />
      )}
    </>
  );
};
