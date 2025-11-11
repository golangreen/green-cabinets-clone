import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CabinetSpec } from "@/lib/cabinetCatalog";
import {
  getCabinetTypes,
  getCategoriesForType,
  getCabinetsByCategory,
  getDoorStyle,
  getMaterialFinish,
  calculateCabinetPrice,
  formatPrice,
  getCatalogData,
} from "@/services/cabinetCatalogService";
import { DoorStylePreview } from "@/components/DoorStylePreview";
import { 
  Box, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Sparkles,
  Download,
  FileImage,
  FileText
} from "lucide-react";
import { z } from "zod";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// Validation schema
const cabinetSelectionSchema = z.object({
  cabinet: z.custom<CabinetSpec>((val) => val !== null, {
    message: "Please select a cabinet",
  }),
  finishId: z.string().min(1, "Please select a finish"),
  doorStyleId: z.string().min(1, "Please select a door style"),
  handleType: z.enum(["bar", "knob", "fingerPull", "fingerPull45", "none"], {
    errorMap: () => ({ message: "Please select a handle type" }),
  }),
  numHandles: z.number().min(1).max(6),
});

type CabinetSelection = z.infer<typeof cabinetSelectionSchema>;

interface CabinetWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (cabinet: CabinetSpec, config: Omit<CabinetSelection, 'cabinet'>) => void;
}

