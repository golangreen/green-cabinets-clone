import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Move, Square, DoorOpen, RectangleHorizontal, 
  Plus, Settings, Grid3x3, Layout, Save 
} from "lucide-react";

interface MobileDesignerToolbarProps {
  drawingTool: string;
  setDrawingTool: (tool: "select" | "wall" | "door" | "window") => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  onAddCabinet: () => void;
  onSaveTemplate: () => void;
}

export const MobileDesignerToolbar = ({
  drawingTool,
  setDrawingTool,
  showGrid,
  setShowGrid,
  onAddCabinet,
  onSaveTemplate
}: MobileDesignerToolbarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around p-2 max-w-screen-xl mx-auto">
        <Button
          variant={drawingTool === "select" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDrawingTool("select")}
          className="flex-col h-14 px-3"
        >
          <Move className="h-5 w-5 mb-1" />
          <span className="text-xs">Select</span>
        </Button>
        
        <Button
          variant={drawingTool === "wall" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDrawingTool("wall")}
          className="flex-col h-14 px-3"
        >
          <Square className="h-5 w-5 mb-1" />
          <span className="text-xs">Wall</span>
        </Button>
        
        <Button
          variant={drawingTool === "door" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDrawingTool("door")}
          className="flex-col h-14 px-3"
        >
          <DoorOpen className="h-5 w-5 mb-1" />
          <span className="text-xs">Door</span>
        </Button>
        
        <Button
          variant={drawingTool === "window" ? "default" : "ghost"}
          size="sm"
          onClick={() => setDrawingTool("window")}
          className="flex-col h-14 px-3"
        >
          <RectangleHorizontal className="h-5 w-5 mb-1" />
          <span className="text-xs">Window</span>
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-col h-14 px-3">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Design Tools</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button onClick={onAddCabinet} className="h-20 flex-col">
                <Plus className="h-6 w-6 mb-2" />
                Add Cabinet
              </Button>
              <Button onClick={() => setShowGrid(!showGrid)} variant="outline" className="h-20 flex-col">
                <Grid3x3 className="h-6 w-6 mb-2" />
                {showGrid ? 'Hide' : 'Show'} Grid
              </Button>
              <Button onClick={onSaveTemplate} variant="outline" className="h-20 flex-col">
                <Save className="h-6 w-6 mb-2" />
                Save Template
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Layout className="h-6 w-6 mb-2" />
                Templates
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
