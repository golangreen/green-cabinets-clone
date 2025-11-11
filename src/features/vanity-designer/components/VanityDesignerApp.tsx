import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { TextureSwatch } from "./TextureSwatch";
import { TexturePreviewModal } from "./TexturePreviewModal";
import { EmailQuoteDialog } from "./EmailQuoteDialog";
import { SharePreviewCard } from "./SharePreviewCard";
import { useVanityConfig, useSavedTemplates } from "@/features/vanity-designer";
import { calculateCompletePricing, formatPrice, generateVanityQuotePDF, generateShareableURL, copyToClipboard } from "@/features/vanity-designer/services";
import { toast } from "sonner";
import { Save, Download, Share2, Maximize2, Scan, X, Mail } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getEggerColorNames } from "@/lib/eggerColors";
import { getTafisaColorNames } from "@/lib/tafisaColors";
import { supabase } from "@/integrations/supabase/client";

const EGGER_FINISHES = getEggerColorNames();
const TAFISA_FINISHES = getTafisaColorNames();
const SHINNOKI_FINISHES = [
  'Bondi Oak', 'Milk Oak', 'Pebble Triba', 'Ivory Oak', 'Ivory Infinite Oak',
  'Natural Oak', 'Frozen Walnut', 'Manhattan Oak', 'Desert Oak', 'Sahara Oak',
  'Terra Sapele', 'Cinnamon Triba', 'Smoked Walnut', 'Pure Walnut',
  'Shadow Eucalyptus', 'Burley Oak', 'Stardust Walnut', 'Raven Oak'
];

const BRANDS = ["Tafisa", "Egger", "Shinnoki"];

const BRAND_INFO = {
  Tafisa: { price: 15, description: "Premium Canadian manufacturer" },
  Egger: { price: 18, description: "European luxury finishes" },
  Shinnoki: { price: 22, description: "Ultra-premium wood veneers" },
};

