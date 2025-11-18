import { useState, useRef } from "react";
import { TexturePreviewModal } from "./TexturePreviewModal";
import { EmailQuoteDialog } from "./EmailQuoteDialog";
import { SharePreviewCard } from "./SharePreviewCard";
import { VanityControls } from "./VanityControls";
import { VanityPreviewSection } from "./VanityPreviewSection";
import { VanityPricingCard } from "./VanityPricingCard";
import { VanityActions } from "./VanityActions";
import { FullscreenPreview } from "./FullscreenPreview";
import { useVanityConfig, useSavedTemplates } from "@/features/vanity-designer";
import { calculateCompletePricing, generateVanityQuotePDF, generateShareableURL } from "@/features/vanity-designer/services";
import { toast } from "sonner";
import { getEggerColorNames } from "@/lib/eggerColors";
import { getTafisaColorNames } from "@/lib/tafisaColors";
import { vanityService } from "@/services";
import { logger } from "@/lib/logger";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

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
  const vanityConfig = useVanityConfig();
  const { savedTemplates, saveTemplate } = useSavedTemplates();
  
  // Performance monitoring
  const { markStart, measureOperation } = usePerformanceMonitor({
    name: 'VanityDesignerApp',
    trackMount: true,
    trackRender: true,
    metadata: {
      brand: vanityConfig.selectedBrand,
      finish: vanityConfig.selectedFinish,
    },
  });
  
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
    const mark = markStart('texture-selection');
    setSelectedTexture(finishName);
    setTextureModalOpen(true);
    vanityConfig.setSelectedFinish(finishName);
    measureOperation('texture-selection', mark.name);
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

    const mark = markStart('pdf-generation');
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
      measureOperation('pdf-generation', mark.name);
    } catch (error) {
      logger.error('Error generating PDF', error, { component: 'VanityDesignerApp' });
      toast.dismiss();
      toast.error("Failed to generate PDF");
      measureOperation('pdf-generation', mark.name);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please configure your vanity first");
      return;
    }

    const mark = markStart('share-url-generation');
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
      measureOperation('share-url-generation', mark.name);
    } catch (error) {
      logger.error('Error generating share link', error, { component: 'VanityDesignerApp' });
      toast.error("Failed to generate share link");
      measureOperation('share-url-generation', mark.name);
    }
  };

  const handleEmailQuote = async (email: string, name: string, ccSales: boolean) => {
    if (!vanityConfig.selectedBrand || !vanityConfig.selectedFinish) {
      toast.error("Please configure your vanity first");
      return;
    }

    const mark = markStart('quote-email-send');
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

      // Call service to send email with PDF
      await vanityService.emailQuotePDF(
        email,
        name,
        ccSales,
        pdfBase64,
        {
          brand: vanityConfig.selectedBrand,
          finish: vanityConfig.selectedFinish,
          width: vanityConfig.dimensionsInInches.width,
          height: vanityConfig.dimensionsInInches.height,
          depth: vanityConfig.dimensionsInInches.depth,
          doorStyle: vanityConfig.doorStyle,
          totalPrice: totalPrice,
        }
      );

      toast.dismiss();
      toast.success("Quote sent successfully! Check your email.");
      measureOperation('quote-email-send', mark.name);
    } catch (error) {
      logger.error('Error sending quote', error, { component: 'VanityDesignerApp' });
      toast.dismiss();
      toast.error("Failed to send quote. Please try again.");
      measureOperation('quote-email-send', mark.name);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Fullscreen Preview Mode */}
      {fullscreenPreview && (
        <FullscreenPreview
          vanityConfig={vanityConfig}
          onClose={() => setFullscreenPreview(false)}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Custom Vanity Designer</h1>
          <p className="text-muted-foreground">Design your perfect bathroom vanity in 3D</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <VanityControls
              vanityConfig={vanityConfig}
              availableFinishes={availableFinishes}
              brands={BRANDS}
              brandInfo={BRAND_INFO}
              onTextureClick={handleTextureClick}
            />
            
            <VanityPricingCard
              basePrice={basePrice}
              wallPrice={wallPrice}
              floorPrice={floorPrice}
              totalPrice={totalPrice}
            />
            
            <VanityActions
              onSave={handleSaveTemplate}
              onExportPDF={handleExportPDF}
              onEmailQuote={() => setEmailDialogOpen(true)}
              onShare={handleShare}
              isExporting={isExporting}
            />
          </div>

          {/* 3D Preview Panel */}
          <VanityPreviewSection
            ref={previewRef}
            vanityConfig={vanityConfig}
            onFullscreenClick={() => setFullscreenPreview(true)}
          />
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
