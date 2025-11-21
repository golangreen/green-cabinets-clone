import { useState } from "react";
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
import logoImage from "@/assets/logos/logo-color.svg";

export default function Designer() {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [activeTab, setActiveTab] = useState("room");

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-gray-800">
        <div className="flex items-center gap-6">
          <img src={logoImage} alt="Green Cabinets" className="h-10" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
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
          <Button variant="ghost" className="text-white hover:bg-gray-800 gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="ghost" className="text-white hover:bg-gray-800 gap-2">
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
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Delete Wall</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Delete Opening</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
              >
                <Square className="h-5 w-5 mb-1" />
                <span className="text-xs">Clear Room</span>
              </Button>
              <Button
                variant="ghost"
                className="flex-col h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
              >
                <RotateCcw className="h-5 w-5 mb-1" />
                <span className="text-xs">Undo</span>
              </Button>
            </div>

            <div className="mt-2">
              <Button
                variant="ghost"
                className="w-full h-20 bg-[#1a1a1a] hover:bg-gray-800 text-white"
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
                    <Card className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2">
                      <Square className="h-8 w-8" />
                      <span className="text-xs">Straight</span>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2">
                      <div className="rotate-90">
                        <Square className="h-8 w-8" />
                      </div>
                      <span className="text-xs">L-Shaped</span>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2">
                      <Square className="h-8 w-8" />
                      <span className="text-xs">U-Shaped</span>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-gray-800 hover:border-primary cursor-pointer transition-colors p-4 flex flex-col items-center justify-center gap-2">
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
        <div className="flex-1 bg-white relative overflow-auto">
          {/* Grid Canvas */}
          <div className="w-full h-full relative" style={{
            backgroundImage: `
              linear-gradient(to right, #e5e5e5 1px, transparent 1px),
              linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}>
            {/* Sample Room - Placeholder for actual drawing functionality */}
            <div className="absolute" style={{ top: '200px', left: '300px' }}>
              <div className="relative">
                {/* Room Rectangle */}
                <div 
                  className="border-4 border-[#f5a623] bg-[#f5a623]/10"
                  style={{ width: '144px', height: '96px' }}
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#f5a623] font-semibold text-sm">
                    ROOM
                  </span>
                </div>
                
                {/* Dimension Labels */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center">
                  <span className="text-blue-600 font-semibold text-sm">36"</span>
                </div>
                <div className="absolute top-0 bottom-0 -right-10 flex items-center">
                  <span className="text-blue-600 font-semibold text-sm">24"</span>
                </div>
              </div>
            </div>

            {/* Grid Info */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/90 p-2 rounded border border-gray-300">
              <div>Grid: 12" × 12"</div>
              <div>Scale: 2px = 1"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
