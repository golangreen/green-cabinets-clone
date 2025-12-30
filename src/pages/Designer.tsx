import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Minus, 
  Square, 
  DoorOpen, 
  SquareDashedBottom,
  Trash2,
  RotateCcw,
  RotateCw,
  Save,
  Download,
  ChevronLeft
} from "lucide-react";
import { RoomDesignerEngine } from "@/lib/roomDesigner";
import logoImage from "@/assets/logos/logo-color.svg";
import { toast } from "sonner";

export default function Designer() {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [activeTab, setActiveTab] = useState("room");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RoomDesignerEngine | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize the room designer engine
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new RoomDesignerEngine(canvasRef.current);
      engineRef.current.render();
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && engineRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        engineRef.current.render();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (selectedTool === "draw") {
      if (!isDrawing) {
        engineRef.current.startWall(point);
        setIsDrawing(true);
        toast.info("Click to place the end of the wall");
      } else {
        engineRef.current.completeWall(point);
        setIsDrawing(false);
        toast.success("Wall created!");
      }
    } else if (selectedTool === "door" || selectedTool === "window") {
      const wall = engineRef.current.findWallAtPoint(point);
      if (wall) {
        engineRef.current.addOpening(wall.id, 0.5, selectedTool as 'door' | 'window');
        toast.success(`${selectedTool === 'door' ? 'Door' : 'Window'} added!`);
      } else {
        toast.error("Click on a wall to add an opening");
      }
    } else if (selectedTool === "deleteWall") {
      const wall = engineRef.current.findWallAtPoint(point);
      if (wall) {
        engineRef.current.deleteWall(wall.id);
        toast.success("Wall deleted!");
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleUndo = () => {
    if (engineRef.current?.undo()) {
      toast.info("Undone");
    } else {
      toast.error("Nothing to undo");
    }
  };

  const handleRedo = () => {
    if (engineRef.current?.redo()) {
      toast.info("Redone");
    } else {
      toast.error("Nothing to redo");
    }
  };

  const handleClearRoom = () => {
    if (engineRef.current) {
      engineRef.current.clearRoom();
      setIsDrawing(false);
      toast.success("Room cleared!");
    }
  };

  const handlePresetRoom = (type: 'straight' | 'l-shaped' | 'u-shaped' | 'closed') => {
    if (engineRef.current) {
      engineRef.current.createPresetRoom(type);
      toast.success(`${type.replace('-', ' ').toUpperCase()} layout created!`);
    }
  };

  const handleSave = () => {
    if (engineRef.current) {
      const room = engineRef.current.getRoom();
      const json = JSON.stringify(room, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `room-design-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Design saved!");
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `room-design-${Date.now()}.png`;
      a.click();
      toast.success("Design exported!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-gray-800">
        <div className="flex items-center gap-6 flex-1">
          <Link to="/" className="flex-shrink-0">
            <img src={logoImage} alt="Green Cabinets" className="h-10 cursor-pointer transition-all duration-300 hover:scale-110 hover:opacity-80" />
          </Link>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-none h-auto p-0 gap-4">
              <TabsTrigger 
                value="room" 
                className="bg-primary text-primary-foreground data-[state=active]:bg-primary rounded-lg px-6 py-2 font-medium"
              >
                ROOM
              </TabsTrigger>
              <TabsTrigger 
                value="items" 
                className="bg-transparent text-white data-[state=active]:bg-primary rounded-lg px-6 py-2 font-medium"
              >
                ITEMS
              </TabsTrigger>
              <TabsTrigger 
                value="design" 
                className="bg-transparent text-white data-[state=active]:bg-primary rounded-lg px-6 py-2 font-medium"
              >
                DESIGN
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="bg-transparent text-white data-[state=active]:bg-primary rounded-lg px-6 py-2 font-medium"
              >
                TEMPLATES
              </TabsTrigger>
              <TabsTrigger 
                value="view" 
                className="bg-transparent text-white data-[state=active]:bg-primary rounded-lg px-6 py-2 font-medium"
              >
                VIEW
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-gray-800 gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="ghost" className="text-white hover:bg-gray-800 gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tool Panel */}
        <div className="w-72 bg-[#0d0d0d] border-r border-gray-800 flex flex-col">
          {/* Tool Buttons Row */}
          <div className="p-4 border-b border-gray-800">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Button
                variant={selectedTool === "select" ? "default" : "ghost"}
                className="flex-col h-20 bg-primary hover:bg-primary/90 text-white"
                onClick={() => setSelectedTool("select")}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-xs">Select</span>
              </Button>
              <Button
                variant={selectedTool === "draw" ? "default" : "ghost"}
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={() => setSelectedTool("draw")}
              >
                <Minus className="h-5 w-5 mb-1" />
                <span className="text-xs">Draw Wall</span>
              </Button>
              <Button
                variant={selectedTool === "door" ? "default" : "ghost"}
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={() => setSelectedTool("door")}
              >
                <DoorOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Door</span>
              </Button>
              <Button
                variant={selectedTool === "window" ? "default" : "ghost"}
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={() => setSelectedTool("window")}
              >
                <SquareDashedBottom className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Window</span>
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant={selectedTool === "deleteWall" ? "default" : "ghost"}
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={() => setSelectedTool("deleteWall")}
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Delete Wall</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={() => setSelectedTool("deleteOpening")}
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Delete Opening</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={handleClearRoom}
              >
                <Square className="h-5 w-5 mb-1" />
                <span className="text-xs">Clear Room</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={handleUndo}
              >
                <RotateCcw className="h-5 w-5 mb-1" />
                <span className="text-xs">Undo</span>
              </Button>
            </div>

            <div className="mt-2">
              <Button
                variant="ghost"
                className="w-full h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
                onClick={handleRedo}
              >
                <RotateCw className="h-5 w-5 mr-2" />
                <span className="text-xs">Redo</span>
              </Button>
            </div>
          </div>

          {/* Room Tools Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Room Tools</h3>
              <ChevronLeft className="h-4 w-4" />
            </div>

            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="w-full bg-transparent border-b border-gray-800 rounded-none h-auto p-0 mb-4">
                <TabsTrigger 
                  value="presets" 
                  className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
                >
                  Presets
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
                >
                  Properties
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="mt-0">
                <div>
                  <h4 className="text-xs font-semibold mb-3">Quick Layouts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card 
                      className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2"
                      onClick={() => handlePresetRoom('straight')}
                    >
                      <Square className="h-8 w-8" />
                      <span className="text-xs">Straight</span>
                    </Card>
                    <Card 
                      className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2"
                      onClick={() => handlePresetRoom('l-shaped')}
                    >
                      <div className="rotate-90">
                        <Square className="h-8 w-8" />
                      </div>
                      <span className="text-xs">L-Shaped</span>
                    </Card>
                    <Card 
                      className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2"
                      onClick={() => handlePresetRoom('u-shaped')}
                    >
                      <Square className="h-8 w-8" />
                      <span className="text-xs">U-Shaped</span>
                    </Card>
                    <Card 
                      className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2"
                      onClick={() => handlePresetRoom('closed')}
                    >
                      <Square className="h-8 w-8" />
                      <span className="text-xs">Closed</span>
                    </Card>
                  </div>
                </div>

                <div className="mt-6 text-xs text-gray-400 space-y-2">
                  <p className="font-semibold">Tips:</p>
                  <ul className="space-y-1 pl-4">
                    <li>• Click twice to draw a wall</li>
                    <li>• Click on walls to add openings</li>
                    <li>• Select openings to adjust size</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="properties">
                <div className="text-sm text-gray-400">
                  <p>Select a room element to view properties</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-card relative overflow-hidden">
          {/* Grid Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e5e5 1px, transparent 1px),
                linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Tool Instructions */}
          <div className="absolute top-4 left-4 bg-card/90 p-3 rounded-lg shadow-lg border border-border text-sm">
            {selectedTool === "select" && <p><strong>Select Tool:</strong> Click on elements to select and move them</p>}
            {selectedTool === "draw" && <p><strong>Draw Wall:</strong> {isDrawing ? 'Click to place end point' : 'Click to start drawing a wall'}</p>}
            {selectedTool === "door" && <p><strong>Add Door:</strong> Click on a wall to add a door</p>}
            {selectedTool === "window" && <p><strong>Add Window:</strong> Click on a wall to add a window</p>}
            {selectedTool === "deleteWall" && <p><strong>Delete Wall:</strong> Click on a wall to delete it</p>}
          </div>

          {/* Grid Info */}
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/90 p-2 rounded border border-border">
            <div>Grid: 12" × 12"</div>
            <div>Scale: 2px = 1"</div>
            <div>Mouse: ({Math.round(mousePos.x)}, {Math.round(mousePos.y)})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
