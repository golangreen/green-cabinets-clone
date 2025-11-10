import { useState, useEffect, useMemo } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShoppingCart, FileDown, Save, Maximize2, X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { useCartStore } from "@/stores/cartStore";
import { useSavedTemplates } from "@/hooks/useSavedTemplates";
import { FinishPreview } from "./FinishPreview";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { TemplateGallery } from "./TemplateGallery";
import { TexturePreviewModal } from "./TexturePreviewModal";
import logoImage from "@/assets/logo.jpg";

import { VanityDimensionsForm } from "./vanity/VanityDimensionsForm";
import { VanityBrandFinishSelector } from "./vanity/VanityBrandFinishSelector";
import { VanityCabinetConfig } from "./vanity/VanityCabinetConfig";
import { VanityCountertopConfig } from "./vanity/VanityCountertopConfig";
import { VanityFixturesConfig } from "./vanity/VanityFixturesConfig";
import { VanityPricingSummary } from "./vanity/VanityPricingSummary";
import { VanityConfig, PricingInfo, BRAND_INFO, TAX_RATES, SHIPPING_RATES } from "./vanity/types";

import { getTafisaColorNames, getTafisaCategories, getTafisaColorsByCategory } from "@/lib/tafisaColors";
import { getEggerColorNames, getEggerCategories, getEggerColorsByCategory } from "@/lib/eggerColors";

