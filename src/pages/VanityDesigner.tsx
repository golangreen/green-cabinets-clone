import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, Save, FolderOpen, Download, Share2, Undo, Redo, 
  ZoomIn, ZoomOut, Maximize2, Settings, Grid3x3, Eye, Layers,
  Box, Ruler, Palette, Package, CircleDot, HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TabType = "cabinets" | "materials" | "hardware" | "countertops";

const VanityDesigner = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("cabinets");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Configuration state
  const [width, setWidth] = useState(48);
  const [depth, setDepth] = useState(21);
  const [height, setHeight] = useState(34);
  const [brand, setBrand] = useState("EGGER");
  const [finish, setFinish] = useState("White Oak");
  const [doorStyle, setDoorStyle] = useState("Shaker");
  const [countertop, setCountertop] = useState("Quartz White");
  const [sinkStyle, setSinkStyle] = useState("Undermount");
  const [sinkShape, setSinkShape] = useState("Rectangular");
  const [numDrawers, setNumDrawers] = useState(3);
  const [handleStyle, setHandleStyle] = useState("Modern Bar");

  const handleSaveConfig = () => {
    toast.success("Configuration saved!");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#2a2a2a] overflow-hidden">
      {/* Top Menu Bar - Professional Software Style */}
      <div className="h-8 bg-[#1e1e1e] border-b border-[#3e3e3e] flex items-center px-2 text-xs text-gray-300">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-3 text-xs hover:bg-[#3e3e3e]">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#3e3e3e]">
            <DropdownMenuItem onClick={() => navigate("/")} className="hover:bg-[#3e3e3e]">
              <Home className="mr-2 h-4 w-4" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveConfig} className="hover:bg-[#3e3e3e]">
              <Save className="mr-2 h-4 w-4" />
              Save
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <FolderOpen className="mr-2 h-4 w-4" />
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3e3e3e]" />
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-3 text-xs hover:bg-[#3e3e3e]">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#3e3e3e]">
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <Undo className="mr-2 h-4 w-4" />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <Redo className="mr-2 h-4 w-4" />
              Redo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-3 text-xs hover:bg-[#3e3e3e]">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#3e3e3e]">
            <DropdownMenuItem onClick={() => setLeftPanelOpen(!leftPanelOpen)} className="hover:bg-[#3e3e3e]">
              <Layers className="mr-2 h-4 w-4" />
              Toggle Catalog
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRightPanelOpen(!rightPanelOpen)} className="hover:bg-[#3e3e3e]">
              <Settings className="mr-2 h-4 w-4" />
              Toggle Properties
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3e3e3e]" />
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <Grid3x3 className="mr-2 h-4 w-4" />
              Show Grid
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-3 text-xs hover:bg-[#3e3e3e]">
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#3e3e3e]">
            <DropdownMenuItem className="hover:bg-[#3e3e3e]">
              <HelpCircle className="mr-2 h-4 w-4" />
              Documentation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-400">Cabinet Designer Pro</span>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="h-12 bg-[#252525] border-b border-[#3e3e3e] flex items-center px-2 gap-1">
        <div className="flex items-center gap-1 pr-2 border-r border-[#3e3e3e]">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Undo">
            <Undo className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Redo">
            <Redo className="h-4 w-4 text-gray-300" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[#3e3e3e]">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" onClick={handleSaveConfig} title="Save">
            <Save className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Export">
            <Download className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Share">
            <Share2 className="h-4 w-4 text-gray-300" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-[#3e3e3e]">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Zoom In">
            <ZoomIn className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Zoom Out">
            <ZoomOut className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Fit to View">
            <Maximize2 className="h-4 w-4 text-gray-300" />
          </Button>
        </div>

        <div className="flex items-center gap-1 px-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="Toggle Grid">
            <Grid3x3 className="h-4 w-4 text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#3e3e3e]" title="View Options">
            <Eye className="h-4 w-4 text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Catalog Panel */}
        {leftPanelOpen && (
          <aside className="w-72 bg-[#252525] border-r border-[#3e3e3e] flex flex-col overflow-hidden">
            {/* Catalog Tabs */}
            <div className="h-12 border-b border-[#3e3e3e] flex items-center bg-[#2a2a2a]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("cabinets")}
                className={`flex-1 h-full rounded-none border-r border-[#3e3e3e] ${
                  activeTab === "cabinets" ? "bg-[#3e3e3e] text-white" : "text-gray-400 hover:bg-[#3e3e3e] hover:text-white"
                }`}
              >
                <Box className="h-4 w-4 mr-2" />
                Cabinets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("materials")}
                className={`flex-1 h-full rounded-none border-r border-[#3e3e3e] ${
                  activeTab === "materials" ? "bg-[#3e3e3e] text-white" : "text-gray-400 hover:bg-[#3e3e3e] hover:text-white"
                }`}
              >
                <Palette className="h-4 w-4 mr-2" />
                Materials
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("hardware")}
                className={`flex-1 h-full rounded-none border-r border-[#3e3e3e] ${
                  activeTab === "hardware" ? "bg-[#3e3e3e] text-white" : "text-gray-400 hover:bg-[#3e3e3e] hover:text-white"
                }`}
              >
                <CircleDot className="h-4 w-4 mr-2" />
                Hardware
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("countertops")}
                className={`flex-1 h-full rounded-none ${
                  activeTab === "countertops" ? "bg-[#3e3e3e] text-white" : "text-gray-400 hover:bg-[#3e3e3e] hover:text-white"
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                Counters
              </Button>
            </div>

            {/* Catalog Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "cabinets" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Dimensions</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Width (inches)</label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-[#3e3e3e] text-white text-sm focus:border-blue-500 focus:outline-none"
                          min="24"
                          max="96"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Depth (inches)</label>
                        <input
                          type="number"
                          value={depth}
                          onChange={(e) => setDepth(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-[#3e3e3e] text-white text-sm focus:border-blue-500 focus:outline-none"
                          min="18"
                          max="24"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Height (inches)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-[#3e3e3e] text-white text-sm focus:border-blue-500 focus:outline-none"
                          min="30"
                          max="36"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Door Style</h3>
                    <div className="space-y-2">
                      {["Shaker", "Flat Panel", "Raised Panel"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setDoorStyle(style)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            doorStyle === style
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "materials" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Brand</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["EGGER", "TAFISA"].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBrand(b)}
                          className={`px-3 py-2 rounded text-sm ${
                            brand === b
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Finish</h3>
                    <div className="space-y-2">
                      {["White Oak", "Walnut", "Casella Oak", "White"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFinish(f)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            finish === f
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "hardware" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Handle Style</h3>
                    <div className="space-y-2">
                      {["Modern Bar", "Classic Knob", "Minimalist", "Traditional"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setHandleStyle(style)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            handleStyle === style
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Sink Style</h3>
                    <div className="space-y-2">
                      {["Undermount", "Vessel", "Drop-in"].map((style) => (
                        <button
                          key={style}
                          onClick={() => setSinkStyle(style)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            sinkStyle === style
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Sink Shape</h3>
                    <div className="space-y-2">
                      {["Rectangular", "Round", "Oval"].map((shape) => (
                        <button
                          key={shape}
                          onClick={() => setSinkShape(shape)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            sinkShape === shape
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "countertops" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Material</h3>
                    <div className="space-y-2">
                      {["Quartz White", "Granite Black", "Marble Carrara", "Solid Surface"].map((ct) => (
                        <button
                          key={ct}
                          onClick={() => setCountertop(ct)}
                          className={`w-full px-3 py-2 rounded text-sm text-left ${
                            countertop === ct
                              ? "bg-blue-600 text-white"
                              : "bg-[#1e1e1e] text-gray-300 hover:bg-[#3e3e3e]"
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Center - 3D Viewport */}
        <main className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(#3e3e3e 1px, transparent 1px), linear-gradient(90deg, #3e3e3e 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
          
          <div className="w-full h-full relative z-10">
            <Vanity3DPreview
              width={width}
              depth={depth}
              height={height}
              brand={brand}
              finish={finish}
              doorStyle={doorStyle}
              numDrawers={numDrawers}
              handleStyle={handleStyle}
            />
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#1e1e1e] border-t border-[#3e3e3e] flex items-center px-4 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span><Ruler className="inline h-3 w-3 mr-1" />{width}" × {depth}" × {height}"</span>
              <span>•</span>
              <span>{brand} {finish}</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        {rightPanelOpen && (
          <aside className="w-64 bg-[#252525] border-l border-[#3e3e3e] p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4">Properties</h3>
            <div className="space-y-4 text-sm">
              <div className="bg-[#1e1e1e] rounded p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Width:</span>
                  <span className="text-white font-medium">{width}"</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Depth:</span>
                  <span className="text-white font-medium">{depth}"</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Height:</span>
                  <span className="text-white font-medium">{height}"</span>
                </div>
              </div>

              <div className="bg-[#1e1e1e] rounded p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Brand:</span>
                  <span className="text-white font-medium">{brand}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Finish:</span>
                  <span className="text-white font-medium">{finish}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Door Style:</span>
                  <span className="text-white font-medium">{doorStyle}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Countertop:</span>
                  <span className="text-white font-medium">{countertop}</span>
                </div>
              </div>

              <div className="bg-blue-600 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs font-semibold">Estimated Price:</span>
                  <span className="text-white text-lg font-bold">${(width * 50).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default VanityDesigner;
