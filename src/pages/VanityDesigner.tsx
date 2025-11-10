import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight,
  Move,
  Square,
  Minus,
  DoorOpen,
  RectangleHorizontal,
  RotateCw,
  Maximize2,
  Paintbrush,
  CircleDot,
  Settings,
  Layout,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";
import { CABINET_CATALOG, calculateCabinetPrice, formatPrice, MATERIAL_FINISHES, HARDWARE_OPTIONS, type CabinetSpec } from "@/lib/cabinetCatalog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
  finishId?: string; // Material finish ID
  label?: string;
  price?: number; // Calculated price
  catalogRef?: string; // Reference to catalog item
  rotation?: 0 | 90 | 180 | 270; // Rotation in degrees
  handleType?: keyof typeof HARDWARE_OPTIONS.handles; // Handle type
  numHandles?: number; // Number of handles
  hasDrawers?: boolean; // Whether cabinet has drawers
  numDrawers?: number; // Number of drawers
}

interface Wall {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
}

interface Opening {
  id: number;
  type: "door" | "window";
  wallId: number;
  position: number; // Position along the wall (0-1)
  width: number; // Width in inches
}

// Use cabinet library from catalog
const CABINET_LIBRARY = CABINET_CATALOG;

const VanityDesigner = () => {
  const navigate = useNavigate();
  
  // View mode: 'floorplan' or 'render'
  const [viewMode, setViewMode] = useState<"floorplan" | "render">("floorplan");
  const [activeTab, setActiveTab] = useState("room-layout");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [drawingTool, setDrawingTool] = useState<"select" | "wall" | "door" | "window">("select");
  
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
      finishId: "tafisa-white",
      label: "DB36",
      rotation: 0,
      handleType: "bar",
      numHandles: 2,
      hasDrawers: true,
      numDrawers: 3
    }
  ]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(1);
  
  // Walls state
  const [walls, setWalls] = useState<Wall[]>([]);
  const [drawingWall, setDrawingWall] = useState<{ x: number; y: number } | null>(null);
  const [tempWallEnd, setTempWallEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Rotation state
  const [rotatingCabinet, setRotatingCabinet] = useState<number | null>(null);
  const [rotationStartAngle, setRotationStartAngle] = useState<number>(0);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  
  // Openings state (doors and windows)
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null);
  
  // Drag from library state
  const [draggingFromLibrary, setDraggingFromLibrary] = useState<CabinetSpec | null>(null);
  
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridSize = 24; // 12" grid at 2px per inch scale
  const wallThickness = 9; // 9px = 4.5 inches at 2px per inch scale
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Snap to grid helper
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);
  
  // Snap angle to common angles (0, 45, 90, 135, 180, 225, 270, 315)
  const snapAngle = useCallback((angle: number) => {
    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    const threshold = 10; // degrees
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(angle - snapAngle) < threshold) {
        return snapAngle;
      }
    }
    return angle;
  }, []);
  
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
  
  // Add cabinet from template
  const addCabinetFromTemplate = useCallback((template: CabinetSpec, x: number, y: number) => {
    const defaultFinishId = "tafisa-white";
    const defaultHandleType = "bar";
    const numHandles = template.subType === "drawer" ? 3 : 2;
    const price = calculateCabinetPrice(template, defaultFinishId, defaultHandleType, numHandles);
    
    const newCabinet: Cabinet = {
      id: Math.max(...cabinets.map(c => c.id), 0) + 1,
      type: template.type,
      width: template.width,
      height: template.height,
      depth: template.depth,
      x: snapToGrid(x),
      y: snapToGrid(y),
      brand: "Tafisa",
      finish: "White",
      finishId: defaultFinishId,
      label: template.label,
      price: price,
      catalogRef: template.label,
      rotation: 0,
      handleType: defaultHandleType,
      numHandles: numHandles,
      hasDrawers: template.subType === "drawer",
      numDrawers: template.subType === "drawer" ? 3 : 0,
    };
    setCabinets([...cabinets, newCabinet]);
    setSelectedCabinetId(newCabinet.id);
    toast.success(`${template.description} added - ${formatPrice(price)}`);
  }, [cabinets, snapToGrid]);

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

  const handleShare = useCallback(() => {
    toast.success("Share link copied");
  }, []);

  // Room layout presets
  const createRoomLayout = useCallback((type: 'straight' | 'l-shaped' | 'u-shaped' | 'closed') => {
    const baseY = 200;
    const baseX = 200;
    const wallLength = 400;
    const newWalls: Wall[] = [];
    
    switch (type) {
      case 'straight':
        newWalls.push({
          id: 1,
          x1: baseX,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY,
          thickness: wallThickness
        });
        break;
      case 'l-shaped':
        newWalls.push({
          id: 1,
          x1: baseX,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY,
          thickness: wallThickness
        });
        newWalls.push({
          id: 2,
          x1: baseX + wallLength,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY + wallLength,
          thickness: wallThickness
        });
        break;
      case 'u-shaped':
        newWalls.push({
          id: 1,
          x1: baseX,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY,
          thickness: wallThickness
        });
        newWalls.push({
          id: 2,
          x1: baseX + wallLength,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY + wallLength,
          thickness: wallThickness
        });
        newWalls.push({
          id: 3,
          x1: baseX + wallLength,
          y1: baseY + wallLength,
          x2: baseX,
          y2: baseY + wallLength,
          thickness: wallThickness
        });
        break;
      case 'closed':
        newWalls.push({
          id: 1,
          x1: baseX,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY,
          thickness: wallThickness
        });
        newWalls.push({
          id: 2,
          x1: baseX + wallLength,
          y1: baseY,
          x2: baseX + wallLength,
          y2: baseY + wallLength,
          thickness: wallThickness
        });
        newWalls.push({
          id: 3,
          x1: baseX + wallLength,
          y1: baseY + wallLength,
          x2: baseX,
          y2: baseY + wallLength,
          thickness: wallThickness
        });
        newWalls.push({
          id: 4,
          x1: baseX,
          y1: baseY + wallLength,
          x2: baseX,
          y2: baseY,
          thickness: wallThickness
        });
        break;
    }
    
    setWalls(newWalls);
    setOpenings([]);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} room created`);
  }, [wallThickness]);

  // Context menu handlers
  const rotateCabinet = useCallback((cabinetId: number) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId) {
        const newRotation = ((c.rotation || 0) + 90) % 360 as 0 | 90 | 180 | 270;
        return { ...c, rotation: newRotation };
      }
      return c;
    }));
    toast.success("Cabinet rotated");
  }, [cabinets]);

  const changeCabinetSize = useCallback((cabinetId: number, dimension: 'width' | 'height' | 'depth', value: number) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId) {
        const updated = { ...c, [dimension]: value };
        // Recalculate price if we have a catalog reference
        if (c.catalogRef && c.finishId) {
          const template = CABINET_CATALOG.find(t => t.label === c.catalogRef);
          if (template) {
            updated.price = calculateCabinetPrice(
              { ...template, [dimension]: value },
              c.finishId,
              c.handleType || "bar",
              c.numHandles || 2
            );
          }
        }
        return updated;
      }
      return c;
    }));
    toast.success(`Cabinet ${dimension} updated`);
  }, [cabinets]);

  const changeCabinetFinish = useCallback((cabinetId: number, finishId: string) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId) {
        const finish = MATERIAL_FINISHES.find(f => f.id === finishId);
        if (!finish) return c;
        
        const updated = { 
          ...c, 
          finishId,
          finish: finish.name,
          brand: finish.brand
        };
        
        // Recalculate price
        if (c.catalogRef) {
          const template = CABINET_CATALOG.find(t => t.label === c.catalogRef);
          if (template) {
            updated.price = calculateCabinetPrice(
              template,
              finishId,
              c.handleType || "bar",
              c.numHandles || 2
            );
          }
        }
        return updated;
      }
      return c;
    }));
    toast.success("Finish updated");
  }, [cabinets]);

  const changeCabinetHardware = useCallback((cabinetId: number, handleType: keyof typeof HARDWARE_OPTIONS.handles) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId) {
        const updated = { ...c, handleType };
        
        // Recalculate price
        if (c.catalogRef && c.finishId) {
          const template = CABINET_CATALOG.find(t => t.label === c.catalogRef);
          if (template) {
            updated.price = calculateCabinetPrice(
              template,
              c.finishId,
              handleType,
              c.numHandles || 2
            );
          }
        }
        return updated;
      }
      return c;
    }));
    toast.success("Hardware updated");
  }, [cabinets]);

  const toggleCabinetDrawers = useCallback((cabinetId: number) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId) {
        const newHasDrawers = !c.hasDrawers;
        return { 
          ...c, 
          hasDrawers: newHasDrawers,
          numDrawers: newHasDrawers ? (c.numDrawers || 3) : 0
        };
      }
      return c;
    }));
    toast.success("Cabinet configuration updated");
  }, [cabinets]);

  const resetToStandardHeight = useCallback((cabinetId: number) => {
    setCabinets(cabinets.map(c => {
      if (c.id === cabinetId && c.type === "Base Cabinet") {
        return { ...c, height: 34.5 };
      }
      return c;
    }));
    toast.success("Height reset to standard 34.5\"");
  }, [cabinets]);

  // Rotation handlers
  const handleRotateStart = useCallback((e: React.MouseEvent, cabinetId: number) => {
    e.stopPropagation();
    e.preventDefault();
    const cabinet = cabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;
    
    setRotatingCabinet(cabinetId);
    setSelectedCabinetId(cabinetId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = cabinet.x + (cabinet.width * 2) / 2;
    const centerY = cabinet.y + (cabinet.depth * 2) / 2;
    const angle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX) * (180 / Math.PI);
    
    setRotationStartAngle(angle - (cabinet.rotation || 0));
    setCurrentRotation(cabinet.rotation || 0);
  }, [cabinets]);
  
  const handleRotateMove = useCallback((e: React.MouseEvent) => {
    if (rotatingCabinet === null) return;
    
    const cabinet = cabinets.find(c => c.id === rotatingCabinet);
    if (!cabinet) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = cabinet.x + (cabinet.width * 2) / 2;
    const centerY = cabinet.y + (cabinet.depth * 2) / 2;
    const angle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX) * (180 / Math.PI);
    
    let newRotation = angle - rotationStartAngle;
    newRotation = ((newRotation % 360) + 360) % 360; // Normalize to 0-360
    newRotation = snapAngle(newRotation);
    
    setCurrentRotation(newRotation);
  }, [rotatingCabinet, cabinets, rotationStartAngle, snapAngle]);
  
  const handleRotateEnd = useCallback(() => {
    if (rotatingCabinet === null) return;
    
    setCabinets(cabinets.map(c => {
      if (c.id === rotatingCabinet) {
        return { ...c, rotation: currentRotation as 0 | 90 | 180 | 270 };
      }
      return c;
    }));
    
    setRotatingCabinet(null);
  }, [rotatingCabinet, cabinets, currentRotation]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, cabinetId: number) => {
    // Check if shift key is pressed for rotation mode
    if (e.shiftKey) {
      handleRotateStart(e, cabinetId);
      return;
    }
    
    const cabinet = cabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;
    
    setDraggingId(cabinetId);
    setSelectedCabinetId(cabinetId);
    setDragOffset({
      x: e.clientX - cabinet.x,
      y: e.clientY - cabinet.y
    });
  }, [cabinets, handleRotateStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rotatingCabinet !== null) {
      handleRotateMove(e);
      return;
    }
    
    if (draggingId === null) return;
    
    const newX = snapToGrid(e.clientX - dragOffset.x);
    const newY = snapToGrid(e.clientY - dragOffset.y);
    
    setCabinets(cabinets.map(c => 
      c.id === draggingId ? { ...c, x: newX, y: newY } : c
    ));
  }, [draggingId, dragOffset, snapToGrid, cabinets, rotatingCabinet, handleRotateMove]);

  const handleMouseUp = useCallback(() => {
    if (rotatingCabinet !== null) {
      handleRotateEnd();
    }
    setDraggingId(null);
  }, [rotatingCabinet, handleRotateEnd]);
  
  // Library drag handlers
  const handleLibraryDragStart = useCallback((template: CabinetSpec) => {
    setDraggingFromLibrary(template);
  }, []);
  
  const handleCanvasDrop = useCallback((e: React.MouseEvent) => {
    if (!draggingFromLibrary) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addCabinetFromTemplate(draggingFromLibrary, x, y);
    setDraggingFromLibrary(null);
  }, [draggingFromLibrary, addCabinetFromTemplate]);

  // Wall drawing handlers
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = snapToGrid(e.clientX - rect.left);
    const y = snapToGrid(e.clientY - rect.top);
    
    if (drawingTool === "wall") {
      if (!drawingWall) {
        // Start drawing wall
        setDrawingWall({ x, y });
      } else {
        // Finish drawing wall
        const newWall: Wall = {
          id: Math.max(...walls.map(w => w.id), 0) + 1,
          x1: drawingWall.x,
          y1: drawingWall.y,
          x2: x,
          y2: y,
          thickness: wallThickness
        };
        setWalls([...walls, newWall]);
        setDrawingWall(null);
        setTempWallEnd(null);
        toast.success("Wall added");
      }
    } else if (drawingTool === "door" || drawingTool === "window") {
      // Find nearest wall
      const clickPoint = { x, y };
      let nearestWall: Wall | null = null;
      let minDistance = Infinity;
      let wallPosition = 0;
      
      walls.forEach(wall => {
        const distance = pointToLineDistance(clickPoint, wall);
        if (distance < 20 && distance < minDistance) { // Within 20px of wall
          minDistance = distance;
          nearestWall = wall;
          wallPosition = getPositionOnWall(clickPoint, wall);
        }
      });
      
      if (nearestWall) {
        const newOpening: Opening = {
          id: Math.max(...openings.map(o => o.id), 0) + 1,
          type: drawingTool,
          wallId: nearestWall.id,
          position: wallPosition,
          width: drawingTool === "door" ? 36 : 48 // Default: 36" door, 48" window
        };
        setOpenings([...openings, newOpening]);
        setSelectedOpeningId(newOpening.id);
        toast.success(`${drawingTool === "door" ? "Door" : "Window"} added`);
      } else {
        toast.error("Click near a wall to place opening");
      }
    }
  }, [drawingTool, drawingWall, walls, openings, snapToGrid, wallThickness]);
  
  // Helper: Calculate distance from point to line segment
  const pointToLineDistance = (point: { x: number; y: number }, wall: Wall) => {
    const { x1, y1, x2, y2 } = wall;
    const A = point.x - x1;
    const B = point.y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Helper: Get position along wall (0-1)
  const getPositionOnWall = (point: { x: number; y: number }, wall: Wall) => {
    const { x1, y1, x2, y2 } = wall;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    
    if (lenSq === 0) return 0;
    
    const t = ((point.x - x1) * dx + (point.y - y1) * dy) / lenSq;
    return Math.max(0, Math.min(1, t));
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (drawingTool === "wall" && drawingWall) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = snapToGrid(e.clientX - rect.left);
      const y = snapToGrid(e.clientY - rect.top);
      setTempWallEnd({ x, y });
    }
  }, [drawingTool, drawingWall, snapToGrid]);

  const deleteSelectedWall = useCallback(() => {
    // For now, delete the last wall
    if (walls.length > 0) {
      setWalls(walls.slice(0, -1));
      toast.success("Wall removed");
    }
  }, [walls]);
  
  const deleteSelectedOpening = useCallback(() => {
    if (selectedOpeningId) {
      setOpenings(openings.filter(o => o.id !== selectedOpeningId));
      setSelectedOpeningId(null);
      toast.success("Opening removed");
    } else if (openings.length > 0) {
      // Delete last opening if none selected
      setOpenings(openings.slice(0, -1));
      toast.success("Opening removed");
    }
  }, [openings, selectedOpeningId]);
  
  const adjustOpeningWidth = useCallback((delta: number) => {
    if (!selectedOpeningId) return;
    setOpenings(openings.map(o => 
      o.id === selectedOpeningId 
        ? { ...o, width: Math.max(24, Math.min(96, o.width + delta)) } // 24" to 96"
        : o
    ));
  }, [openings, selectedOpeningId]);

  const calculateWallLength = (wall: Wall) => {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    const lengthInches = lengthPx / 2; // 2px per inch
    return Math.round(lengthInches);
  };

  // Render ribbon content based on active tab
  const renderRibbonContent = () => {
    switch (activeTab) {
      case "room-layout":
        return (
          <div className="flex items-center gap-6 px-4 py-2 bg-muted/30">
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setDrawingTool("select")}
                variant={drawingTool === "select" ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <Move className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Select</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setDrawingTool("wall")}
                variant={drawingTool === "wall" ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Draw Wall</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setDrawingTool("door")}
                variant={drawingTool === "door" ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <DoorOpen className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Add Door</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setDrawingTool("window")}
                variant={drawingTool === "window" ? "default" : "ghost"}
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1"
              >
                <RectangleHorizontal className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Add Window</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={deleteSelectedWall}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
                disabled={walls.length === 0}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Delete Wall</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={deleteSelectedOpening}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
                disabled={openings.length === 0}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Delete Opening</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => setWalls([])}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
                disabled={walls.length === 0}
              >
                <Square className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Clear Room</span>
            </div>
            {selectedOpeningId && (
              <>
                <div className="w-px h-12 bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    <Button 
                      onClick={() => adjustOpeningWidth(-6)}
                      variant="ghost"
                      size="sm" 
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <Button 
                      onClick={() => adjustOpeningWidth(6)}
                      variant="ghost"
                      size="sm" 
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-[10px]">Adjust Width</span>
                </div>
              </>
            )}
          </div>
        );
      case "items":
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
            variant={activeTab === "room-layout" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("room-layout")}
            className="h-8 px-3"
          >
            ROOM LAYOUT
          </Button>
          
          <Button
            variant={activeTab === "items" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("items")}
            className="h-8 px-3"
          >
            ITEMS
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
              <h3 className="font-semibold text-sm">
                {activeTab === "room-layout" ? "Room Tools" : "Cabinet Library"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftPanel(false)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {activeTab === "room-layout" ? (
                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="presets" className="space-y-2 mt-3">
                    <div>
                      <Label className="text-xs font-semibold mb-2 block">Quick Layouts</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => createRoomLayout('straight')}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <Minus className="h-4 w-4" />
                          <span className="text-xs">Straight</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => createRoomLayout('l-shaped')}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <ArrowRight className="h-4 w-4 rotate-[-90deg]" />
                          <span className="text-xs">L-Shaped</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => createRoomLayout('u-shaped')}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <Layout className="h-4 w-4" />
                          <span className="text-xs">U-Shaped</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => createRoomLayout('closed')}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <Square className="h-4 w-4" />
                          <span className="text-xs">Closed</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded text-xs">
                      <div className="font-medium mb-1">Tips:</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Click twice to draw a wall</li>
                        <li>Click on walls to add openings</li>
                        <li>Select openings to adjust size</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="properties" className="space-y-3 mt-3">
                    {walls.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Walls</Label>
                        {walls.map((wall, idx) => (
                          <Card key={wall.id} className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">Wall #{idx + 1}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setWalls(walls.filter(w => w.id !== wall.id));
                                  toast.success("Wall removed");
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Length: {calculateWallLength(wall)}"
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {openings.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Openings</Label>
                        {openings.map((opening) => (
                          <Card key={opening.id} className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium capitalize">{opening.type}</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setOpenings(openings.filter(o => o.id !== opening.id));
                                  toast.success("Opening removed");
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Width (inches)</Label>
                              <Input 
                                type="number"
                                value={opening.width}
                                onChange={(e) => {
                                  const newWidth = Math.max(24, Math.min(96, parseInt(e.target.value) || 24));
                                  setOpenings(openings.map(o => 
                                    o.id === opening.id ? { ...o, width: newWidth } : o
                                  ));
                                }}
                                className="h-7 text-xs"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  {/* Cabinet Properties Panel when one is selected */}
                  {selectedCabinetId && cabinets.find(c => c.id === selectedCabinetId) && (
                    <Card className="p-3 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-xs font-semibold">Selected Cabinet</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setSelectedCabinetId(null)}
                        >
                          ×
                        </Button>
                      </div>
                      {(() => {
                        const cabinet = cabinets.find(c => c.id === selectedCabinetId);
                        if (!cabinet) return null;
                        
                        return (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-[10px]">Label</Label>
                              <Input 
                                value={cabinet.label || ""}
                                onChange={(e) => {
                                  setCabinets(cabinets.map(c => 
                                    c.id === selectedCabinetId ? { ...c, label: e.target.value } : c
                                  ));
                                }}
                                className="h-7 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-[10px]">Width</Label>
                                <Input 
                                  type="number"
                                  value={cabinet.width}
                                  onChange={(e) => changeCabinetSize(cabinet.id, 'width', parseFloat(e.target.value) || cabinet.width)}
                                  className="h-7 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px]">Height</Label>
                                <Input 
                                  type="number"
                                  value={cabinet.height}
                                  onChange={(e) => changeCabinetSize(cabinet.id, 'height', parseFloat(e.target.value) || cabinet.height)}
                                  className="h-7 text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-[10px]">Depth</Label>
                                <Input 
                                  type="number"
                                  value={cabinet.depth}
                                  onChange={(e) => changeCabinetSize(cabinet.id, 'depth', parseFloat(e.target.value) || cabinet.depth)}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[10px]">Rotation (degrees)</Label>
                              <Input 
                                type="number"
                                value={cabinet.rotation || 0}
                                onChange={(e) => {
                                  const newRotation = parseInt(e.target.value) % 360;
                                  setCabinets(cabinets.map(c => 
                                    c.id === selectedCabinetId ? { ...c, rotation: newRotation as 0 | 90 | 180 | 270 } : c
                                  ));
                                }}
                                className="h-7 text-xs"
                              />
                            </div>
                            {cabinet.price && (
                              <div className="pt-2 border-t text-xs">
                                <span className="font-medium">Price: </span>
                                <span className="text-primary">{formatPrice(cabinet.price)}</span>
                              </div>
                            )}
                            <div className="pt-1 text-[10px] text-muted-foreground">
                              💡 Shift+Drag to rotate with mouse
                            </div>
                          </div>
                        );
                      })()}
                    </Card>
                  )}
                  
                  {/* Base Cabinets */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">BASE CABINETS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.type === "Base Cabinet").map((template, idx) => (
                        <Card
                          key={idx}
                          className="p-2 cursor-move hover:bg-accent/50 transition-colors"
                          draggable
                          onDragStart={() => handleLibraryDragStart(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{template.label}</p>
                              <p className="text-[10px] text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {template.width}"W
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Wall Cabinets */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">WALL CABINETS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.type === "Wall Cabinet").map((template, idx) => (
                        <Card
                          key={idx}
                          className="p-2 cursor-move hover:bg-accent/50 transition-colors"
                          draggable
                          onDragStart={() => handleLibraryDragStart(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{template.label}</p>
                              <p className="text-[10px] text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {template.width}"W
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tall Cabinets */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">TALL CABINETS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.type === "Tall Cabinet").map((template, idx) => (
                        <Card
                          key={idx}
                          className="p-2 cursor-move hover:bg-accent/50 transition-colors"
                          draggable
                          onDragStart={() => handleLibraryDragStart(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{template.label}</p>
                              <p className="text-[10px] text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {template.width}"W
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Corner Cabinets */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">CORNER CABINETS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.type === "Corner Cabinet").map((template, idx) => (
                        <Card
                          key={idx}
                          className="p-2 cursor-move hover:bg-accent/50 transition-colors"
                          draggable
                          onDragStart={() => handleLibraryDragStart(template)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium">{template.label}</p>
                              <p className="text-[10px] text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {template.width}"W
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
              onMouseMove={(e) => {
                handleMouseMove(e);
                handleCanvasMouseMove(e);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              onDrop={handleCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ cursor: drawingTool === "wall" ? "crosshair" : draggingFromLibrary ? "copy" : "default" }}
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

              {/* Walls with openings */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                {walls.map(wall => {
                  const length = calculateWallLength(wall);
                  const wallOpenings = openings.filter(o => o.wallId === wall.id);
                  
                  // If no openings, draw solid wall
                  if (wallOpenings.length === 0) {
                    return (
                      <g key={wall.id}>
                        <line
                          x1={wall.x1}
                          y1={wall.y1}
                          x2={wall.x2}
                          y2={wall.y2}
                          stroke="#6B7280"
                          strokeWidth={wall.thickness + 2}
                          strokeLinecap="square"
                          opacity={0.3}
                        />
                        <line
                          x1={wall.x1}
                          y1={wall.y1}
                          x2={wall.x2}
                          y2={wall.y2}
                          stroke="#1F2937"
                          strokeWidth={wall.thickness}
                          strokeLinecap="square"
                        />
                      </g>
                    );
                  }
                  
                  // Draw wall segments around openings
                  const segments: Array<{ start: number; end: number }> = [];
                  let currentStart = 0;
                  
                  // Sort openings by position
                  const sortedOpenings = [...wallOpenings].sort((a, b) => a.position - b.position);
                  
                  sortedOpenings.forEach(opening => {
                    const openingWidthPx = opening.width * 2; // inches to px
                    const wallLengthPx = Math.sqrt(
                      Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2)
                    );
                    const openingWidthRatio = openingWidthPx / wallLengthPx;
                    const openingStart = Math.max(0, opening.position - openingWidthRatio / 2);
                    const openingEnd = Math.min(1, opening.position + openingWidthRatio / 2);
                    
                    if (openingStart > currentStart) {
                      segments.push({ start: currentStart, end: openingStart });
                    }
                    currentStart = openingEnd;
                  });
                  
                  if (currentStart < 1) {
                    segments.push({ start: currentStart, end: 1 });
                  }
                  
                  return (
                    <g key={wall.id}>
                      {/* Draw wall segments */}
                      {segments.map((seg, idx) => {
                        const x1 = wall.x1 + (wall.x2 - wall.x1) * seg.start;
                        const y1 = wall.y1 + (wall.y2 - wall.y1) * seg.start;
                        const x2 = wall.x1 + (wall.x2 - wall.x1) * seg.end;
                        const y2 = wall.y1 + (wall.y2 - wall.y1) * seg.end;
                        
                        return (
                          <g key={idx}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#6B7280"
                              strokeWidth={wall.thickness + 2}
                              strokeLinecap="square"
                              opacity={0.3}
                            />
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#1F2937"
                              strokeWidth={wall.thickness}
                              strokeLinecap="square"
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
              
              {/* Wall dimensions */}
              {showDimensions && walls.map(wall => {
                const length = calculateWallLength(wall);
                const midX = (wall.x1 + wall.x2) / 2;
                const midY = (wall.y1 + wall.y2) / 2;
                
                return (
                  <div 
                    key={`dim-${wall.id}`}
                    className="absolute text-[11px] font-medium bg-white px-2 py-0.5 rounded shadow-sm pointer-events-none"
                    style={{
                      left: midX,
                      top: midY - 20,
                      transform: 'translateX(-50%)',
                      color: '#0066CC',
                      border: '1px solid #0066CC'
                    }}
                  >
                    {length}"
                  </div>
                );
              })}
              
              {/* Openings (doors and windows) */}
              {openings.map(opening => {
                const wall = walls.find(w => w.id === opening.wallId);
                if (!wall) return null;
                
                const x = wall.x1 + (wall.x2 - wall.x1) * opening.position;
                const y = wall.y1 + (wall.y2 - wall.y1) * opening.position;
                const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
                const isSelected = selectedOpeningId === opening.id;
                
                return (
                  <div
                    key={opening.id}
                    className={`absolute cursor-pointer transition-all ${
                      isSelected ? "z-20" : "z-10"
                    }`}
                    style={{
                      left: x,
                      top: y,
                      width: opening.width * 2, // px
                      height: 16,
                      transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOpeningId(opening.id);
                    }}
                  >
                    {opening.type === "door" ? (
                      <div className={`h-full flex items-center justify-center border-2 rounded ${
                        isSelected ? "border-[#FF8C00] bg-[#FF8C00]/20" : "border-blue-500 bg-blue-100"
                      }`}>
                        <DoorOpen className="h-3 w-3" />
                        <span className="text-[9px] ml-1 font-medium">{opening.width}"</span>
                      </div>
                    ) : (
                      <div className={`h-full flex items-center justify-center border-2 rounded ${
                        isSelected ? "border-[#FF8C00] bg-[#FF8C00]/20" : "border-cyan-500 bg-cyan-100"
                      }`}>
                        <RectangleHorizontal className="h-3 w-3" />
                        <span className="text-[9px] ml-1 font-medium">{opening.width}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Drawing preview wall */}
              {drawingWall && tempWallEnd && (
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  <line
                    x1={drawingWall.x}
                    y1={drawingWall.y}
                    x2={tempWallEnd.x}
                    y2={tempWallEnd.y}
                    stroke="#FF8C00"
                    strokeWidth={wallThickness}
                    strokeLinecap="square"
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />
                </svg>
              )}

              {/* Cabinets */}
              {cabinets.map(cabinet => {
                const widthPx = cabinet.width * 2;
                const depthPx = cabinet.depth * 2;
                const rotation = cabinet.rotation || 0;
                
                return (
                  <ContextMenu key={cabinet.id}>
                    <ContextMenuTrigger>
                      <div
                        className={`absolute transition-all group ${
                          selectedCabinetId === cabinet.id 
                            ? "shadow-lg z-10" 
                            : "hover:shadow-md"
                        } ${rotatingCabinet === cabinet.id ? "cursor-grabbing" : "cursor-move"}`}
                        style={{
                          left: cabinet.x,
                          top: cabinet.y,
                          width: rotation === 90 || rotation === 270 ? depthPx : widthPx,
                          height: rotation === 90 || rotation === 270 ? widthPx : depthPx,
                          backgroundColor: selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6',
                          border: selectedCabinetId === cabinet.id ? '2px solid #FF8C00' : '1px solid #9CA3AF',
                          transform: `rotate(${rotatingCabinet === cabinet.id ? currentRotation : rotation}deg)`,
                          transformOrigin: 'center'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, cabinet.id)}
                      >
                        {/* Rotation handle */}
                        {selectedCabinetId === cabinet.id && (
                          <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 cursor-grab hover:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleRotateStart(e, cabinet.id);
                            }}
                            style={{ 
                              transform: `translateX(-50%) rotate(-${rotatingCabinet === cabinet.id ? currentRotation : rotation}deg)` 
                            }}
                          >
                            <div className="bg-primary hover:bg-primary/90 text-primary-foreground p-1 rounded-full shadow-md">
                              <RotateCw className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                        
                        {/* Cabinet label */}
                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium pointer-events-none select-none">
                          <div style={{ transform: `rotate(-${rotatingCabinet === cabinet.id ? currentRotation : rotation}deg)` }}>
                            {cabinet.label || cabinet.type}
                            {rotatingCabinet === cabinet.id && (
                              <div className="text-[9px] text-primary mt-0.5">
                                {Math.round(currentRotation)}°
                              </div>
                            )}
                          </div>
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
                                {rotation === 90 || rotation === 270 ? cabinet.depth : cabinet.width}"
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
                                {rotation === 90 || rotation === 270 ? cabinet.width : cabinet.depth}"
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem onClick={() => rotateCabinet(cabinet.id)}>
                        <RotateCw className="mr-2 h-4 w-4" />
                        Rotate 90°
                      </ContextMenuItem>
                      
                      <ContextMenuSeparator />
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Maximize2 className="mr-2 h-4 w-4" />
                          Change Size
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <div className="px-2 py-1.5 text-xs font-semibold">Width</div>
                          {[12, 15, 18, 24, 30, 36, 42, 48].map(w => (
                            <ContextMenuItem 
                              key={w}
                              onClick={() => changeCabinetSize(cabinet.id, 'width', w)}
                            >
                              {w}" {cabinet.width === w && "✓"}
                            </ContextMenuItem>
                          ))}
                          <ContextMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-semibold">Height</div>
                          {[30, 34.5, 36, 42, 84, 90, 96].map(h => (
                            <ContextMenuItem 
                              key={h}
                              onClick={() => changeCabinetSize(cabinet.id, 'height', h)}
                            >
                              {h}" {cabinet.height === h && "✓"}
                            </ContextMenuItem>
                          ))}
                          <ContextMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-semibold">Depth</div>
                          {[12, 15, 18, 21, 24].map(d => (
                            <ContextMenuItem 
                              key={d}
                              onClick={() => changeCabinetSize(cabinet.id, 'depth', d)}
                            >
                              {d}" {cabinet.depth === d && "✓"}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Paintbrush className="mr-2 h-4 w-4" />
                          Change Finish
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {MATERIAL_FINISHES.map(finish => (
                            <ContextMenuItem 
                              key={finish.id}
                              onClick={() => changeCabinetFinish(cabinet.id, finish.id)}
                            >
                              <div className="flex flex-col">
                                <span>{finish.name}</span>
                                <span className="text-xs text-muted-foreground">{finish.brand}</span>
                              </div>
                              {cabinet.finishId === finish.id && <span className="ml-auto">✓</span>}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <CircleDot className="mr-2 h-4 w-4" />
                          Change Hardware
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {Object.entries(HARDWARE_OPTIONS.handles).map(([key, value]) => (
                            <ContextMenuItem 
                              key={key}
                              onClick={() => changeCabinetHardware(cabinet.id, key as keyof typeof HARDWARE_OPTIONS.handles)}
                            >
                              {value.name} {cabinet.handleType === key && "✓"}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSeparator />
                      
                      <ContextMenuItem onClick={() => toggleCabinetDrawers(cabinet.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        {cabinet.hasDrawers ? "Convert to Doors" : "Convert to Drawers"}
                      </ContextMenuItem>
                      
                      {cabinet.type === "Base Cabinet" && cabinet.height !== 34.5 && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => resetToStandardHeight(cabinet.id)}>
                            Reset to Standard Height (34.5")
                          </ContextMenuItem>
                        </>
                      )}
                      
                      <ContextMenuSeparator />
                      
                      <ContextMenuItem onClick={() => duplicateCabinet()}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </ContextMenuItem>
                      
                      <ContextMenuItem 
                        onClick={() => removeCabinet()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}

              {/* Info overlay */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded border border-border shadow-lg text-[10px] text-muted-foreground pointer-events-none">
                <div>Grid: 12" × 12"</div>
                <div>Scale: 2px = 1"</div>
                <div>Walls: {walls.length}</div>
                <div>Openings: {openings.length}</div>
                <div>Cabinets: {cabinets.length}</div>
                {drawingTool === "wall" && <div className="text-[#FF8C00] font-medium mt-1">Click to place wall points</div>}
                {(drawingTool === "door" || drawingTool === "window") && (
                  <div className="text-[#FF8C00] font-medium mt-1">Click on a wall to place {drawingTool}</div>
                )}
                {draggingFromLibrary && (
                  <div className="text-[#FF8C00] font-medium mt-1">Drop to place {draggingFromLibrary.label}</div>
                )}
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