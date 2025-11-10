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
  const [cabinetType, setCabinetType] = useState<"vanity" | "closet">("vanity");
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
  
  // Closet-specific options
  const [shelfCount, setShelfCount] = useState(3);
  const [drawerCount, setDrawerCount] = useState(2);
  const [hangingRodCount, setHangingRodCount] = useState(1);
  const [hasShoeRack, setHasShoeRack] = useState(false);
  const [hasMirror, setHasMirror] = useState(false);

  // View controls
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  // History management
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = () => {
    const config = { width, height, depth, brand, finish, doorStyle, countertop, handleStyle, sinkStyle, sinkShape };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(config);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      setWidth(prevConfig.width);
      setHeight(prevConfig.height);
      setDepth(prevConfig.depth);
      setBrand(prevConfig.brand);
      setFinish(prevConfig.finish);
      setDoorStyle(prevConfig.doorStyle);
      setCountertop(prevConfig.countertop);
      setHandleStyle(prevConfig.handleStyle);
      setSinkStyle(prevConfig.sinkStyle);
      setSinkShape(prevConfig.sinkShape);
      setHistoryIndex(historyIndex - 1);
      toast.success("Undo successful");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextConfig = history[historyIndex + 1];
      setWidth(nextConfig.width);
      setHeight(nextConfig.height);
      setDepth(nextConfig.depth);
      setBrand(nextConfig.brand);
      setFinish(nextConfig.finish);
      setDoorStyle(nextConfig.doorStyle);
      setCountertop(nextConfig.countertop);
      setHandleStyle(nextConfig.handleStyle);
      setSinkStyle(nextConfig.sinkStyle);
      setSinkShape(nextConfig.sinkShape);
      setHistoryIndex(historyIndex + 1);
      toast.success("Redo successful");
    }
  };

  const handleSaveConfig = () => {
    saveToHistory();
    const config = { width, height, depth, brand, finish, doorStyle, countertop, handleStyle, sinkStyle, sinkShape };
    localStorage.setItem('cabinetDesign', JSON.stringify(config));
    toast.success("Configuration saved successfully!");
  };

  const handleExport = () => {
    const config = { width, height, depth, brand, finish, doorStyle, countertop, handleStyle, sinkStyle, sinkShape };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cabinet-design.json';
    link.click();
    toast.success("Design exported!");
  };

  const handleShare = () => {
    const config = { width, height, depth, brand, finish, doorStyle, countertop, handleStyle, sinkStyle, sinkShape };
    const shareUrl = `${window.location.origin}/designer?config=${btoa(JSON.stringify(config))}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
    toast.success("Zoomed in");
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
    toast.success("Zoomed out");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      toast.success("Fullscreen enabled");
    } else {
      document.exitFullscreen();
      toast.success("Fullscreen disabled");
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    toast.success(showGrid ? "Grid hidden" : "Grid shown");
  };

  const toggleWireframe = () => {
    setWireframe(!wireframe);
    toast.success(wireframe ? "Wireframe disabled" : "Wireframe enabled");
  };

  const handleNewDesign = () => {
    setWidth(48);
    setHeight(34);
    setDepth(21);
    setBrand("EGGER");
    setFinish("Walnut");
    setDoorStyle("shaker");
    setCountertop("quartz");
    setHandleStyle("bar");
    setSinkStyle("undermount");
    setSinkShape("rectangular");
    toast.success("New design started");
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
              <DropdownMenuItem onClick={handleNewDesign}>New Design</DropdownMenuItem>
              <DropdownMenuItem>Open...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSaveConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem>Save As...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExport}>
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
              <DropdownMenuItem onClick={toggleGrid}>
                <Grid3x3 className="h-4 w-4 mr-2" />
                {showGrid ? "Hide" : "Show"} Grid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleWireframe}>
                <Eye className="h-4 w-4 mr-2" />
                {wireframe ? "Disable" : "Enable"} Wireframe
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <Button variant="ghost" size="sm" className="h-8" onClick={handleShare}>
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
                  {/* Cabinet Type Selection */}
                  <div>
                    <Label className="text-sm mb-2 block">Cabinet Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={cabinetType === "vanity" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCabinetType("vanity");
                          saveToHistory();
                        }}
                      >
                        Vanity
                      </Button>
                      <Button
                        variant={cabinetType === "closet" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCabinetType("closet");
                          saveToHistory();
                        }}
                      >
                        Closet
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <Label className="text-sm">Width (inches)</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => {
                        setWidth(Number(e.target.value));
                        saveToHistory();
                      }}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Height (inches)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => {
                        setHeight(Number(e.target.value));
                        saveToHistory();
                      }}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Depth (inches)</Label>
                    <Input
                      type="number"
                      value={depth}
                      onChange={(e) => {
                        setDepth(Number(e.target.value));
                        saveToHistory();
                      }}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Type-specific options */}
                  {cabinetType === "vanity" ? (
                    <>
                      <div>
                        <Label className="text-sm mb-2 block">Sink Configuration</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">Single Sink</Button>
                          <Button variant="outline" size="sm">Double Sink</Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Vanity Style</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <Button variant="outline" size="sm">Floating</Button>
                          <Button variant="outline" size="sm">Floor Standing</Button>
                          <Button variant="outline" size="sm">Wall Mounted</Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Drawer Count</Label>
                        <Input
                          type="number"
                          min="0"
                          max="6"
                          value={drawerCount}
                          onChange={(e) => {
                            setDrawerCount(Number(e.target.value));
                            saveToHistory();
                          }}
                          className="mt-1.5"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-sm mb-2 block">Closet Type</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <Button variant="outline" size="sm">Walk-in</Button>
                          <Button variant="outline" size="sm">Reach-in</Button>
                          <Button variant="outline" size="sm">Wardrobe</Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Shelf Count</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={shelfCount}
                          onChange={(e) => {
                            setShelfCount(Number(e.target.value));
                            saveToHistory();
                          }}
                          className="mt-1.5"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Drawer Units</Label>
                        <Input
                          type="number"
                          min="0"
                          max="8"
                          value={drawerCount}
                          onChange={(e) => {
                            setDrawerCount(Number(e.target.value));
                            saveToHistory();
                          }}
                          className="mt-1.5"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Hanging Rods</Label>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          value={hangingRodCount}
                          onChange={(e) => {
                            setHangingRodCount(Number(e.target.value));
                            saveToHistory();
                          }}
                          className="mt-1.5"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Shoe Rack</Label>
                          <Button
                            variant={hasShoeRack ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setHasShoeRack(!hasShoeRack);
                              saveToHistory();
                            }}
                          >
                            {hasShoeRack ? "Yes" : "No"}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Mirror Doors</Label>
                          <Button
                            variant={hasMirror ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setHasMirror(!hasMirror);
                              saveToHistory();
                            }}
                          >
                            {hasMirror ? "Yes" : "No"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
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
                                onClick={() => {
                                  setBrand(b as "EGGER" | "TAFISA");
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setFinish(f);
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setDoorStyle(style);
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setCountertop(c);
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setHandleStyle(h);
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setSinkStyle(s);
                                  saveToHistory();
                                }}
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
                                onClick={() => {
                                  setSinkShape(s);
                                  saveToHistory();
                                }}
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
                  backgroundImage: showGrid ? `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  ` : 'none',
                  backgroundSize: '40px 40px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease'
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
                  
                    <div className="mt-8 bg-card border border-border rounded-lg p-6">
                      <h3 className="font-semibold text-sm mb-4">
                        {cabinetType === "vanity" ? "Vanity" : "Closet"} Specifications
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Type</div>
                          <div className="text-sm font-medium capitalize">{cabinetType}</div>
                        </div>
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
                        {cabinetType === "vanity" ? (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Countertop</div>
                            <div className="text-sm font-medium capitalize">{countertop}</div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Shelves</div>
                              <div className="text-sm font-medium">{shelfCount}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Hanging Rods</div>
                              <div className="text-sm font-medium">{hangingRodCount}</div>
                            </div>
                          </>
                        )}
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
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }} className="w-full h-full flex items-center justify-center">
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
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{cabinetType}</span>
                    </div>
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
                    {cabinetType === "vanity" ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Countertop</span>
                        <span className="font-medium capitalize">{countertop}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shelves</span>
                          <span className="font-medium">{shelfCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Hanging Rods</span>
                          <span className="font-medium">{hangingRodCount}</span>
                        </div>
                      </>
                    )}
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
