import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";
import {
  Save,
  Share2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Eye,
  Ruler,
  Palette,
  Package,
  FileDown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  View,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const VanityDesigner = () => {
  const [activeView, setActiveView] = useState<"measurement" | "render">("measurement");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Configuration state
  const [width, setWidth] = useState(48);
  const [height, setHeight] = useState(34);
  const [depth, setDepth] = useState(21);
  const [brand, setBrand] = useState<"EGGER" | "TAFISA">("EGGER");
  const [finish, setFinish] = useState("Walnut");
  const [doorStyle, setDoorStyle] = useState("shaker");
  const [countertop, setCountertop] = useState("quartz");
  const [handleStyle, setHandleStyle] = useState("bar");
  const [sinkStyle, setSinkStyle] = useState<"undermount" | "vessel" | "integrated">("undermount");
  const [sinkShape, setSinkShape] = useState<"rectangular" | "oval" | "square">("rectangular");

  const handleSaveConfig = () => {
    toast.success("Configuration saved!");
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Streamlined Top Menu */}
      <div className="h-12 bg-card border-b border-border flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold">Cabinet Designer</h1>
          <Separator orientation="vertical" className="h-6" />
          
          {/* View Mode Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "measurement" | "render")}>
            <TabsList>
              <TabsTrigger value="measurement" className="gap-2 text-xs">
                <Ruler className="h-3.5 w-3.5" />
                Measurements
              </TabsTrigger>
              <TabsTrigger value="render" className="gap-2 text-xs">
                <View className="h-3.5 w-3.5" />
                3D View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Separator orientation="vertical" className="h-6" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>New Design</DropdownMenuItem>
              <DropdownMenuItem>Open...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSaveConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem>Save As...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Wireframe
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Redo className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button variant="ghost" size="sm" className="h-8">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        {leftPanelOpen && (
          <aside className="w-80 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {activeView === "measurement" ? "Dimensions" : "Materials"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setLeftPanelOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {activeView === "measurement" ? (
                // Measurement View - Simple dimension controls
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm">Width (inches)</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Height (inches)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Depth (inches)</Label>
                    <Input
                      type="number"
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <Label className="text-sm mb-2 block">Cabinet Type</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Base Cabinet", "Wall Cabinet", "Tall Cabinet"].map((type) => (
                        <Button key={type} variant="outline" size="sm">
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // 3D View - Full material controls
                <Accordion type="multiple" defaultValue={["materials", "hardware"]} className="w-full">
                  <AccordionItem value="materials" className="border-b border-border">
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Materials & Finishes</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm mb-2 block">Cabinet Brand</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["EGGER", "TAFISA"].map((b) => (
                              <Button
                                key={b}
                                variant={brand === b ? "default" : "outline"}
                                size="sm"
                                onClick={() => setBrand(b as "EGGER" | "TAFISA")}
                              >
                                {b}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Finish</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(brand === "EGGER"
                              ? ["Walnut", "White Oak", "Casella Oak"]
                              : ["White", "Cream Puff", "Milky Way Grey"]
                            ).map((f) => (
                              <Button
                                key={f}
                                variant={finish === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFinish(f)}
                              >
                                {f}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Door Style</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["shaker", "flat", "raised", "slab"].map((style) => (
                              <Button
                                key={style}
                                variant={doorStyle === style ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDoorStyle(style)}
                              >
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Countertop Material</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["quartz", "granite", "marble", "laminate"].map((c) => (
                              <Button
                                key={c}
                                variant={countertop === c ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCountertop(c)}
                              >
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="hardware" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Hardware & Fixtures</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm mb-2 block">Handle Style</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["bar", "knob", "cup", "edge"].map((h) => (
                              <Button
                                key={h}
                                variant={handleStyle === h ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHandleStyle(h)}
                              >
                                {h.charAt(0).toUpperCase() + h.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Sink Style</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["undermount", "vessel", "integrated"] as const).map((s) => (
                              <Button
                                key={s}
                                variant={sinkStyle === s ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSinkStyle(s)}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Sink Shape</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["rectangular", "oval", "square"] as const).map((s) => (
                              <Button
                                key={s}
                                variant={sinkShape === s ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSinkShape(s)}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </aside>
        )}

        {!leftPanelOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="m-2 h-10 w-10"
            onClick={() => setLeftPanelOpen(true)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {/* Center - Main Viewport */}
        <div className="flex-1 bg-muted/30 relative flex items-center justify-center">
          {activeView === "measurement" ? (
            // 2D Measurement View
            <div className="w-full h-full overflow-auto">
              <div 
                className="min-w-full min-h-full p-8"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              >
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="border-2 border-primary bg-card/50 relative mx-auto"
                    style={{
                      width: `${width * 8}px`,
                      height: `${depth * 8}px`,
                    }}
                  >
                    {/* Top Dimension */}
                    <div className="absolute -top-8 left-0 right-0 flex justify-center">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                        {width}"
                      </div>
                    </div>
                    
                    {/* Left Dimension */}
                    <div className="absolute top-0 -left-16 bottom-0 flex items-center">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium -rotate-90">
                        {depth}"
                      </div>
                    </div>
                    
                    {/* Cabinet Interior */}
                    <div className="absolute inset-4 border border-dashed border-muted-foreground/50 bg-accent/20">
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center">
                          <div className="font-medium">{brand}</div>
                          <div className="text-xs">{finish}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Specifications Panel */}
                  <div className="mt-8 bg-card border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-sm mb-4">Cabinet Specifications</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Dimensions</div>
                        <div className="text-sm font-medium">{width}" W × {height}" H × {depth}" D</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Material Brand</div>
                        <div className="text-sm font-medium">{brand}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Finish</div>
                        <div className="text-sm font-medium">{finish}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Door Style</div>
                        <div className="text-sm font-medium capitalize">{doorStyle}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Countertop</div>
                        <div className="text-sm font-medium capitalize">{countertop}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Hardware</div>
                        <div className="text-sm font-medium capitalize">{handleStyle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 3D Render View
            <>
              <Vanity3DPreview
                width={width}
                height={height}
                depth={depth}
                brand={brand}
                finish={finish}
                doorStyle={doorStyle}
                handleStyle={handleStyle}
                numDrawers={3}
                sinkStyle={sinkStyle}
                sinkShape={sinkShape}
              />

              {/* Info Overlay */}
              <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-lg">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{width}" × {height}" × {depth}"</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="text-muted-foreground">
                    {brand} • {finish}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Summary */}
        {rightPanelOpen && (
          <aside className="w-72 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Configuration</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRightPanelOpen(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Specifications</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">{width}×{height}×{depth}"</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Brand</span>
                      <span className="font-medium">{brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Finish</span>
                      <span className="font-medium">{finish}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Door Style</span>
                      <span className="font-medium capitalize">{doorStyle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Countertop</span>
                      <span className="font-medium capitalize">{countertop}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Pricing</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">$3,499</div>
                    <div className="text-xs text-muted-foreground mt-1">Estimated base price</div>
                  </div>
                </div>

                <Button onClick={handleSaveConfig} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </aside>
        )}

        {!rightPanelOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="m-2 h-10 w-10"
            onClick={() => setRightPanelOpen(true)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VanityDesigner;
