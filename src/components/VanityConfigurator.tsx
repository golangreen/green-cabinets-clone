import { useState, useEffect } from "react";
import type { ShopifyProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingCart, ZoomIn, CreditCard, Mail } from "lucide-react";
import { FinishPreview } from "./FinishPreview";
import { FinishComparison } from "./FinishComparison";
import { getTafisaColorNames, getTafisaCategories, getTafisaColorsByCategory } from "@/lib/tafisaColors";
import { getEggerColorNames, getEggerCategories, getEggerColorsByCategory } from "@/lib/eggerColors";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRequestingQuote, setIsRequestingQuote] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [brandError, setBrandError] = useState(false);
  const [finishError, setFinishError] = useState(false);
  const [widthError, setWidthError] = useState(false);
  const [heightError, setHeightError] = useState(false);
  const [depthError, setDepthError] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

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

  // Calculate price based on linear feet at $350/linear foot
  const calculatePrice = () => {
    if (!width || !selectedBrand) return 0;
    
    const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
    const linearFeet = widthInches / 12; // Convert inches to feet
    
    return linearFeet * 350; // $350 per linear foot
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
    // Reset all errors
    setBrandError(false);
    setFinishError(false);
    setWidthError(false);
    setHeightError(false);
    setDepthError(false);
    setZipCodeError(false);

    // Check for missing fields
    let hasError = false;
    if (!selectedBrand) { setBrandError(true); hasError = true; }
    if (!selectedFinish) { setFinishError(true); hasError = true; }
    if (!width) { setWidthError(true); hasError = true; }
    if (!height) { setHeightError(true); hasError = true; }
    if (!depth) { setDepthError(true); hasError = true; }
    if (!zipCode) { setZipCodeError(true); hasError = true; }

    if (hasError) {
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
      const errors = validationResult.error.errors;
      errors.forEach(error => {
        if (error.path.includes('width')) setWidthError(true);
        if (error.path.includes('height')) setHeightError(true);
        if (error.path.includes('depth')) setDepthError(true);
        if (error.path.includes('zipCode')) setZipCodeError(true);
      });
      toast.error(validationResult.error.errors[0].message);
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

  const handleCheckout = async () => {
    // Reset all errors
    setBrandError(false);
    setFinishError(false);
    setWidthError(false);
    setZipCodeError(false);

    // Check for missing fields
    let hasError = false;
    if (!selectedBrand) { setBrandError(true); hasError = true; }
    if (!selectedFinish) { setFinishError(true); hasError = true; }
    if (!width) { setWidthError(true); hasError = true; }
    if (!zipCode) { setZipCodeError(true); hasError = true; }

    if (hasError) {
      toast.error("Please complete all fields", {
        description: "Brand, finish, width, and zip code are required",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
      const linearFeet = widthInches / 12;
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          customProduct: {
            name: `Custom Vanity - ${selectedBrand} ${selectedFinish}`,
            description: `Width: ${widthInches.toFixed(2)}" (${linearFeet.toFixed(2)} linear feet) | Brand: ${selectedBrand} | Finish: ${selectedFinish} | ZIP: ${zipCode}`,
            amount: Math.round(totalPrice * 100), // Convert to cents
            metadata: {
              brand: selectedBrand,
              finish: selectedFinish,
              width: widthInches.toFixed(2),
              zipCode,
              state: state || "Unknown",
              basePrice: basePrice.toFixed(2),
              tax: tax.toFixed(2),
              shipping: shipping.toFixed(2),
            }
          }
        }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to create payment session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestQuote = () => {
    // Reset all errors
    setBrandError(false);
    setFinishError(false);
    setWidthError(false);
    setZipCodeError(false);

    // Check for missing fields
    let hasError = false;
    if (!selectedBrand) { setBrandError(true); hasError = true; }
    if (!selectedFinish) { setFinishError(true); hasError = true; }
    if (!width) { setWidthError(true); hasError = true; }
    if (!zipCode) { setZipCodeError(true); hasError = true; }

    if (hasError) {
      toast.error("Please complete all fields", {
        description: "Brand, finish, width, and zip code are required",
      });
      return;
    }
    setShowQuoteDialog(true);
  };

  const handleSubmitQuote = async () => {
    if (!customerName || !customerEmail) {
      toast.error("Please fill in your contact information");
      return;
    }

    setIsRequestingQuote(true);
    try {
      const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
      const heightInches = height ? parseFloat(height) + (parseInt(heightFraction) / 16) : undefined;
      const depthInches = depth ? parseFloat(depth) + (parseInt(depthFraction) / 16) : undefined;

      const { error } = await supabase.functions.invoke('send-vanity-quote', {
        body: {
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          brand: selectedBrand,
          finish: selectedFinish,
          width: widthInches,
          height: heightInches,
          depth: depthInches,
          zipCode,
          state: state || "Unknown",
          basePrice,
          tax,
          shipping,
          totalPrice,
          additionalNotes: additionalNotes || undefined,
        }
      });

      if (error) throw error;

      toast.success("Quote request sent!", {
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });

      setShowQuoteDialog(false);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setAdditionalNotes("");
    } catch (error) {
      console.error('Quote request error:', error);
      toast.error('Failed to send quote request', {
        description: 'Please try again or contact us directly.',
      });
    } finally {
      setIsRequestingQuote(false);
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
        {/* Product Images */}
        <div className="space-y-4 lg:col-span-1">
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
              <strong>Pricing:</strong> $350 per linear foot (based on vanity width)
            </p>
            <p>
              <strong>Shipping:</strong> Approximately 14-21 business days
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Vanity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {/* Brand Selection */}
            <div className="space-y-2">
              <Label htmlFor="brand" className={brandError ? "text-destructive" : ""}>
                Brand {brandError && <span className="text-destructive">*</span>}
              </Label>
              <Select 
                value={selectedBrand} 
                onValueChange={(value) => {
                  setSelectedBrand(value);
                  setBrandError(false);
                }}
              >
                <SelectTrigger 
                  id="brand" 
                  className={brandError ? "bg-background border-destructive focus:ring-destructive" : "bg-background"}
                >
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="cursor-pointer">
                      {brand}
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
              <Label htmlFor="finish" className={finishError ? "text-destructive" : ""}>
                Finish / Color {selectedBrand && `- ${selectedBrand} Collection`}
                {finishError && <span className="text-destructive"> *</span>}
              </Label>
              <Select 
                value={selectedFinish} 
                onValueChange={(value) => {
                  setSelectedFinish(value);
                  setFinishError(false);
                }} 
                disabled={!selectedBrand}
              >
                <SelectTrigger 
                  id="finish" 
                  className={finishError ? "bg-background border-destructive focus:ring-destructive" : "bg-background"}
                >
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
            </div>

            {/* Finish Preview - Shows manufacturer image */}
            {selectedFinish && selectedBrand && (
              <FinishPreview 
                brand={selectedBrand}
                finish={selectedFinish}
              />
            )}

            {/* Finish Comparison Tool */}
            {selectedBrand && availableFinishes.length > 1 && (
              <FinishComparison
                brand={selectedBrand}
                availableFinishes={availableFinishes}
                selectedFinish={selectedFinish}
                onFinishSelect={setSelectedFinish}
              />
            )}

            {/* Width Input with Slider and Fraction */}
            <div className="space-y-3">
              <Label className={widthError ? "text-destructive" : ""}>
                Width (inches) {widthError && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    setWidthError(false);
                  }}
                  min="0"
                  max="120"
                  className={widthError ? "flex-1 border-destructive focus-visible:ring-destructive" : "flex-1"}
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
              <Label className={heightError ? "text-destructive" : ""}>
                Height (inches) {heightError && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setHeightError(false);
                  }}
                  min="0"
                  max="120"
                  className={heightError ? "flex-1 border-destructive focus-visible:ring-destructive" : "flex-1"}
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
              <Label className={depthError ? "text-destructive" : ""}>
                Depth (inches) {depthError && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={depth}
                  onChange={(e) => {
                    setDepth(e.target.value);
                    setDepthError(false);
                  }}
                  min="0"
                  max="120"
                  className={depthError ? "flex-1 border-destructive focus-visible:ring-destructive" : "flex-1"}
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
              <Label htmlFor="zipCode" className={zipCodeError ? "text-destructive" : ""}>
                Zip Code (for shipping) {zipCodeError && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="12345"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value.slice(0, 5));
                  setZipCodeError(false);
                }}
                maxLength={5}
                className={zipCodeError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {state && (
                <p className="text-sm text-muted-foreground">
                  Detected state: {state}
                </p>
              )}
            </div>
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
                <span>Width:</span>
                <span className="font-medium">
                  {(parseFloat(width || "0") + parseInt(widthFraction) / 16).toFixed(2)}" 
                  ({((parseFloat(width || "0") + parseInt(widthFraction) / 16) / 12).toFixed(2)} linear feet)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Base Price ($350/linear foot):</span>
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
              <div className="text-xs text-muted-foreground mt-4">
                <p>* This is an estimate based on $350 per linear foot</p>
                <p>* Final pricing will be confirmed by our team before shipping</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={handleAddToCart}
              className="flex-1 bg-[#2dd4bf] hover:bg-[#2dd4bf]/80 touch-manipulation" 
              size="lg"
            >
              <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Add to Cart</span>
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/80 touch-manipulation" 
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{isProcessing ? "Processing..." : "Checkout Now"}</span>
            </Button>
          </div>
          <Button 
            onClick={handleRequestQuote}
            variant="outline"
            className="w-full touch-manipulation border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf]/10" 
            size="lg"
          >
            <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Request Quote via Email</span>
          </Button>
        </div>
      </div>
    </div>

      {/* Quote Request Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Quote</DialogTitle>
            <DialogDescription>
              Fill in your contact information and we'll send you a detailed quote within 24 hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone (optional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special requests or questions..."
                rows={3}
              />
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>Configuration Summary:</strong></p>
              <p>Brand: {selectedBrand}</p>
              <p>Finish: {selectedFinish}</p>
              <p>Width: {(parseFloat(width || "0") + parseInt(widthFraction) / 16).toFixed(2)}"</p>
              <p className="text-[#2dd4bf] font-semibold">Estimated Total: ${totalPrice.toFixed(2)}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowQuoteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitQuote}
                disabled={isRequestingQuote}
                className="flex-1 bg-[#2dd4bf] hover:bg-[#2dd4bf]/80"
              >
                {isRequestingQuote ? "Sending..." : "Send Quote Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
