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
  Plus,
  Trash2,
  Copy,
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
  
  // Multi-cabinet system
  const [cabinets, setCabinets] = useState<any[]>([{
    id: 1,
    cabinetType: "kitchen",
    subType: "base",
    width: 36,
    height: 34,
    depth: 24,
    brand: "EGGER",
    finish: "Walnut",
    doorStyle: "shaker",
    countertop: "quartz",
    handleStyle: "bar",
    sinkStyle: "undermount",
    sinkShape: "rectangular",
    drawerCount: 2,
    shelfCount: 3,
    hangingRodCount: 1,
    hasShoeRack: false,
    hasMirror: false,
  }]);
  const [selectedCabinetId, setSelectedCabinetId] = useState(1);
  
  // Get current cabinet
  const currentCabinet = cabinets.find(c => c.id === selectedCabinetId) || cabinets[0];
  
  // Configuration state (for current cabinet)
  const [cabinetType, setCabinetType] = useState<"vanity" | "closet" | "kitchen">(currentCabinet.cabinetType);
  const [subType, setSubType] = useState(currentCabinet.subType);
  const [width, setWidth] = useState(currentCabinet.width);
  const [height, setHeight] = useState(currentCabinet.height);
  const [depth, setDepth] = useState(currentCabinet.depth);
  const [brand, setBrand] = useState<"EGGER" | "TAFISA">(currentCabinet.brand);
  const [finish, setFinish] = useState(currentCabinet.finish);
  const [doorStyle, setDoorStyle] = useState(currentCabinet.doorStyle);
  const [countertop, setCountertop] = useState(currentCabinet.countertop);
  const [handleStyle, setHandleStyle] = useState(currentCabinet.handleStyle);
  const [sinkStyle, setSinkStyle] = useState<"undermount" | "vessel" | "integrated">(currentCabinet.sinkStyle);
  const [sinkShape, setSinkShape] = useState<"rectangular" | "oval" | "square">(currentCabinet.sinkShape);
  
  // Type-specific options
  const [shelfCount, setShelfCount] = useState(currentCabinet.shelfCount);
  const [drawerCount, setDrawerCount] = useState(currentCabinet.drawerCount);
  const [hangingRodCount, setHangingRodCount] = useState(currentCabinet.hangingRodCount);
  const [hasShoeRack, setHasShoeRack] = useState(currentCabinet.hasShoeRack);
  const [hasMirror, setHasMirror] = useState(currentCabinet.hasMirror);

  // View controls
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  // History management
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Update current cabinet in array
  const updateCurrentCabinet = (updates: any) => {
    setCabinets(cabinets.map(c => 
      c.id === selectedCabinetId ? { ...c, ...updates } : c
    ));
  };

  // Add new cabinet
  const addCabinet = () => {
    const newId = Math.max(...cabinets.map(c => c.id)) + 1;
    const newCabinet = {
      id: newId,
      cabinetType: cabinetType,
      subType: subType,
      width: 36,
      height: 34,
      depth: 24,
      brand: "EGGER",
      finish: "Walnut",
      doorStyle: "shaker",
      countertop: "quartz",
      handleStyle: "bar",
      sinkStyle: "undermount",
      sinkShape: "rectangular",
      drawerCount: 2,
      shelfCount: 3,
      hangingRodCount: 1,
      hasShoeRack: false,
      hasMirror: false,
    };
    setCabinets([...cabinets, newCabinet]);
    setSelectedCabinetId(newId);
    toast.success("Cabinet added!");
  };

  // Remove cabinet
  const removeCabinet = (id: number) => {
    if (cabinets.length === 1) {
      toast.error("Cannot remove the last cabinet");
      return;
    }
    setCabinets(cabinets.filter(c => c.id !== id));
    if (selectedCabinetId === id) {
      setSelectedCabinetId(cabinets[0].id);
    }
    toast.success("Cabinet removed");
  };

  // Duplicate cabinet
  const duplicateCabinet = (id: number) => {
    const cabinetToDuplicate = cabinets.find(c => c.id === id);
    if (cabinetToDuplicate) {
      const newId = Math.max(...cabinets.map(c => c.id)) + 1;
      setCabinets([...cabinets, { ...cabinetToDuplicate, id: newId }]);
      setSelectedCabinetId(newId);
      toast.success("Cabinet duplicated!");
    }
  };

  const saveToHistory = () => {
    const config = { cabinets };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(config);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      setCabinets(prevConfig.cabinets);
      setHistoryIndex(historyIndex - 1);
      toast.success("Undo successful");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextConfig = history[historyIndex + 1];
      setCabinets(nextConfig.cabinets);
      setHistoryIndex(historyIndex + 1);
      toast.success("Redo successful");
    }
  };

  const handleSaveConfig = () => {
    saveToHistory();
    localStorage.setItem('cabinetDesign', JSON.stringify({ cabinets }));
    toast.success("Configuration saved successfully!");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ cabinets }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cabinet-design.json';
    link.click();
    toast.success("Design exported!");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/designer?config=${btoa(JSON.stringify({ cabinets }))}`;
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
    setCabinets([{
      id: 1,
      cabinetType: "kitchen",
      subType: "base",
      width: 36,
      height: 34,
      depth: 24,
      brand: "EGGER",
      finish: "Walnut",
      doorStyle: "shaker",
      countertop: "quartz",
      handleStyle: "bar",
      sinkStyle: "undermount",
      sinkShape: "rectangular",
      drawerCount: 2,
      shelfCount: 3,
      hangingRodCount: 1,
      hasShoeRack: false,
      hasMirror: false,
    }]);
    setSelectedCabinetId(1);
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
                {activeView === "measurement" ? "Design Controls" : "Materials"}
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
                // Measurement View - Cabinet list and controls
                <div className="flex flex-col h-full">
                  {/* Cabinet List */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold">Cabinets ({cabinets.length})</Label>
                      <Button size="sm" onClick={addCabinet} className="h-7">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cabinets.map((cabinet) => (
                        <div
                          key={cabinet.id}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                            selectedCabinetId === cabinet.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedCabinetId(cabinet.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate capitalize">
                              {cabinet.cabinetType} - {cabinet.subType}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cabinet.width}×{cabinet.height}×{cabinet.depth}"
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateCabinet(cabinet.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCabinet(cabinet.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Cabinet Configuration */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block font-semibold">Edit Cabinet #{selectedCabinetId}</Label>
                    </div>
                    
                    {/* Cabinet Category Selection */}
                    <div>
                      <Label className="text-sm mb-2 block">Cabinet Category</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={cabinetType === "kitchen" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCabinetType("kitchen");
                            setSubType("base");
                            updateCurrentCabinet({ cabinetType: "kitchen", subType: "base" });
                            saveToHistory();
                          }}
                        >
                          Kitchen
                        </Button>
                        <Button
                          variant={cabinetType === "vanity" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCabinetType("vanity");
                            setSubType("base");
                            updateCurrentCabinet({ cabinetType: "vanity", subType: "base" });
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
                            setSubType("wardrobe");
                            updateCurrentCabinet({ cabinetType: "closet", subType: "wardrobe" });
                            saveToHistory();
                          }}
                        >
                          Closet
                        </Button>
                      </div>
                    </div>

                    {/* Sub-type Selection - Kitchen/Vanity/Closet specific types */}
                    <div>
                      <Label className="text-sm mb-2 block">Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {cabinetType === "kitchen" && (
                          <>
                            <Button
                              variant={subType === "base" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("base");
                                setHeight(34);
                                updateCurrentCabinet({ subType: "base", height: 34 });
                              }}
                            >
                              Base
                            </Button>
                            <Button
                              variant={subType === "wall" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("wall");
                                setHeight(30);
                                updateCurrentCabinet({ subType: "wall", height: 30 });
                              }}
                            >
                              Wall
                            </Button>
                            <Button
                              variant={subType === "tall" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("tall");
                                setHeight(84);
                                updateCurrentCabinet({ subType: "tall", height: 84 });
                              }}
                            >
                              Tall
                            </Button>
                            <Button
                              variant={subType === "pantry" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("pantry");
                                setHeight(90);
                                updateCurrentCabinet({ subType: "pantry", height: 90 });
                              }}
                            >
                              Pantry
                            </Button>
                          </>
                        )}
                        {cabinetType === "vanity" && (
                          <>
                            <Button
                              variant={subType === "base" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("base");
                                updateCurrentCabinet({ subType: "base" });
                              }}
                            >
                              Base
                            </Button>
                            <Button
                              variant={subType === "floating" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("floating");
                                updateCurrentCabinet({ subType: "floating" });
                              }}
                            >
                              Floating
                            </Button>
                            <Button
                              variant={subType === "tower" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("tower");
                                setHeight(72);
                                updateCurrentCabinet({ subType: "tower", height: 72 });
                              }}
                            >
                              Tower
                            </Button>
                            <Button
                              variant={subType === "medicine" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("medicine");
                                setHeight(24);
                                updateCurrentCabinet({ subType: "medicine", height: 24 });
                              }}
                            >
                              Medicine
                            </Button>
                          </>
                        )}
                        {cabinetType === "closet" && (
                          <>
                            <Button
                              variant={subType === "wardrobe" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("wardrobe");
                                updateCurrentCabinet({ subType: "wardrobe" });
                              }}
                            >
                              Wardrobe
                            </Button>
                            <Button
                              variant={subType === "reach-in" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("reach-in");
                                updateCurrentCabinet({ subType: "reach-in" });
                              }}
                            >
                              Reach-in
                            </Button>
                            <Button
                              variant={subType === "walk-in" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("walk-in");
                                setWidth(96);
                                updateCurrentCabinet({ subType: "walk-in", width: 96 });
                              }}
                            >
                              Walk-in
                            </Button>
                            <Button
                              variant={subType === "drawer-unit" ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSubType("drawer-unit");
                                setHeight(48);
                                updateCurrentCabinet({ subType: "drawer-unit", height: 48 });
                              }}
                            >
                              Drawer Unit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Dimensions */}
                    <div>
                      <Label className="text-sm">Width (inches)</Label>
                      <Input
                        type="number"
                        value={width}
                        onChange={(e) => {
                          setWidth(Number(e.target.value));
                          updateCurrentCabinet({ width: Number(e.target.value) });
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
                          updateCurrentCabinet({ height: Number(e.target.value) });
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
                          updateCurrentCabinet({ depth: Number(e.target.value) });
                        }}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // 3D View - Material controls
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
                                  updateCurrentCabinet({ brand: b });
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
                                  updateCurrentCabinet({ finish: f });
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
                                  updateCurrentCabinet({ doorStyle: style });
                                  saveToHistory();
                                }}
                              >
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {cabinetType === "vanity" && (
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
                                    updateCurrentCabinet({ countertop: c });
                                    saveToHistory();
                                  }}
                                >
                                  {c.charAt(0).toUpperCase() + c.slice(1)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
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
                                  updateCurrentCabinet({ handleStyle: h });
                                  saveToHistory();
                                }}
                              >
                                {h.charAt(0).toUpperCase() + h.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {cabinetType === "vanity" && (
                          <>
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
                                      updateCurrentCabinet({ sinkStyle: s });
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
                                      updateCurrentCabinet({ sinkShape: s });
                                      saveToHistory();
                                    }}
                                  >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
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
                <div className="max-w-6xl mx-auto">
                  <h3 className="text-lg font-semibold mb-6">Layout - {cabinets.length} Cabinet(s)</h3>
                  
                  {/* All Cabinets Overview */}
                  <div className="space-y-4">
                    {cabinets.map((cabinet, index) => (
                      <div 
                        key={cabinet.id}
                        className={`border-2 bg-card/50 relative p-4 rounded ${
                          selectedCabinetId === cabinet.id ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => setSelectedCabinetId(cabinet.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold capitalize">
                              #{index + 1}: {cabinet.cabinetType} - {cabinet.subType}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cabinet.width}" W × {cabinet.height}" H × {cabinet.depth}" D
                            </div>
                          </div>
                          <div className="text-xs bg-primary/10 px-2 py-1 rounded">
                            {cabinet.brand} {cabinet.finish}
                          </div>
                        </div>
                        
                        <div 
                          className="border border-dashed border-muted-foreground/30 bg-accent/10 p-3 rounded"
                          style={{
                            minHeight: `${Math.min(cabinet.height * 2, 100)}px`
                          }}
                        >
                          <div className="text-xs text-muted-foreground text-center">
                            {cabinet.doorStyle} style • {cabinet.handleStyle} handles
                          </div>
                        </div>
                      </div>
                    ))}
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
                numDrawers={drawerCount}
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
              <h2 className="text-sm font-semibold">Summary</h2>
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
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Project Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cabinets</span>
                      <span className="font-medium">{cabinets.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Categories</span>
                      <span className="font-medium capitalize">
                        {Array.from(new Set(cabinets.map(c => c.cabinetType))).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Selected Cabinet #{selectedCabinetId}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{cabinetType} - {subType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size</span>
                      <span className="font-medium">{width}×{height}×{depth}"</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material</span>
                      <span className="font-medium">{brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Finish</span>
                      <span className="font-medium">{finish}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">Estimated</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground">
                      ${(cabinets.length * 1200).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Base price estimate</div>
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
