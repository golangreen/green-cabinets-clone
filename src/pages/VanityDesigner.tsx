import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus,
  Trash2,
  Copy,
  Save,
  Download,
  Grid3x3,
  FileText,
  Box,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";

interface Cabinet {
  id: number;
  type: string;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  brand: string;
  finish: string;
  label?: string;
}

const VanityDesigner = () => {
  const navigate = useNavigate();
  
  // View mode: 'floorplan' or 'render'
  const [viewMode, setViewMode] = useState<"floorplan" | "render">("floorplan");
  const [activeTab, setActiveTab] = useState("home");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  
  // Cabinets state
  const [cabinets, setCabinets] = useState<Cabinet[]>([
    {
      id: 1,
      type: "Base Cabinet",
      width: 36,
      height: 34.5,
      depth: 24,
      x: 100,
      y: 200,
      brand: "Tafisa",
      finish: "White",
      label: "DB36"
    }
  ]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(1);
  
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridSize = 24; // 12" grid at 2px per inch scale
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Add a new cabinet
  const addCabinet = useCallback(() => {
    const newCabinet: Cabinet = {
      id: Math.max(...cabinets.map(c => c.id), 0) + 1,
      type: "Base Cabinet",
      width: 36,
      height: 34.5,
      depth: 24,
      x: 150 + (cabinets.length * 50),
      y: 150,
      brand: "Tafisa",
      finish: "White",
      label: `DB${36}`
    };
    setCabinets([...cabinets, newCabinet]);
    setSelectedCabinetId(newCabinet.id);
    toast.success("Cabinet added");
  }, [cabinets]);

  // Remove selected cabinet
  const removeCabinet = useCallback(() => {
    if (!selectedCabinetId) return;
    const newCabinets = cabinets.filter(c => c.id !== selectedCabinetId);
    setCabinets(newCabinets);
    setSelectedCabinetId(newCabinets[0]?.id || null);
    toast.success("Cabinet removed");
  }, [cabinets, selectedCabinetId]);

  // Duplicate selected cabinet
  const duplicateCabinet = useCallback(() => {
    if (!selectedCabinetId) return;
    const cabinet = cabinets.find(c => c.id === selectedCabinetId);
    if (!cabinet) return;
    const newCabinet = {
      ...cabinet,
      id: Math.max(...cabinets.map(c => c.id), 0) + 1,
      x: cabinet.x + 48,
      y: cabinet.y + 48
    };
    setCabinets([...cabinets, newCabinet]);
    setSelectedCabinetId(newCabinet.id);
    toast.success("Cabinet duplicated");
  }, [cabinets, selectedCabinetId]);

  // Save configuration
  const handleSave = useCallback(() => {
    toast.success("Design saved");
  }, []);

  // Export configuration
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(cabinets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'vanity-design.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Design exported");
  }, [cabinets]);

  // Share configuration
  const handleShare = useCallback(() => {
    toast.success("Share link copied");
  }, []);

  // Snap to grid helper
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, cabinetId: number) => {
    const cabinet = cabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;
    
    setDraggingId(cabinetId);
    setSelectedCabinetId(cabinetId);
    setDragOffset({
      x: e.clientX - cabinet.x,
      y: e.clientY - cabinet.y
    });
  }, [cabinets]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingId === null) return;
    
    const newX = snapToGrid(e.clientX - dragOffset.x);
    const newY = snapToGrid(e.clientY - dragOffset.y);
    
    setCabinets(cabinets.map(c => 
      c.id === draggingId ? { ...c, x: newX, y: newY } : c
    ));
  }, [draggingId, dragOffset, snapToGrid, cabinets]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  // Render ribbon content based on active tab
  const renderRibbonContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="flex items-center gap-6 px-4 py-2 bg-muted/30">
            <div className="flex flex-col items-center gap-1">
              <Button onClick={addCabinet} variant="ghost" size="sm" className="h-12 w-12 flex flex-col gap-1 hover:bg-accent">
                <Plus className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Add Cabinet</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Button onClick={duplicateCabinet} variant="ghost" size="sm" className="h-12 w-12 flex flex-col gap-1 hover:bg-accent" disabled={!selectedCabinetId}>
                <Copy className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Duplicate</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button onClick={removeCabinet} variant="ghost" size="sm" className="h-12 w-12 flex flex-col gap-1 hover:bg-accent" disabled={!selectedCabinetId}>
                <Trash2 className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Delete</span>
            </div>
          </div>
        );
      case "view":
        return (
          <div className="flex items-center gap-6 px-4 py-2 bg-muted/30">
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setShowGrid(!showGrid)} 
                variant={showGrid ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Grid</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setShowDimensions(!showDimensions)} 
                variant={showDimensions ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <FileText className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Dimensions</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setViewMode(viewMode === "floorplan" ? "render" : "floorplan")} 
                variant="ghost"
                size="sm" 
                className="h-12 w-16 flex flex-col gap-1 hover:bg-accent"
              >
                <Box className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">3D View</span>
            </div>
          </div>
        );
      default:
        return <div className="px-4 py-2 text-sm text-muted-foreground bg-muted/30">Select a tool from above</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Ribbon Tabs */}
      <div className="border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center h-12 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="h-8 px-3 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
          >
            FILE
          </Button>
          
          <Button
            variant={activeTab === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("home")}
            className="h-8 px-3"
          >
            HOME
          </Button>
          
          <Button
            variant={activeTab === "view" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("view")}
            className="h-8 px-3"
          >
            VIEW
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        {/* Ribbon Content */}
        <div className="border-t border-border">
          {renderRibbonContent()}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Collapsible */}
        {showLeftPanel && (
          <div className="w-64 border-r border-border bg-card flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm">Place Items</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftPanel(false)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cabinets.map(cabinet => (
                <Card
                  key={cabinet.id}
                  className={`p-2 cursor-pointer transition-colors ${
                    selectedCabinetId === cabinet.id 
                      ? "border-[#FF8C00] bg-[#FF8C00]/10" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCabinetId(cabinet.id)}
                >
                  <p className="text-xs font-medium">{cabinet.label || cabinet.type}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {cabinet.width}" × {cabinet.depth}"
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!showLeftPanel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeftPanel(true)}
            className="absolute left-0 top-32 h-12 w-6 rounded-none rounded-r-md z-10 bg-card border border-l-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === "floorplan" ? (
            <div 
              ref={canvasRef}
              className="flex-1 bg-white relative overflow-auto"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #E5E7EB 1px, transparent 1px),
                      linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize}px ${gridSize}px`
                  }}
                />
              )}

              {/* Cabinets */}
              {cabinets.map(cabinet => {
                const widthPx = cabinet.width * 2;
                const depthPx = cabinet.depth * 2;
                
                return (
                  <div
                    key={cabinet.id}
                    className={`absolute cursor-move transition-all ${
                      selectedCabinetId === cabinet.id 
                        ? "shadow-lg z-10" 
                        : "hover:shadow-md"
                    }`}
                    style={{
                      left: cabinet.x,
                      top: cabinet.y,
                      width: widthPx,
                      height: depthPx,
                      backgroundColor: selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6',
                      border: selectedCabinetId === cabinet.id ? '2px solid #FF8C00' : '1px solid #9CA3AF'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, cabinet.id)}
                  >
                    {/* Cabinet label */}
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium pointer-events-none select-none">
                      {cabinet.label || cabinet.type}
                    </div>
                    
                    {/* Auto-dimensions */}
                    {showDimensions && selectedCabinetId === cabinet.id && (
                      <>
                        {/* Width dimension line and text */}
                        <div 
                          className="absolute pointer-events-none"
                          style={{ 
                            top: -25, 
                            left: 0,
                            right: 0,
                            height: 20
                          }}
                        >
                          {/* Dimension line */}
                          <svg className="absolute inset-0" style={{ width: '100%', height: 20 }}>
                            <line x1="0" y1="15" x2="100%" y2="15" stroke="#0066CC" strokeWidth="1" />
                            <line x1="0" y1="10" x2="0" y2="20" stroke="#0066CC" strokeWidth="1" />
                            <line x1="100%" y1="10" x2="100%" y2="20" stroke="#0066CC" strokeWidth="1" />
                          </svg>
                          {/* Dimension text */}
                          <div 
                            className="absolute text-[11px] font-medium bg-white px-1"
                            style={{ 
                              top: 8, 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              color: '#0066CC'
                            }}
                          >
                            {cabinet.width}"
                          </div>
                        </div>
                        
                        {/* Depth dimension line and text */}
                        <div 
                          className="absolute pointer-events-none"
                          style={{ 
                            right: -30, 
                            top: 0,
                            bottom: 0,
                            width: 25
                          }}
                        >
                          {/* Dimension line */}
                          <svg className="absolute inset-0" style={{ width: 25, height: '100%' }}>
                            <line x1="10" y1="0" x2="10" y2="100%" stroke="#0066CC" strokeWidth="1" />
                            <line x1="5" y1="0" x2="15" y2="0" stroke="#0066CC" strokeWidth="1" />
                            <line x1="5" y1="100%" x2="15" y2="100%" stroke="#0066CC" strokeWidth="1" />
                          </svg>
                          {/* Dimension text */}
                          <div 
                            className="absolute text-[11px] font-medium bg-white px-1"
                            style={{ 
                              left: 12, 
                              top: '50%', 
                              transform: 'translateY(-50%)',
                              color: '#0066CC',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {cabinet.depth}"
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Info overlay */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded border border-border shadow-lg text-[10px] text-muted-foreground pointer-events-none">
                <div>Grid: 12" × 12"</div>
                <div>Scale: 2px = 1"</div>
                <div>Cabinets: {cabinets.length}</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-muted flex flex-col">
              <div className="flex-1 relative">
                <Vanity3DPreview
                  width={selectedCabinetId ? cabinets.find(c => c.id === selectedCabinetId)?.width || 36 : 36}
                  height={selectedCabinetId ? cabinets.find(c => c.id === selectedCabinetId)?.height || 34.5 : 34.5}
                  depth={selectedCabinetId ? cabinets.find(c => c.id === selectedCabinetId)?.depth || 24 : 24}
                  doorStyle="shaker"
                  handleStyle="modern"
                  finish="white"
                  brand="Tafisa"
                  numDrawers={3}
                />
              </div>
              <div className="p-4 bg-card border-t border-border flex items-center justify-end">
                <Button className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white">
                  Save View
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VanityDesigner;