import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Box,
  Ruler,
  Palette,
  Package,
  FileDown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
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
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Vanity Designer</h1>
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
        {/* Left Panel - Design Controls */}
        {leftPanelOpen && (
          <aside className="w-80 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Design Controls</h2>
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
              <Accordion type="multiple" defaultValue={["dimensions", "materials"]} className="w-full">
                <AccordionItem value="dimensions" className="border-b border-border">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Dimensions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
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
                    </div>
                  </AccordionContent>
                </AccordionItem>

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

        {/* Center - 3D Viewport */}
        <div className="flex-1 bg-muted/30 relative flex items-center justify-center">
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hardware</span>
                      <span className="font-medium capitalize">{handleStyle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sink</span>
                      <span className="font-medium capitalize">{sinkStyle} • {sinkShape}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Pricing</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Total</span>
                      <span className="text-2xl font-bold">
                        ${((width * height * depth) / 100 + 500).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleSaveConfig}>
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