export function CabinetWizard({ open, onOpenChange, onComplete }: CabinetWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCabinet, setSelectedCabinet] = useState<CabinetSpec | null>(null);
  const [selectedFinishId, setSelectedFinishId] = useState<string>("tafisa-white");
  const [selectedDoorStyleId, setSelectedDoorStyleId] = useState<string>("flat-framed");
  const [selectedHandleType, setSelectedHandleType] = useState<"bar" | "knob" | "fingerPull" | "fingerPull45" | "none">("bar");
  const [numHandles, setNumHandles] = useState(2);
  const [comparisonStyles, setComparisonStyles] = useState<string[]>([]);
  const [comparisonFinishes, setComparisonFinishes] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const comparisonRef = useRef<HTMLDivElement>(null);
  const finishComparisonRef = useRef<HTMLDivElement>(null);

  const totalSteps = 5;
  
  // Get catalog data once
  const { doorStyles, materialFinishes, hardwareOptions } = getCatalogData();

  // Export comparison as image
  const exportAsImage = async () => {
    const ref = comparisonStyles.length > 0 ? comparisonRef.current : finishComparisonRef.current;
    if (!ref || (comparisonStyles.length === 0 && comparisonFinishes.length === 0)) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(ref, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          const type = comparisonStyles.length > 0 ? 'door-style' : 'finish';
          link.download = `${type}-comparison-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Comparison exported as image!");
        }
      });
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image");
    } finally {
      setIsExporting(false);
    }
  };

  // Export comparison as PDF
  const exportAsPDF = async () => {
    const ref = comparisonStyles.length > 0 ? comparisonRef.current : finishComparisonRef.current;
    if (!ref || (comparisonStyles.length === 0 && comparisonFinishes.length === 0)) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(ref, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const type = comparisonStyles.length > 0 ? 'door-style' : 'finish';
      pdf.save(`${type}-comparison-${Date.now()}.pdf`);
      toast.success("Comparison exported as PDF!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset wizard when closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setSelectedType(null);
      setSelectedCategory(null);
      setSelectedCabinet(null);
      setSelectedFinishId("tafisa-white");
      setSelectedDoorStyleId("flat-framed");
      setSelectedHandleType("bar");
      setNumHandles(2);
      setComparisonStyles([]);
      setComparisonFinishes([]);
    }
    onOpenChange(open);
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    if (!selectedCabinet) return;

    try {
      cabinetSelectionSchema.parse({
        cabinet: selectedCabinet,
        finishId: selectedFinishId,
        doorStyleId: selectedDoorStyleId,
        handleType: selectedHandleType,
        numHandles,
      });

      onComplete(selectedCabinet, {
        finishId: selectedFinishId,
        doorStyleId: selectedDoorStyleId,
        handleType: selectedHandleType,
        numHandles,
      });
      handleOpenChange(false);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Get unique cabinet types from service
  const cabinetTypes = getCabinetTypes();

  // Get categories for selected type from service
  const categories = selectedType ? getCategoriesForType(selectedType) : [];

  // Get cabinets for selected category from service
  const cabinetsForCategory = selectedCategory ? getCabinetsByCategory(selectedCategory) : [];

  // Calculate current price
  const currentPrice = selectedCabinet 
    ? calculateCabinetPrice(selectedCabinet, selectedFinishId, selectedDoorStyleId, selectedHandleType, numHandles)
    : 0;

  // Check if can proceed to next step
  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return selectedCategory !== null;
      case 3:
        return selectedCabinet !== null;
      case 4:
        return selectedFinishId !== null && selectedDoorStyleId !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Add Cabinet Wizard
          </DialogTitle>
          <DialogDescription>
            Step {step} of {totalSteps} - {step === 1 ? "Select Cabinet Type" : step === 2 ? "Select Category" : step === 3 ? "Select Size" : step === 4 ? "Choose Finish & Style" : "Review & Confirm"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Cabinet Type */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                {cabinetTypes.map((type) => {
                  const count = getCabinetsByCategory(type).length;
                  return (
                    <Card
                      key={type}
                      className={`p-4 cursor-pointer transition-all hover:border-primary ${
                        selectedType === type ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedType(type);
                        setSelectedCategory(null);
                        setSelectedCabinet(null);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{type}</h4>
                          <p className="text-xs text-muted-foreground">{count} options available</p>
                        </div>
                        {selectedType === type && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {step === 2 && selectedType && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                {categories.map((category) => {
                  const count = getCabinetsByCategory(category).length;
                  return (
                    <Card
                      key={category}
                      className={`p-3 cursor-pointer transition-all hover:border-primary ${
                        selectedCategory === category ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedCabinet(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{category}</h4>
                          <p className="text-xs text-muted-foreground">{count} cabinets</p>
                        </div>
                        {selectedCategory === category && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Cabinet Selection */}
          {step === 3 && selectedCategory && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                {cabinetsForCategory.map((cabinet) => (
                  <Card
                    key={cabinet.code}
                    className={`p-3 cursor-pointer transition-all hover:border-primary ${
                      selectedCabinet?.code === cabinet.code ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedCabinet(cabinet)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{cabinet.label}</h4>
                          <Badge variant="outline" className="text-xs">{cabinet.code}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{cabinet.description}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-muted-foreground">
                            <span className="font-medium">W:</span> {cabinet.width}"
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-medium">H:</span> {cabinet.height}"
                          </span>
                          <span className="text-muted-foreground">
                            <span className="font-medium">D:</span> {cabinet.depth}"
                          </span>
                        </div>
                        {cabinet.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">{cabinet.notes}</p>
                        )}
                      </div>
                      {selectedCabinet?.code === cabinet.code && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finish & Door Style */}
          {step === 4 && selectedCabinet && (
            <div className="space-y-6 py-4">
              {/* Comparison View */}
              {comparisonStyles.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Comparing {comparisonStyles.length} Styles</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportAsImage}
                        disabled={isExporting}
                        className="h-7 text-xs"
                      >
                        <FileImage className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportAsPDF}
                        disabled={isExporting}
                        className="h-7 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setComparisonStyles([])}
                        className="h-7 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div ref={comparisonRef} className={`grid gap-3 ${comparisonStyles.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} bg-white p-4 rounded-lg`}>
                    {comparisonStyles.map((styleId) => {
                      const style = getDoorStyle(styleId);
                      if (!style) return null;
                      return (
                        <Card key={styleId} className="p-3 space-y-2 bg-card">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-foreground">{style.name}</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setComparisonStyles(comparisonStyles.filter(id => id !== styleId))}
                              className="h-6 w-6 p-0 print:hidden"
                            >
                              ×
                            </Button>
                          </div>
                          <div className="w-full h-24 border border-border rounded bg-background">
                            <DoorStylePreview styleId={styleId} className="w-full h-full" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{style.description}</p>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {style.frameType?.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                +{((style.priceMultiplier - 1) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedDoorStyleId === styleId ? "default" : "outline"}
                            onClick={() => setSelectedDoorStyleId(styleId)}
                            className="w-full h-7 text-xs print:hidden"
                          >
                            {selectedDoorStyleId === styleId ? "Selected" : "Select"}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Door Style with Tabs for Frame Types */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Door Style & Frame Type</Label>
                <Tabs defaultValue="framed" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="framed">Framed</TabsTrigger>
                    <TabsTrigger value="frameless">Frameless</TabsTrigger>
                    <TabsTrigger value="inset">Inset</TabsTrigger>
                  </TabsList>
                  
                  {/* Framed Styles */}
                  <TabsContent value="framed" className="space-y-2 mt-3">
                    {doorStyles.filter(s => s.frameType === "framed").map((style) => (
                      <Card
                        key={style.id}
                        className={`p-3 cursor-pointer transition-all hover:border-primary ${
                          selectedDoorStyleId === style.id ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : ""
                        }`}
                        onClick={() => setSelectedDoorStyleId(style.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Visual Preview */}
                          <div className="flex-shrink-0 w-16 h-16 border border-border rounded bg-background">
                            <DoorStylePreview styleId={style.id} className="w-full h-full" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1">{style.name}</h5>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              +{((style.priceMultiplier - 1) * 100).toFixed(0)}% premium
                            </Badge>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {selectedDoorStyleId === style.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (comparisonStyles.includes(style.id)) {
                                  setComparisonStyles(comparisonStyles.filter(id => id !== style.id));
                                } else if (comparisonStyles.length < 3) {
                                  setComparisonStyles([...comparisonStyles, style.id]);
                                }
                              }}
                              disabled={comparisonStyles.length >= 3 && !comparisonStyles.includes(style.id)}
                              className="h-7 text-[10px] px-2"
                            >
                              {comparisonStyles.includes(style.id) ? "Remove" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  {/* Frameless Styles */}
                  <TabsContent value="frameless" className="space-y-2 mt-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 mb-3">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <span className="font-semibold">Frameless (European Style):</span> Full overlay doors with no face frame. Modern, seamless look with easier cleaning.
                      </p>
                    </div>
                    {doorStyles.filter(s => s.frameType === "frameless").map((style) => (
                      <Card
                        key={style.id}
                        className={`p-3 cursor-pointer transition-all hover:border-primary ${
                          selectedDoorStyleId === style.id ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : ""
                        }`}
                        onClick={() => setSelectedDoorStyleId(style.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Visual Preview */}
                          <div className="flex-shrink-0 w-16 h-16 border border-border rounded bg-background">
                            <DoorStylePreview styleId={style.id} className="w-full h-full" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1">{style.name}</h5>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              +{((style.priceMultiplier - 1) * 100).toFixed(0)}% premium
                            </Badge>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {selectedDoorStyleId === style.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (comparisonStyles.includes(style.id)) {
                                  setComparisonStyles(comparisonStyles.filter(id => id !== style.id));
                                } else if (comparisonStyles.length < 3) {
                                  setComparisonStyles([...comparisonStyles, style.id]);
                                }
                              }}
                              disabled={comparisonStyles.length >= 3 && !comparisonStyles.includes(style.id)}
                              className="h-7 text-[10px] px-2"
                            >
                              {comparisonStyles.includes(style.id) ? "Remove" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  {/* Inset Styles */}
                  <TabsContent value="inset" className="space-y-2 mt-3">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mb-3">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        <span className="font-semibold">Inset Construction:</span> Premium doors sit flush inside the face frame. Fine furniture quality with precise fit and traditional craftsmanship.
                      </p>
                    </div>
                    {doorStyles.filter(s => s.frameType === "inset").map((style) => (
                      <Card
                        key={style.id}
                        className={`p-3 cursor-pointer transition-all hover:border-primary ${
                          selectedDoorStyleId === style.id ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : ""
                        }`}
                        onClick={() => setSelectedDoorStyleId(style.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Visual Preview */}
                          <div className="flex-shrink-0 w-16 h-16 border border-border rounded bg-background">
                            <DoorStylePreview styleId={style.id} className="w-full h-full" />
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1">{style.name}</h5>
                            <p className="text-xs text-muted-foreground">{style.description}</p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              +{((style.priceMultiplier - 1) * 100).toFixed(0)}% premium
                            </Badge>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            {selectedDoorStyleId === style.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (comparisonStyles.includes(style.id)) {
                                  setComparisonStyles(comparisonStyles.filter(id => id !== style.id));
                                } else if (comparisonStyles.length < 3) {
                                  setComparisonStyles([...comparisonStyles, style.id]);
                                }
                              }}
                              disabled={comparisonStyles.length >= 3 && !comparisonStyles.includes(style.id)}
                              className="h-7 text-[10px] px-2"
                            >
                              {comparisonStyles.includes(style.id) ? "Remove" : "Compare"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Finish Comparison View */}
              {comparisonFinishes.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Comparing {comparisonFinishes.length} Finishes</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportAsImage}
                        disabled={isExporting}
                        className="h-7 text-xs"
                      >
                        <FileImage className="h-3 w-3 mr-1" />
                        PNG
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportAsPDF}
                        disabled={isExporting}
                        className="h-7 text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setComparisonFinishes([])}
                        className="h-7 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div ref={finishComparisonRef} className={`grid gap-3 ${comparisonFinishes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} bg-white p-4 rounded-lg`}>
                    {comparisonFinishes.map((finishId) => {
                      const finish = getMaterialFinish(finishId);
                      if (!finish) return null;
                      return (
                        <Card key={finishId} className="p-3 space-y-2 bg-card">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-foreground">{finish.name}</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setComparisonFinishes(comparisonFinishes.filter(id => id !== finishId))}
                              className="h-6 w-6 p-0 print:hidden"
                            >
                              ×
                            </Button>
                          </div>
                          <div className="w-full h-24 border border-border rounded bg-gradient-to-br from-muted to-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">{finish.brand}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">{finish.brand}</p>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {finish.brand}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {finish.priceMultiplier}x
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedFinishId === finishId ? "default" : "outline"}
                            onClick={() => setSelectedFinishId(finishId)}
                            className="w-full h-7 text-xs print:hidden"
                          >
                            {selectedFinishId === finishId ? "Selected" : "Select"}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Finish */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Finish</Label>
                <div className="space-y-3">
                  {["Tafisa", "Egger", "Shinnoki"].map((brand) => (
                    <div key={brand}>
                      <Label className="text-xs text-muted-foreground mb-2 block">{brand}</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {materialFinishes.filter(f => f.brand === brand).map((finish) => (
                          <Card
                            key={finish.id}
                            className={`p-2 cursor-pointer transition-all hover:border-primary ${
                              selectedFinishId === finish.id ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" : ""
                            }`}
                            onClick={() => setSelectedFinishId(finish.id)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="text-sm font-medium">{finish.name}</div>
                                <Badge variant="outline" className="text-xs">
                                  {finish.priceMultiplier}x
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {selectedFinishId === finish.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (comparisonFinishes.includes(finish.id)) {
                                      setComparisonFinishes(comparisonFinishes.filter(id => id !== finish.id));
                                    } else if (comparisonFinishes.length < 3) {
                                      setComparisonFinishes([...comparisonFinishes, finish.id]);
                                    }
                                  }}
                                  disabled={comparisonFinishes.length >= 3 && !comparisonFinishes.includes(finish.id)}
                                  className="h-6 text-[10px] px-2"
                                >
                                  {comparisonFinishes.includes(finish.id) ? "Remove" : "Compare"}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Hardware</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-2 block">Handle Type</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(hardwareOptions.handles).map(([key, value]) => (
                        <Card
                          key={key}
                          className={`p-2 cursor-pointer transition-all hover:border-primary ${
                            selectedHandleType === key ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => setSelectedHandleType(key as "bar" | "knob" | "fingerPull" | "fingerPull45" | "none")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{value.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatPrice(value.pricePerUnit)} each
                              </Badge>
                            </div>
                            {selectedHandleType === key && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs mb-2 block">Number of Handles</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <Button
                          key={num}
                          variant={numHandles === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNumHandles(num)}
                          className="flex-1"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && selectedCabinet && (
            <div className="space-y-6 py-4">
              <Card className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-4">Configuration Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cabinet:</span>
                    <span className="font-medium">{selectedCabinet.label} - {selectedCabinet.description}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {selectedCabinet.width}"W × {selectedCabinet.height}"H × {selectedCabinet.depth}"D
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Door Style:</span>
                    <span className="font-medium">
                      {getDoorStyle(selectedDoorStyleId)?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Finish:</span>
                    <span className="font-medium">
                      {getMaterialFinish(selectedFinishId)?.brand} - {getMaterialFinish(selectedFinishId)?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hardware:</span>
                    <span className="font-medium">
                      {numHandles}× {hardwareOptions.handles[selectedHandleType].name}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-semibold">Estimated Price:</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <div className="flex gap-3">
                  <Box className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Cabinet will be added to canvas</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      You can drag it to position, rotate, and further customize properties after adding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 border-t pt-4">
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {currentPrice > 0 && step > 3 && (
            <div className="text-sm font-semibold text-primary">
              {formatPrice(currentPrice)}
            </div>
          )}

          <div className="flex gap-2">
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!selectedCabinet}
                className="gap-2 bg-primary"
              >
                <Check className="h-4 w-4" />
                Add to Canvas
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
