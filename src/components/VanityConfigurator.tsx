import { useState, useEffect } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { FinishPreview } from "./FinishPreview";

interface VanityConfiguratorProps {
  product: ShopifyProduct;
}

const NY_TAX_RATE = 0.08875; // 8.875% NY sales tax
const SHIPPING_RATES: { [key: string]: number } = {
  "NY": 150,
  "NJ": 200,
  "CT": 250,
  "PA": 300,
  "other": 400,
};

// Tafisa finish options - Premium melamine
const TAFISA_FINISHES = [
  'White',
  'Cream Puff',
  'Sand Castle',
  'Tiramisu',
  'Secret Garden',
  'Froth of Sea',
  'Gardenia',
  'Cashmere',
  'Morning Dew',
  'Daybreak',
  'Milky Way',
  'Summer Drops',
  'Moonlight',
  'White Chocolate',
  'Fogo Harbour',
  'Weekend Getaway',
  'Crème de la Crème',
  'Natural Affinity',
  'Free Spirit',
  'Niagara',
  'Love at First Sight',
  'Summer Breeze',
  'Mojave',
];

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
    description: 'Premium melamine panels - 122+ colors available',
  },
  'Shinnoki': {
    price: 350,
    description: 'Prefinished wood veneer panels - Natural wood beauty',
  },
};

export const VanityConfigurator = ({ product }: VanityConfiguratorProps) => {
  const [selectedBrand, setSelectedBrand] = useState<string>("Tafisa");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [widthFraction, setWidthFraction] = useState<string>("0");
  const [height, setHeight] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [state, setState] = useState<string>("");
  
  const addItem = useCartStore((state) => state.addItem);

  // Get unique brand options
  const brands = product.node.options.find((opt) => opt.name === "Brand")?.values || [];
  
  // Get finishes based on selected brand
  const availableFinishes = selectedBrand === 'Tafisa' ? TAFISA_FINISHES : 
                            selectedBrand === 'Shinnoki' ? SHINNOKI_FINISHES : [];
  
  // Update finish when brand changes
  useEffect(() => {
    if (selectedBrand) {
      setSelectedFinish(availableFinishes[0] || '');
    }
  }, [selectedBrand]);

  // Calculate price
  const calculatePrice = () => {
    if (!width || !selectedBrand) return 0;
    
    const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
    const widthFeet = widthInches / 12;
    const pricePerFoot = BRAND_INFO[selectedBrand as keyof typeof BRAND_INFO]?.price || 0;
    
    return widthFeet * pricePerFoot;
  };

  const calculateTax = (subtotal: number) => {
    if (state === "NY") {
      return subtotal * NY_TAX_RATE;
    }
    return 0;
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
    if (!selectedBrand || !selectedFinish || !width || !height || !depth || !zipCode) {
      toast.error("Please complete all fields", {
        description: "Brand, finish, measurements, and zip code are required",
      });
      return;
    }

    const variant = product.node.variants.edges.find(
      (v) => v.node.title === `${selectedBrand} / ${selectedFinish}`
    );

    if (!variant) {
      toast.error("Selected configuration not available");
      return;
    }

    const widthInches = parseFloat(width) + (parseInt(widthFraction) / 16);
    const measurements = `${widthInches}"W x ${height}"H x ${depth}"D`;

    const cartItem = {
      product,
      variantId: variant.node.id,
      variantTitle: `${variant.node.title} - ${measurements}`,
      price: {
        amount: totalPrice.toFixed(2),
        currencyCode: "USD",
      },
      quantity: 1,
      selectedOptions: [
        { name: "Brand", value: selectedBrand },
        { name: "Finish", value: selectedFinish },
        { name: "Measurements", value: measurements },
        { name: "Location", value: `${zipCode} (${state})` },
      ],
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: `Custom ${selectedBrand} vanity - ${measurements}`,
      position: "top-center",
    });
  };

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4 lg:col-span-1">
        {product.node.images.edges[0] && (
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary/20">
            <img
              src={product.node.images.edges[0].node.url}
              alt={product.node.images.edges[0].node.altText || product.node.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {product.node.images.edges.slice(1).map((image, idx) => (
            <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-secondary/20">
              <img
                src={image.node.url}
                alt={image.node.altText || `${product.node.title} ${idx + 2}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Configurator */}
      <div className="space-y-6 lg:col-span-2 md:col-span-1">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.node.title}</h1>
          <p className="text-muted-foreground">{product.node.description}</p>
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
              <Label htmlFor="brand">Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand" className="bg-background">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="cursor-pointer">
                      {brand} - ${BRAND_INFO[brand as keyof typeof BRAND_INFO]?.price}/ft
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
                  {availableFinishes.map((finish) => (
                    <SelectItem key={finish} value={finish} className="cursor-pointer">
                      {finish}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBrand && (
                <p className="text-xs text-muted-foreground">
                  {availableFinishes.length} finishes available for {selectedBrand}
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

            {/* Width Input with Fraction */}
            <div className="space-y-2">
              <Label>Width (inches)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Inches"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="0"
                  className="flex-1"
                />
                <Select value={widthFraction} onValueChange={setWidthFraction}>
                  <SelectTrigger className="w-24 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="0">0/16"</SelectItem>
                    <SelectItem value="1">1/16"</SelectItem>
                    <SelectItem value="2">2/16"</SelectItem>
                    <SelectItem value="3">3/16"</SelectItem>
                    <SelectItem value="4">4/16"</SelectItem>
                    <SelectItem value="5">5/16"</SelectItem>
                    <SelectItem value="6">6/16"</SelectItem>
                    <SelectItem value="7">7/16"</SelectItem>
                    <SelectItem value="8">8/16"</SelectItem>
                    <SelectItem value="9">9/16"</SelectItem>
                    <SelectItem value="10">10/16"</SelectItem>
                    <SelectItem value="11">11/16"</SelectItem>
                    <SelectItem value="12">12/16"</SelectItem>
                    <SelectItem value="13">13/16"</SelectItem>
                    <SelectItem value="14">14/16"</SelectItem>
                    <SelectItem value="15">15/16"</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Height Input */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="0"
              />
            </div>

            {/* Depth Input */}
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (inches)</Label>
              <Input
                id="depth"
                type="number"
                placeholder="Depth"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                min="0"
              />
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
                  <span>NY Sales Tax (8.875%):</span>
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

        <Button onClick={handleAddToCart} className="w-full" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart - ${totalPrice > 0 ? totalPrice.toFixed(2) : "0.00"}
        </Button>
      </div>
    </div>
  );
};