const dimensionSchema = z.object({
  width: z.number().min(12, "Width must be at least 12 inches").max(120, "Width cannot exceed 120 inches"),
  height: z.number().min(12, "Height must be at least 12 inches").max(60, "Height cannot exceed 60 inches"),
  depth: z.number().min(12, "Depth must be at least 12 inches").max(36, "Depth cannot exceed 36 inches"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
});

const TAFISA_FINISHES = getTafisaColorNames();
const TAFISA_CATEGORIES = getTafisaCategories();
const EGGER_FINISHES = getEggerColorNames();
const EGGER_CATEGORIES = getEggerCategories();

const SHINNOKI_FINISHES = [
  'Bondi Oak', 'Milk Oak', 'Ivory Oak', 'Ivory Infinite Oak', 'Natural Oak', 'Manhattan Oak',
  'Desert Oak', 'Sahara Oak', 'Burley Oak', 'Raven Oak', 'Frozen Walnut', 'Smoked Walnut',
  'Pure Walnut', 'Stardust Walnut', 'Shadow Eucalyptus', 'Frozen Maple', 'Sapele', 'Triba',
  'Cherry', 'Crema', 'Imperial Oak', 'Infinite White', 'Arctic Oak'
];

interface VanityConfiguratorProps {
  product: ShopifyProduct;
}

export const VanityConfigurator = ({ product }: VanityConfiguratorProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { savedTemplates, saveTemplate, deleteTemplate } = useSavedTemplates();

  // State for configuration
  const [width, setWidth] = useState("36");
  const [widthFraction, setWidthFraction] = useState("0");
  const [height, setHeight] = useState("32");
  const [heightFraction, setHeightFraction] = useState("0");
  const [depth, setDepth] = useState("21");
  const [depthFraction, setDepthFraction] = useState("0");
  const [zipCode, setZipCode] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("Tafisa");
  const [selectedFinish, setSelectedFinish] = useState("Pure White");
  const [doorStyle, setDoorStyle] = useState("shaker");
  const [numDrawers, setNumDrawers] = useState(2);
  const [handleStyle, setHandleStyle] = useState("bar");
  const [cabinetPosition, setCabinetPosition] = useState("floor");
  const [countertopMaterial, setCountertopMaterial] = useState<"marble" | "quartz" | "granite">("marble");
  const [countertopEdge, setCountertopEdge] = useState<"straight" | "beveled" | "bullnose" | "waterfall">("straight");
  const [countertopColor, setCountertopColor] = useState("white");
  const [sinkStyle, setSinkStyle] = useState<"undermount" | "vessel" | "integrated">("undermount");
  const [sinkShape, setSinkShape] = useState<"oval" | "rectangular" | "square">("oval");
  const [includeFaucet, setIncludeFaucet] = useState(true);
  const [faucetStyle, setFaucetStyle] = useState<"modern" | "traditional" | "waterfall">("modern");
  const [faucetFinish, setFaucetFinish] = useState<"chrome" | "brushed-nickel" | "matte-black" | "gold">("chrome");
  const [includeBacksplash, setIncludeBacksplash] = useState(true);
  const [backsplashMaterial, setBacksplashMaterial] = useState<"subway-tile" | "marble-slab" | "glass-tile" | "stone">("subway-tile");
  const [backsplashHeight, setBacksplashHeight] = useState<"4-inch" | "full-height">("4-inch");
  const [includeVanityLighting, setIncludeVanityLighting] = useState(true);
  const [vanityLightingStyle, setVanityLightingStyle] = useState<"sconce" | "led-strip" | "pendant">("sconce");
  const [vanityLightBrightness, setVanityLightBrightness] = useState(80);
  const [vanityLightTemp, setVanityLightTemp] = useState(4000);
  const [includeMirror, setIncludeMirror] = useState(true);
  const [mirrorType, setMirrorType] = useState<"mirror" | "medicine-cabinet">("mirror");
  const [mirrorSize, setMirrorSize] = useState<"small" | "medium" | "large">("medium");
  const [mirrorShape, setMirrorShape] = useState<"rectangular" | "round" | "oval" | "arched">("rectangular");
  const [mirrorFrame, setMirrorFrame] = useState<"none" | "black" | "chrome" | "gold" | "wood">("black");
  const [includeTowelBar, setIncludeTowelBar] = useState(false);
  const [towelBarPosition, setTowelBarPosition] = useState<"left" | "right" | "center">("right");
  const [includeToiletPaperHolder, setIncludeToiletPaperHolder] = useState(false);
  const [includeRobeHooks, setIncludeRobeHooks] = useState(false);
  const [robeHookCount, setRobeHookCount] = useState(2);
  const [includeShelving, setIncludeShelving] = useState(false);
  const [shelvingType, setShelvingType] = useState<"floating" | "corner" | "ladder">("floating");

  // UI State
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saveAsPublic, setSaveAsPublic] = useState(false);
  const [previewTexture, setPreviewTexture] = useState<string | null>(null);
  const [state, setState] = useState<string>("other");

  // Determine state from ZIP
  useEffect(() => {
    if (!zipCode || zipCode.length !== 5) return;
    const zip = parseInt(zipCode);
    if (zip >= 10001 && zip <= 14999) setState("NY");
    else if (zip >= 7001 && zip <= 8999) setState("NJ");
    else if (zip >= 6001 && zip <= 6999) setState("CT");
    else if (zip >= 15001 && zip <= 19999) setState("PA");
    else setState("other");
  }, [zipCode]);

  // Get finishes based on brand
  const finishes = useMemo(() => {
    if (selectedBrand === "Tafisa") return TAFISA_FINISHES;
    if (selectedBrand === "Egger") return EGGER_FINISHES;
    return SHINNOKI_FINISHES;
  }, [selectedBrand]);

  const categories = useMemo(() => {
    if (selectedBrand === "Tafisa") return TAFISA_CATEGORIES;
    if (selectedBrand === "Egger") return EGGER_CATEGORIES;
    return [{ name: "All Finishes", finishes: SHINNOKI_FINISHES }];
  }, [selectedBrand]);

  // Pricing calculations
  const calculatePrice = () => {
    const basePrice = BRAND_INFO[selectedBrand as keyof typeof BRAND_INFO]?.price || 250;
    const widthVal = parseFloat(width) + parseFloat(widthFraction);
    const heightVal = parseFloat(height) + parseFloat(heightFraction);
    const depthVal = parseFloat(depth) + parseFloat(depthFraction);
    const sqft = (widthVal * heightVal) / 144;
    return basePrice + sqft * 50;
  };

  const calculateWallPrice = () => 0;
  const calculateFloorPrice = () => 0;
  const calculateTax = () => {
    const rate = TAX_RATES[state] || 0;
    return calculatePrice() * rate;
  };
  const calculateShipping = () => SHIPPING_RATES[state] || 400;

  const totalPrice = calculatePrice() + calculateWallPrice() + calculateFloorPrice() + calculateTax() + calculateShipping();

  const pricing: PricingInfo = {
    basePrice: calculatePrice(),
    wallPrice: calculateWallPrice(),
    floorPrice: calculateFloorPrice(),
    tax: calculateTax(),
    shipping: calculateShipping(),
    totalPrice,
    state,
  };

  const dimensionsInInches = useMemo(() => ({
    width: parseFloat(width) + parseFloat(widthFraction),
    height: parseFloat(height) + parseFloat(heightFraction),
    depth: parseFloat(depth) + parseFloat(depthFraction),
  }), [width, widthFraction, height, heightFraction, depth, depthFraction]);

  // Handlers
  const handleAddToCart = () => {
    try {
      const widthVal = parseFloat(width) + parseFloat(widthFraction);
      const heightVal = parseFloat(height) + parseFloat(heightFraction);
      const depthVal = parseFloat(depth) + parseFloat(depthFraction);

      dimensionSchema.parse({ width: widthVal, height: heightVal, depth: depthVal, zipCode });

      addToCart({
        id: `${product.id}-custom-${Date.now()}`,
        name: `${product.title} - ${selectedBrand} ${selectedFinish}`,
        price: totalPrice,
        quantity: 1,
        image: product.images?.[0]?.src || "",
        variant: `${widthVal}W x ${heightVal}H x ${depthVal}D`,
      });

      toast.success("Added to cart!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF();
    
    pdf.addImage(logoImage, 'JPEG', 10, 10, 40, 20);
    pdf.setFontSize(18);
    pdf.text('Bathroom Vanity Specification', 60, 20);
    
    pdf.setFontSize(12);
    let yPos = 40;
    
    pdf.text('Dimensions:', 10, yPos);
    yPos += 7;
    pdf.setFontSize(10);
    pdf.text(`Width: ${dimensionsInInches.width}"`, 20, yPos);
    yPos += 5;
    pdf.text(`Height: ${dimensionsInInches.height}"`, 20, yPos);
    yPos += 5;
    pdf.text(`Depth: ${dimensionsInInches.depth}"`, 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(12);
    pdf.text('Cabinet Configuration:', 10, yPos);
    yPos += 7;
    pdf.setFontSize(10);
    pdf.text(`Brand: ${selectedBrand}`, 20, yPos);
    yPos += 5;
    pdf.text(`Finish: ${selectedFinish}`, 20, yPos);
    yPos += 5;
    pdf.text(`Door Style: ${doorStyle}`, 20, yPos);
    yPos += 5;
    pdf.text(`Drawers: ${numDrawers}`, 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(12);
    pdf.text('Pricing Summary:', 10, yPos);
    yPos += 7;
    pdf.setFontSize(10);
    pdf.text(`Base Price: $${pricing.basePrice.toFixed(2)}`, 20, yPos);
    yPos += 5;
    pdf.text(`Tax: $${pricing.tax.toFixed(2)}`, 20, yPos);
    yPos += 5;
    pdf.text(`Shipping: $${pricing.shipping.toFixed(2)}`, 20, yPos);
    yPos += 5;
    pdf.text(`Total: $${pricing.totalPrice.toFixed(2)}`, 20, yPos);
    
    pdf.save('vanity-specification.pdf');
    toast.success("PDF exported successfully!");
  };

  const confirmSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const config: VanityConfig = {
      selectedBrand, selectedFinish, width, widthFraction, height, heightFraction,
      depth, depthFraction, zipCode, doorStyle, numDrawers, handleStyle, cabinetPosition,
      countertopMaterial, countertopEdge, countertopColor, sinkStyle, sinkShape,
      includeFaucet, faucetStyle, faucetFinish, includeBacksplash, backsplashMaterial,
      backsplashHeight, includeVanityLighting, vanityLightingStyle, vanityLightBrightness,
      vanityLightTemp, includeMirror, mirrorType, mirrorSize, mirrorShape, mirrorFrame,
      includeTowelBar, towelBarPosition, includeToiletPaperHolder, includeRobeHooks,
      robeHookCount, includeShelving, shelvingType,
    };

    saveTemplate({
      id: `template-${Date.now()}`,
      name: templateName,
      isPublic: saveAsPublic,
      config,
    });

    toast.success("Template saved!");
    setSaveDialogOpen(false);
    setTemplateName("");
    setSaveAsPublic(false);
  };

  const handleSelectTemplate = (config: VanityConfig) => {
    setSelectedBrand(config.selectedBrand);
    setSelectedFinish(config.selectedFinish);
    setWidth(config.width);
    setWidthFraction(config.widthFraction);
    setHeight(config.height);
    setHeightFraction(config.heightFraction);
    setDepth(config.depth);
    setDepthFraction(config.depthFraction);
    setZipCode(config.zipCode);
    setDoorStyle(config.doorStyle);
    setNumDrawers(config.numDrawers);
    setHandleStyle(config.handleStyle);
    setCabinetPosition(config.cabinetPosition);
    setCountertopMaterial(config.countertopMaterial);
    setCountertopEdge(config.countertopEdge);
    setCountertopColor(config.countertopColor);
    setSinkStyle(config.sinkStyle);
    setSinkShape(config.sinkShape);
    setIncludeFaucet(config.includeFaucet);
    setFaucetStyle(config.faucetStyle);
    setFaucetFinish(config.faucetFinish);
    setIncludeBacksplash(config.includeBacksplash);
    setBacksplashMaterial(config.backsplashMaterial);
    setBacksplashHeight(config.backsplashHeight);
    setIncludeVanityLighting(config.includeVanityLighting);
    setVanityLightingStyle(config.vanityLightingStyle);
    setVanityLightBrightness(config.vanityLightBrightness);
    setVanityLightTemp(config.vanityLightTemp);
    setIncludeMirror(config.includeMirror);
    setMirrorType(config.mirrorType);
    setMirrorSize(config.mirrorSize);
    setMirrorShape(config.mirrorShape);
    setMirrorFrame(config.mirrorFrame);
    setIncludeTowelBar(config.includeTowelBar);
    setTowelBarPosition(config.towelBarPosition);
    setIncludeToiletPaperHolder(config.includeToiletPaperHolder);
    setIncludeRobeHooks(config.includeRobeHooks);
    setRobeHookCount(config.robeHookCount);
    setIncludeShelving(config.includeShelving);
    setShelvingType(config.shelvingType);
    toast.success("Template loaded!");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Fullscreen Mode */}
      {fullscreenMode && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="p-4">
            <Button variant="outline" onClick={() => setFullscreenMode(false)} className="mb-4">
              <X className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
            <div className="h-[calc(100vh-100px)]">
              <Vanity3DPreview
                brand={selectedBrand}
                finish={selectedFinish}
                dimensions={dimensionsInInches}
                doorStyle={doorStyle}
                numDrawers={numDrawers}
                handleStyle={handleStyle}
                cabinetPosition={cabinetPosition}
                countertopMaterial={countertopMaterial}
                countertopEdge={countertopEdge}
                countertopColor={countertopColor}
                sinkStyle={sinkStyle}
                sinkShape={sinkShape}
                includeFaucet={includeFaucet}
                faucetStyle={faucetStyle}
                faucetFinish={faucetFinish}
                includeBacksplash={includeBacksplash}
                backsplashMaterial={backsplashMaterial}
                backsplashHeight={backsplashHeight}
                includeVanityLighting={includeVanityLighting}
                vanityLightingStyle={vanityLightingStyle}
                vanityLightBrightness={vanityLightBrightness}
                vanityLightTemp={vanityLightTemp}
                includeMirror={includeMirror}
                mirrorType={mirrorType}
                mirrorSize={mirrorSize}
                mirrorShape={mirrorShape}
                mirrorFrame={mirrorFrame}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: 3D Preview */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => setFullscreenMode(true)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="h-[500px]">
                <Vanity3DPreview
                  brand={selectedBrand}
                  finish={selectedFinish}
                  dimensions={dimensionsInInches}
                  doorStyle={doorStyle}
                  numDrawers={numDrawers}
                  handleStyle={handleStyle}
                  cabinetPosition={cabinetPosition}
                  countertopMaterial={countertopMaterial}
                  countertopEdge={countertopEdge}
                  countertopColor={countertopColor}
                  sinkStyle={sinkStyle}
                  sinkShape={sinkShape}
                  includeFaucet={includeFaucet}
                  faucetStyle={faucetStyle}
                  faucetFinish={faucetFinish}
                  includeBacksplash={includeBacksplash}
                  backsplashMaterial={backsplashMaterial}
                  backsplashHeight={backsplashHeight}
                  includeVanityLighting={includeVanityLighting}
                  vanityLightingStyle={vanityLightingStyle}
                  vanityLightBrightness={vanityLightBrightness}
                  vanityLightTemp={vanityLightTemp}
                  includeMirror={includeMirror}
                  mirrorType={mirrorType}
                  mirrorSize={mirrorSize}
                  mirrorShape={mirrorShape}
                  mirrorFrame={mirrorFrame}
                />
              </div>
            </div>
          </Card>

          <FinishPreview brand={selectedBrand} finish={selectedFinish} />
          
          <TemplateGallery
            templates={savedTemplates}
            onSelectTemplate={handleSelectTemplate}
            onDeleteTemplate={deleteTemplate}
          />
        </div>

        {/* Right: Configuration Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Configure Your Vanity</h2>

            <div className="space-y-6">
              <VanityDimensionsForm
                width={width}
                widthFraction={widthFraction}
                height={height}
                heightFraction={heightFraction}
                depth={depth}
                depthFraction={depthFraction}
                zipCode={zipCode}
                onWidthChange={setWidth}
                onWidthFractionChange={setWidthFraction}
                onHeightChange={setHeight}
                onHeightFractionChange={setHeightFraction}
                onDepthChange={setDepth}
                onDepthFractionChange={setDepthFraction}
                onZipCodeChange={setZipCode}
              />

              <VanityBrandFinishSelector
                selectedBrand={selectedBrand}
                selectedFinish={selectedFinish}
                finishes={finishes}
                categories={categories}
                onBrandChange={setSelectedBrand}
                onFinishClick={setSelectedFinish}
                onFinishRightClick={(finish, e) => {
                  e.preventDefault();
                  setPreviewTexture(finish);
                }}
              />

              <VanityCabinetConfig
                doorStyle={doorStyle}
                numDrawers={numDrawers}
                handleStyle={handleStyle}
                cabinetPosition={cabinetPosition}
                onDoorStyleChange={setDoorStyle}
                onNumDrawersChange={(v) => setNumDrawers(v[0])}
                onHandleStyleChange={setHandleStyle}
                onCabinetPositionChange={setCabinetPosition}
              />

              <VanityCountertopConfig
                countertopMaterial={countertopMaterial}
                countertopEdge={countertopEdge}
                countertopColor={countertopColor}
                sinkStyle={sinkStyle}
                sinkShape={sinkShape}
                onCountertopMaterialChange={(v) => setCountertopMaterial(v as any)}
                onCountertopEdgeChange={(v) => setCountertopEdge(v as any)}
                onCountertopColorChange={setCountertopColor}
                onSinkStyleChange={(v) => setSinkStyle(v as any)}
                onSinkShapeChange={(v) => setSinkShape(v as any)}
              />

              <VanityFixturesConfig
                includeFaucet={includeFaucet}
                faucetStyle={faucetStyle}
                faucetFinish={faucetFinish}
                includeBacksplash={includeBacksplash}
                backsplashMaterial={backsplashMaterial}
                backsplashHeight={backsplashHeight}
                includeVanityLighting={includeVanityLighting}
                vanityLightingStyle={vanityLightingStyle}
                vanityLightBrightness={vanityLightBrightness}
                vanityLightTemp={vanityLightTemp}
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
                onIncludeFaucetChange={setIncludeFaucet}
                onFaucetStyleChange={(v) => setFaucetStyle(v as any)}
                onFaucetFinishChange={(v) => setFaucetFinish(v as any)}
                onIncludeBacksplashChange={setIncludeBacksplash}
                onBacksplashMaterialChange={(v) => setBacksplashMaterial(v as any)}
                onBacksplashHeightChange={(v) => setBacksplashHeight(v as any)}
                onIncludeVanityLightingChange={setIncludeVanityLighting}
                onVanityLightingStyleChange={(v) => setVanityLightingStyle(v as any)}
                onVanityLightBrightnessChange={(v) => setVanityLightBrightness(v[0])}
                onVanityLightTempChange={(v) => setVanityLightTemp(v[0])}
                onIncludeMirrorChange={setIncludeMirror}
                onMirrorTypeChange={(v) => setMirrorType(v as any)}
                onMirrorSizeChange={(v) => setMirrorSize(v as any)}
                onMirrorShapeChange={(v) => setMirrorShape(v as any)}
                onMirrorFrameChange={(v) => setMirrorFrame(v as any)}
                onIncludeTowelBarChange={setIncludeTowelBar}
                onTowelBarPositionChange={(v) => setTowelBarPosition(v as any)}
                onIncludeToiletPaperHolderChange={setIncludeToiletPaperHolder}
                onIncludeRobeHooksChange={setIncludeRobeHooks}
                onRobeHookCountChange={(v) => setRobeHookCount(v[0])}
                onIncludeShelvingChange={setIncludeShelving}
                onShelvingTypeChange={(v) => setShelvingType(v as any)}
              />
            </div>
          </Card>

          <VanityPricingSummary pricing={pricing} />

          <div className="flex gap-4">
            <Button onClick={() => setSaveDialogOpen(true)} variant="outline" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="flex-1">
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Save your current vanity configuration as a template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Master Bath Vanity"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public"
                checked={saveAsPublic}
                onCheckedChange={(checked) => setSaveAsPublic(checked as boolean)}
              />
              <Label htmlFor="public">Make template public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSaveTemplate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <TexturePreviewModal
        isOpen={!!previewTexture}
        onClose={() => setPreviewTexture(null)}
        brand={selectedBrand}
        finish={previewTexture || ""}
      />
    </div>
  );
};
