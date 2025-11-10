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
import { ShoppingCart, ZoomIn, Save, Maximize2, X, Plus, FileDown } from "lucide-react";
import { FinishPreview } from "./FinishPreview";
import { Checkbox } from "@/components/ui/checkbox";
import logoImage from "@/assets/logo.jpg";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  
  // Wall configuration
  const [includeWalls, setIncludeWalls] = useState(false);
  const [wallWidth, setWallWidth] = useState<string>("");
  const [wallHeight, setWallHeight] = useState<string>("");
  const [hasWindow, setHasWindow] = useState(false);
  const [hasDoor, setHasDoor] = useState(false);
  const [hasMedicineCabinet, setHasMedicineCabinet] = useState(false);
  const [medicineCabinetDoorType, setMedicineCabinetDoorType] = useState<string>("mirror");
  
  // Room & Floor configuration
  const [includeRoom, setIncludeRoom] = useState(false);
  const [roomLength, setRoomLength] = useState<string>("");
  const [roomWidth, setRoomWidth] = useState<string>("");
  const [floorType, setFloorType] = useState<string>("tile");
  const [tileColor, setTileColor] = useState<string>("white-marble");
  const [woodFloorFinish, setWoodFloorFinish] = useState<string>("natural-oak");
  
  // Lighting configuration
  const [lightingType, setLightingType] = useState<string>("recessed");
  const [brightness, setBrightness] = useState<number>(80);
  const [colorTemperature, setColorTemperature] = useState<number>(4000);
  
  // Bathroom fixtures state
  const [includeToilet, setIncludeToilet] = useState(false);
  const [toiletStyle, setToiletStyle] = useState<'modern' | 'traditional' | 'wall-mounted'>('modern');
  const [toiletPosition, setToiletPosition] = useState<'left' | 'right'>('left');
  const [includeShower, setIncludeShower] = useState(false);
  const [showerStyle, setShowerStyle] = useState<'walk-in' | 'enclosed' | 'corner'>('walk-in');
  const [includeBathtub, setIncludeBathtub] = useState(false);
  const [bathtubStyle, setBathtubStyle] = useState<'freestanding' | 'alcove' | 'corner'>('freestanding');
  const [bathtubPosition, setBathtubPosition] = useState<'left' | 'right' | 'back'>('back');
  
  // Wall finish state
  const [wallFinishType, setWallFinishType] = useState<'paint' | 'tile'>('paint');
  const [wallPaintColor, setWallPaintColor] = useState<string>('white');
  const [wallTileColor, setWallTileColor] = useState<string>('white-subway');
  
  // Mirror and medicine cabinet state
  const [includeMirror, setIncludeMirror] = useState(true);
  const [mirrorType, setMirrorType] = useState<'mirror' | 'medicine-cabinet'>('mirror');
  const [mirrorSize, setMirrorSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [mirrorShape, setMirrorShape] = useState<'rectangular' | 'round' | 'oval' | 'arched'>('rectangular');
  const [mirrorFrame, setMirrorFrame] = useState<'none' | 'black' | 'chrome' | 'gold' | 'wood'>('chrome');
  
  // Bathroom accessories state
  const [includeTowelBar, setIncludeTowelBar] = useState(false);
  const [towelBarPosition, setTowelBarPosition] = useState<'left' | 'right' | 'center'>('center');
  const [includeToiletPaperHolder, setIncludeToiletPaperHolder] = useState(false);
  const [includeRobeHooks, setIncludeRobeHooks] = useState(false);
  const [robeHookCount, setRobeHookCount] = useState(2);
  const [includeShelving, setIncludeShelving] = useState(false);
  const [shelvingType, setShelvingType] = useState<'floating' | 'corner' | 'ladder'>('floating');
  
  // Faucet and fixtures state
  const [includeFaucet, setIncludeFaucet] = useState(true);
  const [faucetStyle, setFaucetStyle] = useState<'modern' | 'traditional' | 'waterfall'>('modern');
  const [faucetFinish, setFaucetFinish] = useState<'chrome' | 'brushed-nickel' | 'matte-black' | 'gold'>('chrome');
  
  // Countertop state
  const [countertopMaterial, setCountertopMaterial] = useState<'marble' | 'quartz' | 'granite'>('quartz');
  const [countertopEdge, setCountertopEdge] = useState<'straight' | 'beveled' | 'bullnose' | 'waterfall'>('straight');
  const [countertopColor, setCountertopColor] = useState<string>('white');
  
  // Sink state
  const [sinkStyle, setSinkStyle] = useState<'undermount' | 'vessel' | 'integrated'>('undermount');
  const [sinkShape, setSinkShape] = useState<'oval' | 'rectangular' | 'square'>('oval');
  
  // Backsplash state
  const [includeBacksplash, setIncludeBacksplash] = useState(false);
  const [backsplashMaterial, setBacksplashMaterial] = useState<'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone'>('subway-tile');
  const [backsplashHeight, setBacksplashHeight] = useState<'4-inch' | 'full-height'>('4-inch');
  
  // Vanity lighting state
  const [includeVanityLighting, setIncludeVanityLighting] = useState(true);
  const [vanityLightingStyle, setVanityLightingStyle] = useState<'sconce' | 'led-strip' | 'pendant'>('sconce');
  const [vanityLightBrightness, setVanityLightBrightness] = useState<number>(85);
  const [vanityLightTemp, setVanityLightTemp] = useState<number>(3000);
  
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

  // Calculate wall price
  const calculateWallPrice = () => {
    if (!includeWalls || !wallWidth) return 0;
    const widthInches = parseFloat(wallWidth);
    const linearFeet = widthInches / 12;
    return linearFeet * 200; // $200 per linear foot
  };

  // Calculate floor price
  const calculateFloorPrice = () => {
    if (!includeRoom || !roomLength || !roomWidth) return 0;
    const lengthFeet = parseFloat(roomLength);
    const widthFeet = parseFloat(roomWidth);
    const squareFeet = lengthFeet * widthFeet;
    
    // Tile: $15/sqft, Wood: $12/sqft
    const pricePerSqFt = floorType === "tile" ? 15 : 12;
    return squareFeet * pricePerSqFt;
  };

  const basePrice = calculatePrice();
  const wallPrice = calculateWallPrice();
  const floorPrice = calculateFloorPrice();
  const subtotal = basePrice + wallPrice + floorPrice;
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping();
  const totalPrice = subtotal + tax + shipping;

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

    if (includeWalls && (!wallWidth || !wallHeight)) {
      toast.error("Please complete wall dimensions", {
        description: "Wall width and height are required when walls are included",
      });
      return;
    }

    if (includeRoom && (!roomLength || !roomWidth)) {
      toast.error("Please complete room dimensions", {
        description: "Room length and width are required when room layout is included",
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
        ...(includeWalls ? [
          { key: "Includes Walls", value: "Yes" },
          { key: "Wall Dimensions", value: `${wallWidth}" W × ${wallHeight}" H` },
          { key: "Wall Features", value: [
            hasWindow && "Window",
            hasDoor && "Door", 
            hasMedicineCabinet && `Medicine Cabinet (${medicineCabinetDoorType === "mirror" ? "Mirror Door" : "Glass Door"})`
          ].filter(Boolean).join(", ") || "None" },
          { key: "Wall Price", value: `$${wallPrice.toFixed(2)}` },
        ] : []),
        ...(includeRoom ? [
          { key: "Includes Room Layout", value: "Yes" },
          { key: "Room Dimensions", value: `${roomLength}' × ${roomWidth}'` },
          { key: "Floor Type", value: floorType === "tile" ? "Tile" : "Wood" },
          { key: "Floor Finish", value: floorType === "tile" ? tileColor.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : woodFloorFinish.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) },
          { key: "Floor Square Feet", value: `${(parseFloat(roomLength) * parseFloat(roomWidth)).toFixed(2)} sq ft` },
          { key: "Floor Price", value: `$${floorPrice.toFixed(2)}` },
        ] : []),
        { key: "Vanity Price", value: `$${basePrice.toFixed(2)}` },
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

  const handleExportPDF = async () => {
    if (!selectedBrand || !selectedFinish || !width || !height || !depth) {
      toast.error("Please complete the configuration first", {
        description: "All dimensions and selections are required",
      });
      return;
    }

    toast.info("Generating PDF specification sheet...", {
      description: "This may take a few moments",
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custom Vanity Specification Sheet', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setDrawColor(0);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Dimensions Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text('Dimensions', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
      const heightInches = parseFloat(height) + (parseInt(heightFraction) / 16);
      const depthInches = parseFloat(depth) + (parseInt(depthFraction) / 16);
      
      pdf.text(`Width: ${widthInches.toFixed(2)}" (${(widthInches / 12).toFixed(2)} linear feet)`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Height: ${heightInches.toFixed(2)}"`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Depth: ${depthInches.toFixed(2)}"`, 25, yPosition);
      yPosition += 10;

      // Cabinet Configuration
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cabinet Configuration', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Brand: ${selectedBrand}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Finish: ${selectedFinish}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Door Style: ${doorStyle.charAt(0).toUpperCase() + doorStyle.slice(1)}`, 25, yPosition);
      yPosition += 6;
      if (doorStyle === 'drawers') {
        pdf.text(`Number of Drawers: ${numDrawers}`, 25, yPosition);
        yPosition += 6;
      }
      pdf.text(`Handle Style: ${handleStyle.charAt(0).toUpperCase() + handleStyle.slice(1)}`, 25, yPosition);
      yPosition += 10;

      // Countertop & Sink
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Countertop & Sink', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Countertop Material: ${countertopMaterial.charAt(0).toUpperCase() + countertopMaterial.slice(1)}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Edge Profile: ${countertopEdge.charAt(0).toUpperCase() + countertopEdge.slice(1)}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Countertop Color: ${countertopColor}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Sink Style: ${sinkStyle.charAt(0).toUpperCase() + sinkStyle.slice(1)}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Sink Shape: ${sinkShape.charAt(0).toUpperCase() + sinkShape.slice(1)}`, 25, yPosition);
      yPosition += 10;

      // Fixtures & Lighting
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fixtures & Lighting', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      if (includeFaucet) {
        pdf.text(`Faucet Style: ${faucetStyle.charAt(0).toUpperCase() + faucetStyle.slice(1)}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Faucet Finish: ${faucetFinish.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`, 25, yPosition);
        yPosition += 6;
      }
      if (includeBacksplash) {
        pdf.text(`Backsplash: ${backsplashMaterial.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} (${backsplashHeight === '4-inch' ? '4 inches' : 'Full height'})`, 25, yPosition);
        yPosition += 6;
      }
      if (includeVanityLighting) {
        pdf.text(`Vanity Lighting: ${vanityLightingStyle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Brightness: ${vanityLightBrightness}%, Color Temp: ${vanityLightTemp}K`, 25, yPosition);
        yPosition += 6;
      }
      
      // Mirror
      if (includeMirror) {
        yPosition += 4;
        pdf.text(`Mirror: ${mirrorSize.charAt(0).toUpperCase() + mirrorSize.slice(1)} ${mirrorShape} with ${mirrorFrame} frame`, 25, yPosition);
        yPosition += 6;
      }

      // Pricing Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pricing Summary', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Vanity Base Price: $${basePrice.toFixed(2)}`, 25, yPosition);
      yPosition += 6;
      
      if (includeWalls && wallPrice > 0) {
        pdf.text(`Wall Price: $${wallPrice.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (includeRoom && floorPrice > 0) {
        pdf.text(`Floor Price: $${floorPrice.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      }
      
      if (zipCode) {
        pdf.text(`Tax (${state}): $${tax.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Shipping: $${shipping.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      }
      
      yPosition += 4;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Estimate: $${totalPrice.toFixed(2)}`, 25, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100);
      pdf.text('Note: This is an estimate. Final pricing will be confirmed by our team.', 25, yPosition);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      const footerY = pageHeight - 10;
      pdf.text('Green Cabinets - Custom Bathroom Vanities', pageWidth / 2, footerY, { align: 'center' });

      // Save PDF
      const fileName = `Vanity-Spec-${Date.now()}.pdf`;
      pdf.save(fileName);

      toast.success("PDF generated successfully!", {
        description: `Saved as ${fileName}`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", {
        description: "Please try again",
      });
    }
  };

  return (
    <>
      {/* Fullscreen Preview Mode */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Header with Logo */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt="Green Cabinets" className="h-10 w-auto" />
                <div className="hidden sm:block">
                  <h2 className="text-lg font-bold">Custom Vanity Configurator</h2>
                  <p className="text-xs text-muted-foreground">Real-time 3D Preview</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreenPreview(false)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-full pt-16">
            {/* Controls Sidebar */}
            <div className="w-80 xl:w-96 border-r border-border overflow-y-auto bg-background/50 backdrop-blur-sm">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Brand & Finish</h3>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand} - ${BRAND_INFO[brand as keyof typeof BRAND_INFO]?.price}/lf
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-60">
                      {availableFinishes.map((finish) => (
                        <SelectItem key={finish} value={finish}>
                          {finish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Texture Swatches */}
                  {selectedBrand && availableFinishes.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-secondary/10 rounded-lg max-h-40 overflow-y-auto">
                      {availableFinishes.slice(0, 12).map((finish) => (
                        <TextureSwatch
                          key={finish}
                          finishName={finish}
                          brand={selectedBrand}
                          selected={selectedFinish === finish}
                          onClick={() => handleTextureClick(finish)}
                          size="sm"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Dimensions</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Depth</Label>
                      <Input
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Configuration</h3>
                  <Select value={doorStyle} onValueChange={setDoorStyle}>
                    <SelectTrigger className="bg-background h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="single">Single Door</SelectItem>
                      <SelectItem value="double">Double Doors</SelectItem>
                      <SelectItem value="drawers">All Drawers</SelectItem>
                      <SelectItem value="mixed">Drawers + Doors</SelectItem>
                      <SelectItem value="door-drawer-split">Door + Drawer</SelectItem>
                      <SelectItem value="door-shelf-split">Door + Shelf</SelectItem>
                      <SelectItem value="open-shelves">Open Shelves</SelectItem>
                    </SelectContent>
                  </Select>

                  {(doorStyle === 'drawers' || doorStyle === 'mixed' || doorStyle === 'door-drawer-split') && (
                    <Select value={numDrawers.toString()} onValueChange={(val) => setNumDrawers(parseInt(val))}>
                      <SelectTrigger className="bg-background h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Drawer{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {doorStyle !== 'open-shelves' && (
                    <Select value={handleStyle} onValueChange={setHandleStyle}>
                      <SelectTrigger className="bg-background h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="bar">Bar Handles</SelectItem>
                        <SelectItem value="knob">Knobs</SelectItem>
                        <SelectItem value="recessed">Push-to-Open</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center justify-between">
                    <span>Room Layout</span>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id="fs-includeRoom"
                        checked={includeRoom}
                        onCheckedChange={(checked) => setIncludeRoom(checked as boolean)}
                      />
                      <Label htmlFor="fs-includeRoom" className="text-xs font-normal cursor-pointer">
                        Include
                      </Label>
                    </div>
                  </h3>
                  {includeRoom && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Length (ft)"
                          value={roomLength}
                          onChange={(e) => setRoomLength(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Width (ft)"
                          value={roomWidth}
                          onChange={(e) => setRoomWidth(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <Select value={floorType} onValueChange={setFloorType}>
                        <SelectTrigger className="bg-background h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-[100]">
                          <SelectItem value="tile">Tile ($15/sqft)</SelectItem>
                          <SelectItem value="wood">Wood ($12/sqft)</SelectItem>
                        </SelectContent>
                      </Select>
                      {floorType === "tile" ? (
                        <Select value={tileColor} onValueChange={setTileColor}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="white-marble">White Marble</SelectItem>
                            <SelectItem value="gray-marble">Gray Marble</SelectItem>
                            <SelectItem value="black-marble">Black Marble</SelectItem>
                            <SelectItem value="cream-travertine">Cream Travertine</SelectItem>
                            <SelectItem value="beige-porcelain">Beige Porcelain</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={woodFloorFinish} onValueChange={setWoodFloorFinish}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="natural-oak">Natural Oak</SelectItem>
                            <SelectItem value="honey-oak">Honey Oak</SelectItem>
                            <SelectItem value="dark-walnut">Dark Walnut</SelectItem>
                            <SelectItem value="gray-oak">Gray Oak</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {/* Lighting Controls in Fullscreen */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <Label className="text-xs font-medium">Lighting</Label>
                        <Select value={lightingType} onValueChange={setLightingType}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="recessed">Recessed</SelectItem>
                            <SelectItem value="sconce">Sconces</SelectItem>
                            <SelectItem value="pendant">Pendant</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Brightness: {brightness}%</Label>
                          </div>
                          <Slider
                            value={[brightness]}
                            onValueChange={(value) => setBrightness(value[0])}
                            min={20}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      {/* Wall Finishes Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <Label className="text-xs font-medium">Wall Finishes</Label>
                        <Select value={wallFinishType} onValueChange={(value: any) => setWallFinishType(value)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="paint">Paint</SelectItem>
                            <SelectItem value="tile">Tile</SelectItem>
                          </SelectContent>
                        </Select>
                        {wallFinishType === 'paint' ? (
                          <Select value={wallPaintColor} onValueChange={setWallPaintColor}>
                            <SelectTrigger className="bg-background h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              <SelectItem value="white">White</SelectItem>
                              <SelectItem value="beige">Beige</SelectItem>
                              <SelectItem value="light-gray">Light Gray</SelectItem>
                              <SelectItem value="sage-green">Sage Green</SelectItem>
                              <SelectItem value="light-blue">Light Blue</SelectItem>
                              <SelectItem value="cream">Cream</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select value={wallTileColor} onValueChange={setWallTileColor}>
                            <SelectTrigger className="bg-background h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              <SelectItem value="white-subway">White Subway</SelectItem>
                              <SelectItem value="gray-subway">Gray Subway</SelectItem>
                              <SelectItem value="marble">Marble</SelectItem>
                              <SelectItem value="travertine">Travertine</SelectItem>
                              <SelectItem value="porcelain">Porcelain</SelectItem>
                              <SelectItem value="mosaic">Mosaic</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      {/* Faucet & Fixtures Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeFaucetFullscreen" 
                            checked={includeFaucet}
                            onCheckedChange={(checked) => setIncludeFaucet(checked as boolean)}
                          />
                          <Label htmlFor="includeFaucetFullscreen" className="text-xs font-medium cursor-pointer">
                            Include Faucet
                          </Label>
                        </div>
                        {includeFaucet && (
                          <>
                            <Select value={faucetStyle} onValueChange={(value: any) => setFaucetStyle(value)}>
                              <SelectTrigger className="bg-background h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[100]">
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="traditional">Traditional</SelectItem>
                                <SelectItem value="waterfall">Waterfall</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={faucetFinish} onValueChange={(value: any) => setFaucetFinish(value)}>
                              <SelectTrigger className="bg-background h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[100]">
                                <SelectItem value="chrome">Chrome</SelectItem>
                                <SelectItem value="brushed-nickel">Brushed Nickel</SelectItem>
                                <SelectItem value="matte-black">Matte Black</SelectItem>
                                <SelectItem value="gold">Gold</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </div>
                      
                      {/* Countertop Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <Label className="text-xs font-medium">Countertop</Label>
                        <Select value={countertopMaterial} onValueChange={(value: any) => setCountertopMaterial(value)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="marble">Marble</SelectItem>
                            <SelectItem value="quartz">Quartz</SelectItem>
                            <SelectItem value="granite">Granite</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={countertopColor} onValueChange={setCountertopColor}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="cream">Cream</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="beige">Beige</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={countertopEdge} onValueChange={(value: any) => setCountertopEdge(value)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="straight">Straight</SelectItem>
                            <SelectItem value="beveled">Beveled</SelectItem>
                            <SelectItem value="bullnose">Bullnose</SelectItem>
                            <SelectItem value="waterfall">Waterfall</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Sink Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <Label className="text-xs font-medium">Sink</Label>
                        <Select value={sinkStyle} onValueChange={(value: any) => setSinkStyle(value)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="undermount">Undermount</SelectItem>
                            <SelectItem value="vessel">Vessel</SelectItem>
                            <SelectItem value="integrated">Integrated</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={sinkShape} onValueChange={(value: any) => setSinkShape(value)}>
                          <SelectTrigger className="bg-background h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background z-[100]">
                            <SelectItem value="oval">Oval</SelectItem>
                            <SelectItem value="rectangular">Rectangular</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                      
                      {/* Backsplash Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Backsplash</Label>
                          <Checkbox 
                            id="includeBacksplashFullscreen" 
                            checked={includeBacksplash}
                            onCheckedChange={(checked) => setIncludeBacksplash(checked as boolean)}
                          />
                        </div>
                        {includeBacksplash && (
                          <>
                            <Select value={backsplashMaterial} onValueChange={(value: any) => setBacksplashMaterial(value)}>
                              <SelectTrigger className="bg-background h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[100]">
                                <SelectItem value="subway-tile">Subway Tile</SelectItem>
                                <SelectItem value="marble-slab">Marble Slab</SelectItem>
                                <SelectItem value="glass-tile">Glass Tile</SelectItem>
                                <SelectItem value="stone">Stone</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={backsplashHeight} onValueChange={(value: any) => setBacksplashHeight(value)}>
                              <SelectTrigger className="bg-background h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[100]">
                                <SelectItem value="4-inch">4 Inches</SelectItem>
                                <SelectItem value="full-height">Full Height</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </div>
                      
                      {/* Vanity Lighting Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Vanity Lighting</Label>
                          <Checkbox 
                            id="includeVanityLightingFullscreen" 
                            checked={includeVanityLighting}
                            onCheckedChange={(checked) => setIncludeVanityLighting(checked as boolean)}
                          />
                        </div>
                        {includeVanityLighting && (
                          <>
                            <Select value={vanityLightingStyle} onValueChange={(value: any) => setVanityLightingStyle(value)}>
                              <SelectTrigger className="bg-background h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background z-[100]">
                                <SelectItem value="sconce">Sconces</SelectItem>
                                <SelectItem value="led-strip">LED Strip</SelectItem>
                                <SelectItem value="pendant">Pendants</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Brightness</span>
                                <span>{vanityLightBrightness}%</span>
                              </div>
                              <Slider
                                value={[vanityLightBrightness]}
                                onValueChange={(value) => setVanityLightBrightness(value[0])}
                                min={30}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Temp</span>
                                <span>{vanityLightTemp}K</span>
                              </div>
                              <Slider
                                value={[vanityLightTemp]}
                                onValueChange={(value) => setVanityLightTemp(value[0])}
                                min={2700}
                                max={6500}
                                step={100}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Bathroom Accessories Controls */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <Label className="text-xs font-medium">Accessories</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeTowelBarFullscreen" 
                            checked={includeTowelBar}
                            onCheckedChange={(checked) => setIncludeTowelBar(checked as boolean)}
                          />
                          <Label htmlFor="includeTowelBarFullscreen" className="text-xs cursor-pointer">
                            Towel Bar
                          </Label>
                        </div>
                        {includeTowelBar && (
                          <Select value={towelBarPosition} onValueChange={(value: any) => setTowelBarPosition(value)}>
                            <SelectTrigger className="bg-background h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeShelvingFullscreen" 
                            checked={includeShelving}
                            onCheckedChange={(checked) => setIncludeShelving(checked as boolean)}
                          />
                          <Label htmlFor="includeShelvingFullscreen" className="text-xs cursor-pointer">
                            Shelving
                          </Label>
                        </div>
                        {includeShelving && (
                          <Select value={shelvingType} onValueChange={(value: any) => setShelvingType(value)}>
                            <SelectTrigger className="bg-background h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-[100]">
                              <SelectItem value="floating">Floating</SelectItem>
                              <SelectItem value="corner">Corner</SelectItem>
                              <SelectItem value="ladder">Ladder</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {basePrice > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <h3 className="font-semibold text-sm">Price Summary</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vanity:</span>
                        <span className="font-medium">${basePrice.toFixed(2)}</span>
                      </div>
                      {includeWalls && wallPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Walls:</span>
                          <span className="font-medium">${wallPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {includeRoom && floorPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Flooring:</span>
                          <span className="font-medium">${floorPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {((includeWalls && wallPrice > 0) || (includeRoom && floorPrice > 0)) && (
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax:</span>
                          <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                      )}
                      {shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping:</span>
                          <span className="font-medium">${shipping.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3D Preview */}
            <div className="flex-1">
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
                fullscreen={true}
                includeRoom={includeRoom}
                roomLength={roomLength ? parseFloat(roomLength) * 12 : 0}
                roomWidth={roomWidth ? parseFloat(roomWidth) * 12 : 0}
                roomHeight={wallHeight ? parseFloat(wallHeight) : 96}
                floorType={floorType}
                tileColor={tileColor}
                woodFloorFinish={woodFloorFinish}
                includeWalls={includeWalls}
                hasWindow={hasWindow}
                hasDoor={hasDoor}
        lightingType={lightingType}
        brightness={brightness}
        colorTemperature={colorTemperature}
        includeToilet={includeToilet}
        toiletStyle={toiletStyle}
        toiletPosition={toiletPosition}
        includeShower={includeShower}
        showerStyle={showerStyle}
        includeBathtub={includeBathtub}
        bathtubStyle={bathtubStyle}
        bathtubPosition={bathtubPosition}
        wallFinishType={wallFinishType}
        wallPaintColor={wallPaintColor}
        wallTileColor={wallTileColor}
        includeMirror={includeMirror}
        mirrorType={mirrorType}
        mirrorSize={mirrorSize}
        mirrorShape={mirrorShape}
        mirrorFrame={mirrorFrame}
        includeTowelBar={includeTowelBar}
        towelBarPosition={towelBarPosition}
        includeToiletPaperHolder={includeToiletPaperHolder}
              includeRobeHooks={includeRobeHooks}
              robeHookCount={robeHookCount}
              includeShelving={includeShelving}
              shelvingType={shelvingType}
        includeFaucet={includeFaucet}
        faucetStyle={faucetStyle}
        faucetFinish={faucetFinish}
        countertopMaterial={countertopMaterial}
        countertopEdge={countertopEdge}
        countertopColor={countertopColor}
        sinkStyle={sinkStyle}
        sinkShape={sinkShape}
        includeBacksplash={includeBacksplash}
        backsplashMaterial={backsplashMaterial}
        backsplashHeight={backsplashHeight}
        includeVanityLighting={includeVanityLighting}
        vanityLightingStyle={vanityLightingStyle}
        vanityLightBrightness={vanityLightBrightness}
        vanityLightTemp={vanityLightTemp}
      />
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
        {/* 3D Preview and Product Images */}
        <div className="space-y-4 lg:col-span-1">
          {/* 3D Preview */}
          <div className="animate-fade-in relative group">
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
              includeRoom={includeRoom}
              roomLength={roomLength ? parseFloat(roomLength) * 12 : 0}
              roomWidth={roomWidth ? parseFloat(roomWidth) * 12 : 0}
              roomHeight={wallHeight ? parseFloat(wallHeight) : 96}
              floorType={floorType}
              tileColor={tileColor}
              woodFloorFinish={woodFloorFinish}
              includeWalls={includeWalls}
              hasWindow={hasWindow}
              hasDoor={hasDoor}
              lightingType={lightingType}
              brightness={brightness}
              colorTemperature={colorTemperature}
              includeToilet={includeToilet}
              toiletStyle={toiletStyle}
              toiletPosition={toiletPosition}
              includeShower={includeShower}
              showerStyle={showerStyle}
              includeBathtub={includeBathtub}
              bathtubStyle={bathtubStyle}
              bathtubPosition={bathtubPosition}
              wallFinishType={wallFinishType}
              wallPaintColor={wallPaintColor}
              wallTileColor={wallTileColor}
              includeMirror={includeMirror}
              mirrorType={mirrorType}
              mirrorSize={mirrorSize}
              mirrorShape={mirrorShape}
              mirrorFrame={mirrorFrame}
              includeTowelBar={includeTowelBar}
              towelBarPosition={towelBarPosition}
              includeToiletPaperHolder={includeToiletPaperHolder}
        includeRobeHooks={includeRobeHooks}
        robeHookCount={robeHookCount}
        includeShelving={includeShelving}
        shelvingType={shelvingType}
              includeFaucet={includeFaucet}
              faucetStyle={faucetStyle}
              faucetFinish={faucetFinish}
              countertopMaterial={countertopMaterial}
              countertopEdge={countertopEdge}
              countertopColor={countertopColor}
              sinkStyle={sinkStyle}
              sinkShape={sinkShape}
              includeBacksplash={includeBacksplash}
              backsplashMaterial={backsplashMaterial}
              backsplashHeight={backsplashHeight}
              includeVanityLighting={includeVanityLighting}
              vanityLightingStyle={vanityLightingStyle}
              vanityLightBrightness={vanityLightBrightness}
              vanityLightTemp={vanityLightTemp}
            />
            {/* Fullscreen Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFullscreenPreview(true)}
              className="absolute bottom-20 right-4 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
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
              <strong>Pricing:</strong> Tafisa $250/linear foot • Egger $300/linear foot • Shinnoki $350/linear foot
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
                      {brand} - ${BRAND_INFO[brand as keyof typeof BRAND_INFO]?.price}/linear foot
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

        {/* Wall Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Wall Configuration</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeWalls"
                  checked={includeWalls}
                  onCheckedChange={(checked) => setIncludeWalls(checked as boolean)}
                />
                <Label htmlFor="includeWalls" className="text-sm font-normal cursor-pointer">
                  Include Walls
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          {includeWalls && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add custom walls with windows, doors, and medicine cabinets. Priced at $200 per linear foot.
              </p>

              {/* Wall Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallWidth">Wall Width (inches)</Label>
                  <Input
                    id="wallWidth"
                    type="number"
                    placeholder="Width"
                    value={wallWidth}
                    onChange={(e) => setWallWidth(e.target.value)}
                    min="0"
                    max="240"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wallHeight">Wall Height (inches)</Label>
                  <Input
                    id="wallHeight"
                    type="number"
                    placeholder="Height"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              {/* Wall Features */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Wall Features</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasWindow"
                    checked={hasWindow}
                    onCheckedChange={(checked) => setHasWindow(checked as boolean)}
                  />
                  <Label htmlFor="hasWindow" className="text-sm font-normal cursor-pointer">
                    Include Window
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDoor"
                    checked={hasDoor}
                    onCheckedChange={(checked) => setHasDoor(checked as boolean)}
                  />
                  <Label htmlFor="hasDoor" className="text-sm font-normal cursor-pointer">
                    Include Door
                  </Label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasMedicineCabinet"
                      checked={hasMedicineCabinet}
                      onCheckedChange={(checked) => setHasMedicineCabinet(checked as boolean)}
                    />
                    <Label htmlFor="hasMedicineCabinet" className="text-sm font-normal cursor-pointer">
                      Include Medicine Cabinet
                    </Label>
                  </div>
                  
                  {hasMedicineCabinet && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="medicineCabinetDoor" className="text-xs">Door Type</Label>
                      <Select value={medicineCabinetDoorType} onValueChange={setMedicineCabinetDoorType}>
                        <SelectTrigger id="medicineCabinetDoor" className="bg-background h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="mirror">Mirror Door</SelectItem>
                          <SelectItem value="glass">Glass Door</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Wall Price Preview */}
              {wallWidth && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Wall Price ({(parseFloat(wallWidth) / 12).toFixed(2)} linear feet × $200):
                    </span>
                    <span className="font-semibold text-primary">
                      ${calculateWallPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Room Layout & Flooring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Room Layout & Flooring</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeRoom"
                  checked={includeRoom}
                  onCheckedChange={(checked) => setIncludeRoom(checked as boolean)}
                />
                <Label htmlFor="includeRoom" className="text-sm font-normal cursor-pointer">
                  Include Room
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          {includeRoom && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a complete room layout with automatic floor generation based on your dimensions.
              </p>

              {/* Room Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomLength">Room Length (feet)</Label>
                  <Input
                    id="roomLength"
                    type="number"
                    placeholder="Length"
                    value={roomLength}
                    onChange={(e) => setRoomLength(e.target.value)}
                    min="0"
                    max="50"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomWidth">Room Width (feet)</Label>
                  <Input
                    id="roomWidth"
                    type="number"
                    placeholder="Width"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(e.target.value)}
                    min="0"
                    max="50"
                    step="0.5"
                  />
                </div>
              </div>

              {roomLength && roomWidth && (
                <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor Area:</span>
                    <span className="font-medium">
                      {(parseFloat(roomLength) * parseFloat(roomWidth)).toFixed(2)} sq ft
                    </span>
                  </div>
                </div>
              )}

              {/* Floor Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="floorType">Floor Type</Label>
                <Select value={floorType} onValueChange={setFloorType}>
                  <SelectTrigger id="floorType" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-[100]">
                    <SelectItem value="tile">Tile Flooring ($15/sq ft)</SelectItem>
                    <SelectItem value="wood">Wood Flooring ($12/sq ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tile Color Options */}
              {floorType === "tile" && (
                <div className="space-y-2">
                  <Label htmlFor="tileColor">Tile Color & Pattern</Label>
                  <Select value={tileColor} onValueChange={setTileColor}>
                    <SelectTrigger id="tileColor" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="white-marble">White Marble</SelectItem>
                      <SelectItem value="gray-marble">Gray Marble</SelectItem>
                      <SelectItem value="black-marble">Black Marble</SelectItem>
                      <SelectItem value="cream-travertine">Cream Travertine</SelectItem>
                      <SelectItem value="beige-porcelain">Beige Porcelain</SelectItem>
                      <SelectItem value="charcoal-slate">Charcoal Slate</SelectItem>
                      <SelectItem value="white-subway">White Subway Tile</SelectItem>
                      <SelectItem value="gray-hexagon">Gray Hexagon</SelectItem>
                      <SelectItem value="black-white-pattern">Black & White Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Premium porcelain and ceramic tiles in various patterns
                  </p>
                </div>
              )}

              {/* Wood Floor Options */}
              {floorType === "wood" && (
                <div className="space-y-2">
                  <Label htmlFor="woodFloorFinish">Wood Floor Finish</Label>
                  <Select value={woodFloorFinish} onValueChange={setWoodFloorFinish}>
                    <SelectTrigger id="woodFloorFinish" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="natural-oak">Natural Oak</SelectItem>
                      <SelectItem value="honey-oak">Honey Oak</SelectItem>
                      <SelectItem value="dark-walnut">Dark Walnut</SelectItem>
                      <SelectItem value="espresso-maple">Espresso Maple</SelectItem>
                      <SelectItem value="gray-oak">Gray Oak</SelectItem>
                      <SelectItem value="white-washed-oak">White-Washed Oak</SelectItem>
                      <SelectItem value="cherry-mahogany">Cherry Mahogany</SelectItem>
                      <SelectItem value="hickory-natural">Natural Hickory</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Premium engineered hardwood flooring
                  </p>
                </div>
              )}

              {/* Floor Price Preview */}
              {roomLength && roomWidth && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {floorType === "tile" ? "Tile" : "Wood"} Floor ({(parseFloat(roomLength) * parseFloat(roomWidth)).toFixed(2)} sq ft × ${floorType === "tile" ? "15" : "12"}):
                      </span>
                      <span className="font-semibold text-primary">
                        ${calculateFloorPrice().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Includes installation and underlayment
                    </p>
                  </div>
                </div>
              )}

              {/* Lighting Configuration */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Label className="text-sm font-medium">Lighting (3D Preview Only)</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="lightingType" className="text-xs">Fixture Type</Label>
                  <Select value={lightingType} onValueChange={setLightingType}>
                    <SelectTrigger id="lightingType" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-[100]">
                      <SelectItem value="recessed">Recessed Ceiling Lights</SelectItem>
                      <SelectItem value="sconce">Wall Sconces</SelectItem>
                      <SelectItem value="pendant">Pendant Lights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brightness" className="text-xs">Brightness</Label>
                    <span className="text-xs font-medium text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider
                    id="brightness"
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="colorTemperature" className="text-xs">Color Temperature</Label>
                    <span className="text-xs font-medium text-muted-foreground">
                      {colorTemperature < 3000 ? 'Warm' : colorTemperature < 4000 ? 'Neutral' : colorTemperature < 5000 ? 'Cool' : 'Daylight'}
                    </span>
                  </div>
                  <Slider
                    id="colorTemperature"
                    value={[colorTemperature]}
                    onValueChange={(value) => setColorTemperature(value[0])}
                    min={2700}
                    max={6500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2700K (Warm)</span>
                    <span>6500K (Daylight)</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                  💡 Lighting adjustments affect 3D preview only. Contact us for actual lighting quotes.
                </p>
              </div>

              {/* Mirror & Medicine Cabinet */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Mirror & Medicine Cabinet</h4>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeMirror"
                      checked={includeMirror}
                      onCheckedChange={(checked) => setIncludeMirror(checked as boolean)}
                    />
                    <Label htmlFor="includeMirror" className="text-sm font-normal cursor-pointer">
                      Include
                    </Label>
                  </div>
                </div>
                
                {includeMirror && (
                  <>
                    <div>
                      <Label htmlFor="mirrorType">Type</Label>
                      <Select value={mirrorType} onValueChange={(value: any) => setMirrorType(value)}>
                        <SelectTrigger id="mirrorType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mirror">Mirror Only</SelectItem>
                          <SelectItem value="medicine-cabinet">Medicine Cabinet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mirrorSize">Size</Label>
                      <Select value={mirrorSize} onValueChange={(value: any) => setMirrorSize(value)}>
                        <SelectTrigger id="mirrorSize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (24" W)</SelectItem>
                          <SelectItem value="medium">Medium (36" W)</SelectItem>
                          <SelectItem value="large">Large (48" W)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mirrorShape">Shape</Label>
                      <Select value={mirrorShape} onValueChange={(value: any) => setMirrorShape(value)}>
                        <SelectTrigger id="mirrorShape">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangular">Rectangular</SelectItem>
                          <SelectItem value="round">Round</SelectItem>
                          <SelectItem value="oval">Oval</SelectItem>
                          <SelectItem value="arched">Arched Top</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mirrorFrame">Frame Style</Label>
                      <Select value={mirrorFrame} onValueChange={(value: any) => setMirrorFrame(value)}>
                        <SelectTrigger id="mirrorFrame">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Frameless</SelectItem>
                          <SelectItem value="black">Black Frame</SelectItem>
                          <SelectItem value="chrome">Chrome Frame</SelectItem>
                          <SelectItem value="gold">Gold Frame</SelectItem>
                          <SelectItem value="wood">Wood Frame</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Faucet & Fixtures */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeFaucet" 
                    checked={includeFaucet}
                    onCheckedChange={(checked) => setIncludeFaucet(checked as boolean)}
                  />
                  <Label htmlFor="includeFaucet" className="font-medium cursor-pointer">
                    Include Faucet & Fixtures
                  </Label>
                </div>
                
                {includeFaucet && (
                  <>
                    <div>
                      <Label htmlFor="faucetStyle">Faucet Style</Label>
                      <Select value={faucetStyle} onValueChange={(value: any) => setFaucetStyle(value)}>
                        <SelectTrigger id="faucetStyle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern (Single Hole)</SelectItem>
                          <SelectItem value="traditional">Traditional (Widespread)</SelectItem>
                          <SelectItem value="waterfall">Waterfall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="faucetFinish">Faucet Finish</Label>
                      <Select value={faucetFinish} onValueChange={(value: any) => setFaucetFinish(value)}>
                        <SelectTrigger id="faucetFinish">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chrome">Chrome</SelectItem>
                          <SelectItem value="brushed-nickel">Brushed Nickel</SelectItem>
                          <SelectItem value="matte-black">Matte Black</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Countertop Options */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Countertop</h4>
                
                <div>
                  <Label htmlFor="countertopMaterial">Material</Label>
                  <Select value={countertopMaterial} onValueChange={(value: any) => setCountertopMaterial(value)}>
                    <SelectTrigger id="countertopMaterial">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marble">Marble ($120/sqft)</SelectItem>
                      <SelectItem value="quartz">Quartz ($85/sqft)</SelectItem>
                      <SelectItem value="granite">Granite ($75/sqft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="countertopColor">Color</Label>
                  <Select value={countertopColor} onValueChange={setCountertopColor}>
                    <SelectTrigger id="countertopColor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="beige">Beige</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="countertopEdge">Edge Profile</Label>
                  <Select value={countertopEdge} onValueChange={(value: any) => setCountertopEdge(value)}>
                    <SelectTrigger id="countertopEdge">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight Edge</SelectItem>
                      <SelectItem value="beveled">Beveled Edge</SelectItem>
                      <SelectItem value="bullnose">Bullnose Edge</SelectItem>
                      <SelectItem value="waterfall">Waterfall Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sink Options */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Sink</h4>
                
                <div>
                  <Label htmlFor="sinkStyle">Style</Label>
                  <Select value={sinkStyle} onValueChange={(value: any) => setSinkStyle(value)}>
                    <SelectTrigger id="sinkStyle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undermount">Undermount</SelectItem>
                      <SelectItem value="vessel">Vessel</SelectItem>
                      <SelectItem value="integrated">Integrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sinkShape">Shape</Label>
                  <Select value={sinkShape} onValueChange={(value: any) => setSinkShape(value)}>
                    <SelectTrigger id="sinkShape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="rectangular">Rectangular</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Backsplash Options */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Backsplash</h4>
                  <Checkbox 
                    id="includeBacksplash" 
                    checked={includeBacksplash}
                    onCheckedChange={(checked) => setIncludeBacksplash(checked as boolean)}
                  />
                </div>
                
                {includeBacksplash && (
                  <>
                    <div>
                      <Label htmlFor="backsplashMaterial">Material</Label>
                      <Select value={backsplashMaterial} onValueChange={(value: any) => setBacksplashMaterial(value)}>
                        <SelectTrigger id="backsplashMaterial">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subway-tile">Subway Tile</SelectItem>
                          <SelectItem value="marble-slab">Marble Slab</SelectItem>
                          <SelectItem value="glass-tile">Glass Tile</SelectItem>
                          <SelectItem value="stone">Natural Stone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="backsplashHeight">Height</Label>
                      <Select value={backsplashHeight} onValueChange={(value: any) => setBacksplashHeight(value)}>
                        <SelectTrigger id="backsplashHeight">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4-inch">4 Inches</SelectItem>
                          <SelectItem value="full-height">Full Height (to mirror)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Vanity Lighting Options */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Vanity Lighting</h4>
                  <Checkbox 
                    id="includeVanityLighting" 
                    checked={includeVanityLighting}
                    onCheckedChange={(checked) => setIncludeVanityLighting(checked as boolean)}
                  />
                </div>
                
                {includeVanityLighting && (
                  <>
                    <div>
                      <Label htmlFor="vanityLightingStyle">Fixture Style</Label>
                      <Select value={vanityLightingStyle} onValueChange={(value: any) => setVanityLightingStyle(value)}>
                        <SelectTrigger id="vanityLightingStyle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sconce">Wall Sconces</SelectItem>
                          <SelectItem value="led-strip">LED Strip Lighting</SelectItem>
                          <SelectItem value="pendant">Pendant Lights</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vanityLightingStyle === 'sconce' && 'Classic wall-mounted fixtures on both sides'}
                        {vanityLightingStyle === 'led-strip' && 'Modern integrated LED strip around mirror'}
                        {vanityLightingStyle === 'pendant' && 'Hanging pendant lights above vanity'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vanityLightBrightness">Brightness</Label>
                        <span className="text-xs font-medium text-muted-foreground">{vanityLightBrightness}%</span>
                      </div>
                      <Slider
                        id="vanityLightBrightness"
                        value={[vanityLightBrightness]}
                        onValueChange={(value) => setVanityLightBrightness(value[0])}
                        min={30}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vanityLightTemp">Color Temperature</Label>
                        <span className="text-xs font-medium text-muted-foreground">{vanityLightTemp}K</span>
                      </div>
                      <Slider
                        id="vanityLightTemp"
                        value={[vanityLightTemp]}
                        onValueChange={(value) => setVanityLightTemp(value[0])}
                        min={2700}
                        max={6500}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Warm (2700K)</span>
                        <span>Neutral (4000K)</span>
                        <span>Cool (6500K)</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bathroom Accessories */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Bathroom Accessories</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTowelBar" 
                    checked={includeTowelBar}
                    onCheckedChange={(checked) => setIncludeTowelBar(checked as boolean)}
                  />
                  <Label htmlFor="includeTowelBar" className="cursor-pointer">
                    Towel Bar
                  </Label>
                </div>
                
                {includeTowelBar && (
                  <div>
                    <Label htmlFor="towelBarPosition">Towel Bar Position</Label>
                    <Select value={towelBarPosition} onValueChange={(value: any) => setTowelBarPosition(value)}>
                      <SelectTrigger id="towelBarPosition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeToiletPaperHolder" 
                    checked={includeToiletPaperHolder}
                    onCheckedChange={(checked) => setIncludeToiletPaperHolder(checked as boolean)}
                  />
                  <Label htmlFor="includeToiletPaperHolder" className="cursor-pointer">
                    Toilet Paper Holder
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeRobeHooks" 
                    checked={includeRobeHooks}
                    onCheckedChange={(checked) => setIncludeRobeHooks(checked as boolean)}
                  />
                  <Label htmlFor="includeRobeHooks" className="cursor-pointer">
                    Robe Hooks
                  </Label>
                </div>
                
                {includeRobeHooks && (
                  <div>
                    <Label htmlFor="robeHookCount">Number of Hooks: {robeHookCount}</Label>
                    <Slider
                      id="robeHookCount"
                      value={[robeHookCount]}
                      onValueChange={(value) => setRobeHookCount(value[0])}
                      min={1}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeShelving" 
                    checked={includeShelving}
                    onCheckedChange={(checked) => setIncludeShelving(checked as boolean)}
                  />
                  <Label htmlFor="includeShelving" className="cursor-pointer">
                    Shelving Unit
                  </Label>
                </div>
                
                {includeShelving && (
                  <div>
                    <Label htmlFor="shelvingType">Shelving Type</Label>
                    <Select value={shelvingType} onValueChange={(value: any) => setShelvingType(value)}>
                      <SelectTrigger id="shelvingType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floating">Floating Shelves</SelectItem>
                        <SelectItem value="corner">Corner Shelf Unit</SelectItem>
                        <SelectItem value="ladder">Ladder Shelf</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Wall Finishes */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Wall Finishes</h4>
                
                <div>
                  <Label htmlFor="wallFinishType">Wall Material</Label>
                  <Select value={wallFinishType} onValueChange={(value: any) => setWallFinishType(value)}>
                    <SelectTrigger id="wallFinishType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paint">Paint</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {wallFinishType === 'paint' ? (
                  <div>
                    <Label htmlFor="wallPaintColor">Paint Color</Label>
                    <Select value={wallPaintColor} onValueChange={setWallPaintColor}>
                      <SelectTrigger id="wallPaintColor">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="beige">Beige</SelectItem>
                        <SelectItem value="light-gray">Light Gray</SelectItem>
                        <SelectItem value="sage-green">Sage Green</SelectItem>
                        <SelectItem value="light-blue">Light Blue</SelectItem>
                        <SelectItem value="cream">Cream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="wallTileColor">Tile Style</Label>
                    <Select value={wallTileColor} onValueChange={setWallTileColor}>
                      <SelectTrigger id="wallTileColor">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white-subway">White Subway</SelectItem>
                        <SelectItem value="gray-subway">Gray Subway</SelectItem>
                        <SelectItem value="marble">Marble</SelectItem>
                        <SelectItem value="travertine">Travertine</SelectItem>
                        <SelectItem value="porcelain">Porcelain</SelectItem>
                        <SelectItem value="mosaic">Mosaic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          )}
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
                <span>Vanity Base Price ({selectedBrand}):</span>
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
              {includeWalls && wallPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Wall Configuration:</span>
                  <span className="font-medium">${wallPrice.toFixed(2)}</span>
                </div>
              )}
              {includeRoom && floorPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Room & Flooring:</span>
                  <span className="font-medium">${floorPrice.toFixed(2)}</span>
                </div>
              )}
              {((includeWalls && wallPrice > 0) || (includeRoom && floorPrice > 0)) && (
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              )}
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

        <div className="flex flex-col sm:flex-row gap-3">
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
            onClick={handleExportPDF} 
            variant="outline"
            className="flex-1 touch-manipulation" 
            size="lg"
          >
            <FileDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Export PDF</span>
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