export const VanityDesignerApp = () => {
  const navigate = useNavigate();
  const vanityConfig = useVanityConfig();
  const { savedTemplates, saveTemplate } = useSavedTemplates();
  
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
  const [textureModalOpen, setTextureModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Get available finishes based on selected brand
  const availableFinishes = vanityConfig.selectedBrand 
    ? vanityConfig.selectedBrand === "Tafisa" 
      ? TAFISA_FINISHES
      : vanityConfig.selectedBrand === "Egger"
      ? EGGER_FINISHES
      : SHINNOKI_FINISHES
    : [];

  // Calculate pricing
  const pricing = calculateCompletePricing({
    widthInches: vanityConfig.dimensionsInInches.width,
    selectedBrand: vanityConfig.selectedBrand || '',
    state: vanityConfig.state || '',
    includeWalls: vanityConfig.includeWalls,
    wallHeight: 96,
    wallWidth: vanityConfig.dimensionsInInches.width,
    wallTileStyle: vanityConfig.wallTileColor,
    includeFloor: vanityConfig.includeRoom,
    roomLength: parseFloat(vanityConfig.roomLength) || 0,
    roomWidth: parseFloat(vanityConfig.roomWidth) || 0,
    floorTileStyle: vanityConfig.floorType === "tile" ? vanityConfig.tileColor : vanityConfig.woodFloorFinish,
  });

  const { basePrice, wallPrice, floorPrice, subtotal, tax, shipping, totalPrice } = pricing;

  const handleTextureClick = (finishName: string) => {
    setSelectedTexture(finishName);
    setTextureModalOpen(true);
    vanityConfig.setSelectedFinish(finishName);
  };

  const handleSaveTemplate = () => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please select brand and finish first");
      return;
    }

    const template = {
      id: `template-${Date.now()}`,
      name: `${vanityConfig.selectedBrand} ${vanityConfig.selectedFinish} Vanity`,
      config: {
        brand: vanityConfig.selectedBrand,
        finish: vanityConfig.selectedFinish,
        width: vanityConfig.width,
        widthFraction: vanityConfig.widthFraction,
        height: vanityConfig.height,
        heightFraction: vanityConfig.heightFraction,
        depth: vanityConfig.depth,
        depthFraction: vanityConfig.depthFraction,
        doorStyle: vanityConfig.doorStyle,
        numDrawers: vanityConfig.numDrawers,
        handleStyle: vanityConfig.handleStyle,
        cabinetPosition: vanityConfig.cabinetPosition,
      },
    };

    saveTemplate(template);
    toast.success("Template saved!");
  };

  const handleExportPDF = async () => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please configure your vanity first");
      return;
    }

    setIsExporting(true);
    toast.loading("Generating PDF quote...");

    try {
      await generateVanityQuotePDF(
        {
          brand: vanityConfig.selectedBrand,
          finish: vanityConfig.selectedFinish,
          width: vanityConfig.dimensionsInInches.width,
          height: vanityConfig.dimensionsInInches.height,
          depth: vanityConfig.dimensionsInInches.depth,
          doorStyle: vanityConfig.doorStyle,
          numDrawers: vanityConfig.numDrawers,
          handleStyle: vanityConfig.handleStyle,
          includeRoom: vanityConfig.includeRoom,
          roomLength: vanityConfig.roomLength,
          roomWidth: vanityConfig.roomWidth,
          floorType: vanityConfig.floorType,
          state: vanityConfig.state || 'NY',
        },
        pricing,
        previewRef.current
      );

      toast.dismiss();
      toast.success("PDF quote downloaded!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please configure your vanity first");
      return;
    }

    try {
      const url = generateShareableURL({
        brand: vanityConfig.selectedBrand,
        finish: vanityConfig.selectedFinish,
        width: vanityConfig.width,
        widthFraction: vanityConfig.widthFraction,
        height: vanityConfig.height,
        heightFraction: vanityConfig.heightFraction,
        depth: vanityConfig.depth,
        depthFraction: vanityConfig.depthFraction,
        doorStyle: vanityConfig.doorStyle,
        numDrawers: vanityConfig.numDrawers,
        handleStyle: vanityConfig.handleStyle,
        cabinetPosition: vanityConfig.cabinetPosition,
        includeRoom: vanityConfig.includeRoom,
        roomLength: vanityConfig.roomLength,
        roomWidth: vanityConfig.roomWidth,
        floorType: vanityConfig.floorType,
        tileColor: vanityConfig.tileColor,
        woodFloorFinish: vanityConfig.woodFloorFinish,
        includeWalls: vanityConfig.includeWalls,
        wallTileColor: vanityConfig.wallTileColor,
        state: vanityConfig.state || '',
      });

      setShareUrl(url);
      setShareModalOpen(true);
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error("Failed to generate share link");
    }
  };

  const handleEmailQuote = async (email: string, name: string, ccSales: boolean) => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please configure your vanity first");
      return;
    }

    toast.loading("Generating and sending quote...");

    try {
      // Generate PDF as blob
      const pdfDoc = await generateVanityQuotePDF(
        {
          brand: vanityConfig.selectedBrand,
          finish: vanityConfig.selectedFinish,
          width: vanityConfig.dimensionsInInches.width,
          height: vanityConfig.dimensionsInInches.height,
          depth: vanityConfig.dimensionsInInches.depth,
          doorStyle: vanityConfig.doorStyle,
          numDrawers: vanityConfig.numDrawers,
          handleStyle: vanityConfig.handleStyle,
          includeRoom: vanityConfig.includeRoom,
          roomLength: vanityConfig.roomLength,
          roomWidth: vanityConfig.roomWidth,
          floorType: vanityConfig.floorType,
          state: vanityConfig.state || 'NY',
        },
        pricing,
        previewRef.current
      );

      // Get PDF as base64 (jsPDF output method returns base64 when using 'datauristring')
      const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];

      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-vanity-quote-email', {
        body: {
          recipientEmail: email,
          recipientName: name,
          ccSalesTeam: ccSales,
          pdfBase64,
          vanityConfig: {
            brand: vanityConfig.selectedBrand,
            finish: vanityConfig.selectedFinish,
            width: vanityConfig.dimensionsInInches.width,
            height: vanityConfig.dimensionsInInches.height,
            depth: vanityConfig.dimensionsInInches.depth,
            doorStyle: vanityConfig.doorStyle,
            totalPrice: totalPrice,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.dismiss();
      toast.success("Quote sent successfully! Check your email.");
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.dismiss();
      toast.error("Failed to send quote. Please try again.");
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Fullscreen Preview Mode */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-lg font-bold">Vanity Designer - 3D Preview</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullscreenPreview(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="h-full pt-16">
            <Vanity3DPreview
              width={vanityConfig.dimensionsInInches.width}
              height={vanityConfig.dimensionsInInches.height}
              depth={vanityConfig.dimensionsInInches.depth}
              brand={vanityConfig.selectedBrand}
              finish={vanityConfig.selectedFinish}
              doorStyle={vanityConfig.doorStyle}
              numDrawers={vanityConfig.numDrawers}
              handleStyle={vanityConfig.handleStyle}
              cabinetPosition={vanityConfig.cabinetPosition}
              fullscreen={true}
              includeRoom={vanityConfig.includeRoom}
              roomLength={parseFloat(vanityConfig.roomLength) * 12 || 0}
              roomWidth={parseFloat(vanityConfig.roomWidth) * 12 || 0}
              roomHeight={96}
              floorType={vanityConfig.floorType}
              tileColor={vanityConfig.tileColor}
              woodFloorFinish={vanityConfig.woodFloorFinish}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Custom Vanity Designer</h1>
          <p className="text-muted-foreground">Design your perfect bathroom vanity in 3D</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Brand & Finish</h3>
                <div className="space-y-3">
                  <Select value={vanityConfig.selectedBrand} onValueChange={vanityConfig.setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand} - ${BRAND_INFO[brand as keyof typeof BRAND_INFO]?.price}/lf
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {vanityConfig.selectedBrand && (
                    <>
                      <Select value={vanityConfig.selectedFinish} onValueChange={vanityConfig.setSelectedFinish}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select finish" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableFinishes.map((finish) => (
                            <SelectItem key={finish} value={finish}>
                              {finish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex flex-wrap gap-2 p-3 bg-secondary/10 rounded-lg max-h-40 overflow-y-auto">
                        {availableFinishes.slice(0, 12).map((finish) => (
                          <TextureSwatch
                            key={finish}
                            finishName={finish}
                            brand={vanityConfig.selectedBrand}
                            selected={vanityConfig.selectedFinish === finish}
                            onClick={() => handleTextureClick(finish)}
                            size="sm"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dimensions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.ROOM_SCAN)}
                    className="gap-2 hover:bg-[#2dd4bf]/20 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/60 transition-all duration-300"
                  >
                    <Scan className="h-4 w-4" />
                    3D Scan
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Width (in)</Label>
                    <Input
                      type="number"
                      value={vanityConfig.width}
                      onChange={(e) => vanityConfig.setWidth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Height (in)</Label>
                    <Input
                      type="number"
                      value={vanityConfig.height}
                      onChange={(e) => vanityConfig.setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Depth (in)</Label>
                    <Input
                      type="number"
                      value={vanityConfig.depth}
                      onChange={(e) => vanityConfig.setDepth(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Cabinet Style</h3>
                <div className="space-y-3">
                  <Select value={vanityConfig.doorStyle} onValueChange={vanityConfig.setDoorStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Door</SelectItem>
                      <SelectItem value="double">Double Doors</SelectItem>
                      <SelectItem value="drawers">All Drawers</SelectItem>
                      <SelectItem value="mixed">Drawers + Doors</SelectItem>
                      <SelectItem value="door-drawer-split">Door + Drawer</SelectItem>
                    </SelectContent>
                  </Select>

                  {(vanityConfig.doorStyle === 'drawers' || 
                    vanityConfig.doorStyle === 'mixed' || 
                    vanityConfig.doorStyle === 'door-drawer-split') && (
                    <Select 
                      value={vanityConfig.numDrawers.toString()} 
                      onValueChange={(val) => vanityConfig.setNumDrawers(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Drawer{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={vanityConfig.handleStyle} onValueChange={vanityConfig.setHandleStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Handles</SelectItem>
                      <SelectItem value="knob">Knobs</SelectItem>
                      <SelectItem value="recessed">Push-to-Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Room Layout</h3>
                  <Checkbox
                    checked={vanityConfig.includeRoom}
                    onCheckedChange={(checked) => vanityConfig.setIncludeRoom(checked as boolean)}
                  />
                </div>
                {vanityConfig.includeRoom && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Length (ft)</Label>
                        <Input
                          type="number"
                          value={vanityConfig.roomLength}
                          onChange={(e) => vanityConfig.setRoomLength(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Width (ft)</Label>
                        <Input
                          type="number"
                          value={vanityConfig.roomWidth}
                          onChange={(e) => vanityConfig.setRoomWidth(e.target.value)}
                        />
                      </div>
                    </div>

                    <Select value={vanityConfig.floorType} onValueChange={vanityConfig.setFloorType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tile">Tile ($15/sqft)</SelectItem>
                        <SelectItem value="wood">Wood ($12/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            {basePrice > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vanity:</span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>
                  {wallPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Walls:</span>
                      <span className="font-medium">{formatPrice(wallPrice)}</span>
                    </div>
                  )}
                  {floorPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flooring:</span>
                      <span className="font-medium">{formatPrice(floorPrice)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleSaveTemplate} 
                className="gap-2 bg-[#2dd4bf]/20 hover:bg-[#2dd4bf]/40 border border-[#2dd4bf]/60 hover:border-[#2dd4bf] text-[#2dd4bf] shadow-2xl hover:shadow-[#2dd4bf]/50 transition-all duration-300 hover:scale-105"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-[#2dd4bf]/20 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/60 transition-all duration-300"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Generating..." : "Export PDF"}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-[#2dd4bf]/20 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/60 transition-all duration-300"
                onClick={() => setEmailDialogOpen(true)}
              >
                <Mail className="h-4 w-4" />
                Email Quote
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-[#2dd4bf]/20 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/60 transition-all duration-300"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </Card>

          {/* 3D Preview Panel */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">3D Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreenPreview(true)}
                className="gap-2 hover:bg-[#2dd4bf]/20 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/60 transition-all duration-300"
              >
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </Button>
            </div>
            <div ref={previewRef} className="aspect-video bg-secondary/20 rounded-lg overflow-hidden">
              <Vanity3DPreview
                width={vanityConfig.dimensionsInInches.width}
                height={vanityConfig.dimensionsInInches.height}
                depth={vanityConfig.dimensionsInInches.depth}
                brand={vanityConfig.selectedBrand}
                finish={vanityConfig.selectedFinish}
                doorStyle={vanityConfig.doorStyle}
                numDrawers={vanityConfig.numDrawers}
                handleStyle={vanityConfig.handleStyle}
                cabinetPosition={vanityConfig.cabinetPosition}
                fullscreen={false}
                includeRoom={vanityConfig.includeRoom}
                roomLength={parseFloat(vanityConfig.roomLength) * 12 || 0}
                roomWidth={parseFloat(vanityConfig.roomWidth) * 12 || 0}
                roomHeight={96}
                floorType={vanityConfig.floorType}
                tileColor={vanityConfig.tileColor}
                woodFloorFinish={vanityConfig.woodFloorFinish}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Texture Preview Modal */}
      {selectedTexture && vanityConfig.selectedBrand && (
        <TexturePreviewModal
          open={textureModalOpen}
          onOpenChange={setTextureModalOpen}
          finishName={selectedTexture}
          brand={vanityConfig.selectedBrand}
          onSelect={() => {
            vanityConfig.setSelectedFinish(selectedTexture);
            setTextureModalOpen(false);
            toast.success(`${selectedTexture} selected`);
          }}
        />
      )}

      {/* Email Quote Dialog */}
      <EmailQuoteDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onSendEmail={handleEmailQuote}
      />

      {/* Share QR Code Modal */}
      <SharePreviewCard
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        shareUrl={shareUrl}
      />
    </div>
  );
};
