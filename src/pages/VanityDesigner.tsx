import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  FolderOpen,
  Edit,
  Upload,
  Scan,
  Undo,
  Redo
} from "lucide-react";
import { toast } from "sonner";
import { Vanity3DPreview } from "@/components/Vanity3DPreview";
import { CABINET_CATALOG, calculateCabinetPrice, formatPrice, MATERIAL_FINISHES, HARDWARE_OPTIONS, DOOR_STYLES, type CabinetSpec } from "@/lib/cabinetCatalog";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRoomTemplates } from "@/hooks/useRoomTemplates";

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
  doorStyleId?: string; // Door style ID
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
  height: number; // Height in inches
  yPosition: number; // Height from floor in inches
}

// Professional default dimensions
const DEFAULTS = {
  WALL_HEIGHT: 96, // 96" wall height
  BASE_CABINET_Y: 0, // Base cabinets on floor
  WALL_CABINET_Y: 54, // Wall cabinets 54" from floor
  DOOR_WIDTH: 30, // 30" door width
  DOOR_HEIGHT: 84, // 84" door height
  DOOR_Y: 0, // Doors at floor level
  WINDOW_WIDTH: 30, // 30" window width
  WINDOW_HEIGHT: 30, // 30" window height (default)
  WINDOW_Y: 42, // Windows 42" from floor
};

// Use cabinet library from catalog
const CABINET_LIBRARY = CABINET_CATALOG;

const VanityDesigner = () => {
  const navigate = useNavigate();
  
  // Templates hook
  const { templates, saveTemplate, deleteTemplate, loadTemplate, duplicateTemplate } = useRoomTemplates();
  
  // Save template dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  
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
      doorStyleId: "flat",
      label: "DB36",
      rotation: 0,
      handleType: "bar",
      numHandles: 2,
      hasDrawers: true,
      numDrawers: 3
    }
  ]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(1);
  
  // Walls and Openings state with undo/redo
  const {
    state: layoutState,
    setState: setLayoutState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<{ walls: Wall[]; openings: Opening[] }>({ walls: [], openings: [] });
  
  const walls = layoutState.walls;
  const openings = layoutState.openings;
  
  // Helper functions to update walls and openings with history tracking
  const setWalls = useCallback((newWalls: Wall[] | ((prev: Wall[]) => Wall[])) => {
    setLayoutState(prev => ({
      ...prev,
      walls: typeof newWalls === 'function' ? newWalls(prev.walls) : newWalls
    }));
  }, [setLayoutState]);
  
  const setOpenings = useCallback((newOpenings: Opening[] | ((prev: Opening[]) => Opening[])) => {
    setLayoutState(prev => ({
      ...prev,
      openings: typeof newOpenings === 'function' ? newOpenings(prev.openings) : newOpenings
    }));
  }, [setLayoutState]);
  
  const [drawingWall, setDrawingWall] = useState<{ x: number; y: number } | null>(null);
  const [tempWallEnd, setTempWallEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Rotation state
  const [rotatingCabinet, setRotatingCabinet] = useState<number | null>(null);
  const [rotationStartAngle, setRotationStartAngle] = useState<number>(0);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(null);
  
  // Track which elements came from scan
  const [scanSourced, setScanSourced] = useState<{
    walls: number[];
    openings: number[];
  }>({ walls: [], openings: [] });
  
  // Drag handle state
  const [draggingHandle, setDraggingHandle] = useState<{
    type: 'wall-start' | 'wall-end' | 'opening';
    id: number;
  } | null>(null);
  
  // Drag feedback state
  const [dragFeedback, setDragFeedback] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);
  
  // Drag trail state for visualizing movement path
  const [dragTrail, setDragTrail] = useState<Array<{ x: number; y: number }>>([]);
  
  // Collision detection state
  const [cabinetCollisions, setCabinetCollisions] = useState<Map<number, string[]>>(new Map());
  
  // Drag from library state
  const [draggingFromLibrary, setDraggingFromLibrary] = useState<CabinetSpec | null>(null);
  
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridSize = 24; // 12" grid at 2px per inch scale
  const wallThickness = 9; // 9px = 4.5 inches at 2px per inch scale
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgCanvasRef = useRef<SVGSVGElement>(null);
  
  // History timeline state
  const [historyThumbnails, setHistoryThumbnails] = useState<Array<{
    id: number;
    thumbnail: string;
    timestamp: Date;
    description: string;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Selected wall for context menu
  const [selectedWallId, setSelectedWallId] = useState<number | null>(null);
  
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

  // Load scanned measurements and create room layout
  useEffect(() => {
    const loadScannedMeasurements = () => {
      try {
        // Check sessionStorage first (from recent scan)
        const currentScanStr = sessionStorage.getItem('current_scan');
        if (currentScanStr) {
          const scan = JSON.parse(currentScanStr);
          applyScannedMeasurementsToWalls(scan);
          return;
        }

        // Check localStorage for saved scans
        const savedScansStr = localStorage.getItem('room_scans');
        if (savedScansStr) {
          const scans = JSON.parse(savedScansStr);
          if (scans.length > 0) {
            // Use the most recent scan
            const latestScan = scans[scans.length - 1];
            applyScannedMeasurementsToWalls(latestScan);
          }
        }
      } catch (error) {
        console.error('Error loading scanned measurements:', error);
      }
    };

    const applyScannedMeasurementsToWalls = (scan: any) => {
      // Convert meters to pixels (1 meter = 39.3701 inches, 2px per inch)
      const widthPx = Math.round(scan.measurements.width * 39.3701 * 2);
      const depthPx = Math.round(scan.measurements.depth * 39.3701 * 2);
      
      const baseX = 200;
      const baseY = 200;
      
      // Create a closed rectangular room based on scanned dimensions
      const newWalls: Wall[] = [
        {
          id: 1,
          x1: baseX,
          y1: baseY,
          x2: baseX + widthPx,
          y2: baseY,
          thickness: wallThickness
        },
        {
          id: 2,
          x1: baseX + widthPx,
          y1: baseY,
          x2: baseX + widthPx,
          y2: baseY + depthPx,
          thickness: wallThickness
        },
        {
          id: 3,
          x1: baseX + widthPx,
          y1: baseY + depthPx,
          x2: baseX,
          y2: baseY + depthPx,
          thickness: wallThickness
        },
        {
          id: 4,
          x1: baseX,
          y1: baseY + depthPx,
          x2: baseX,
          y2: baseY,
          thickness: wallThickness
        }
      ];
      
      setWalls(newWalls);
      
      // Track that these walls are from scan
      setScanSourced(prev => ({
        ...prev,
        walls: newWalls.map(w => w.id)
      }));
      
      // Apply detected windows and doors if available
      const newOpenings: Opening[] = [];
      let openingId = 1;
      
      // Add windows from scan
      scan.measurements.windows?.forEach((window: any, idx: number) => {
        const wallId = idx % 4 + 1; // Distribute across walls
        newOpenings.push({
          id: openingId++,
          type: 'window',
          wallId: wallId,
          position: 0.5, // Center of wall
          width: Math.round(window.width * 39.3701), // Convert meters to inches
          height: Math.round(window.height * 39.3701),
          yPosition: DEFAULTS.WINDOW_Y
        });
      });
      
      // Add doors from scan
      scan.measurements.doors?.forEach((door: any, idx: number) => {
        const wallId = idx % 4 + 1; // Distribute across walls
        newOpenings.push({
          id: openingId++,
          type: 'door',
          wallId: wallId,
          position: 0.3, // Near edge of wall
          width: Math.round(door.width * 39.3701), // Convert meters to inches
          height: Math.round(door.height * 39.3701),
          yPosition: DEFAULTS.DOOR_Y
        });
      });
      
      if (newOpenings.length > 0) {
        setOpenings(newOpenings);
        // Track that these openings are from scan
        setScanSourced(prev => ({
          ...prev,
          openings: newOpenings.map(o => o.id)
        }));
      }
      
      const widthFeet = (scan.measurements.width * 3.28084).toFixed(1);
      const depthFeet = (scan.measurements.depth * 3.28084).toFixed(1);
      
      toast.success(`Room layout loaded from ${scan.roomName}`, {
        description: `${widthFeet}' × ${depthFeet}' with ${scan.measurements.windows?.length || 0} windows, ${scan.measurements.doors?.length || 0} doors`,
      });
    };

    loadScannedMeasurements();
  }, [wallThickness]);
  
  // Collision detection helpers
  const checkCabinetWallCollision = useCallback((cabinet: Cabinet, walls: Wall[]): boolean => {
    const widthPx = cabinet.width * 2;
    const depthPx = cabinet.depth * 2;
    const rotation = cabinet.rotation || 0;
    
    // Get cabinet bounds (simplified for now - treats as rectangle)
    const cabinetLeft = cabinet.x;
    const cabinetRight = cabinet.x + widthPx;
    const cabinetTop = cabinet.y;
    const cabinetBottom = cabinet.y + depthPx;
    
    for (const wall of walls) {
      // Check if cabinet intersects with wall line segment
      const wallLeft = Math.min(wall.x1, wall.x2) - wall.thickness / 2;
      const wallRight = Math.max(wall.x1, wall.x2) + wall.thickness / 2;
      const wallTop = Math.min(wall.y1, wall.y2) - wall.thickness / 2;
      const wallBottom = Math.max(wall.y1, wall.y2) + wall.thickness / 2;
      
      // Check for overlap
      if (
        cabinetLeft < wallRight &&
        cabinetRight > wallLeft &&
        cabinetTop < wallBottom &&
        cabinetBottom > wallTop
      ) {
        return true;
      }
    }
    return false;
  }, []);
  
  const checkCabinetOpeningCollision = useCallback((cabinet: Cabinet, openings: Opening[], walls: Wall[]): boolean => {
    const widthPx = cabinet.width * 2;
    const depthPx = cabinet.depth * 2;
    
    const cabinetLeft = cabinet.x;
    const cabinetRight = cabinet.x + widthPx;
    const cabinetTop = cabinet.y;
    const cabinetBottom = cabinet.y + depthPx;
    
    for (const opening of openings) {
      const wall = walls.find(w => w.id === opening.wallId);
      if (!wall) continue;
      
      // Calculate opening position on wall
      const openingX = wall.x1 + (wall.x2 - wall.x1) * opening.position;
      const openingY = wall.y1 + (wall.y2 - wall.y1) * opening.position;
      const openingWidth = opening.width * 2; // Convert to pixels
      
      // Simplified collision check - treat opening as a rectangle
      const openingLeft = openingX - openingWidth / 2;
      const openingRight = openingX + openingWidth / 2;
      const openingTop = openingY - 10;
      const openingBottom = openingY + 10;
      
      if (
        cabinetLeft < openingRight &&
        cabinetRight > openingLeft &&
        cabinetTop < openingBottom &&
        cabinetBottom > openingTop
      ) {
        return true;
      }
    }
    return false;
  }, []);
  
  // Detect all collisions
  const detectCollisions = useCallback(() => {
    const collisionMap = new Map<number, string[]>();
    
    cabinets.forEach(cabinet => {
      const collisions: string[] = [];
      
      if (checkCabinetWallCollision(cabinet, walls)) {
        collisions.push("wall");
      }
      
      if (checkCabinetOpeningCollision(cabinet, openings, walls)) {
        collisions.push("opening");
      }
      
      if (collisions.length > 0) {
        collisionMap.set(cabinet.id, collisions);
      }
    });
    
    setCabinetCollisions(collisionMap);
  }, [cabinets, walls, openings, checkCabinetWallCollision, checkCabinetOpeningCollision]);
  
  // Run collision detection when cabinets, walls, or openings change
  useEffect(() => {
    detectCollisions();
  }, [detectCollisions]);
  
  // Show warnings for collisions
  useEffect(() => {
    if (cabinetCollisions.size > 0) {
      const collisionDetails: string[] = [];
      cabinetCollisions.forEach((types, cabinetId) => {
        const cabinet = cabinets.find(c => c.id === cabinetId);
        if (cabinet) {
          types.forEach(type => {
            if (type === "wall") {
              collisionDetails.push(`${cabinet.label || "Cabinet"} overlaps with wall`);
            } else if (type === "opening") {
              collisionDetails.push(`${cabinet.label || "Cabinet"} overlaps with door/window`);
            }
          });
        }
      });
      
      if (collisionDetails.length > 0) {
        toast.error(`⚠️ Collision detected: ${collisionDetails[0]}${collisionDetails.length > 1 ? ` (+${collisionDetails.length - 1} more)` : ''}`, {
          duration: 3000,
        });
      }
    }
  }, [cabinetCollisions.size]); // Only trigger when the number of collisions changes
  
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
    const defaultDoorStyleId = "flat";
    const defaultHandleType = "bar";
    const numHandles = template.subType === "drawer" ? 3 : 2;
    const price = calculateCabinetPrice(template, defaultFinishId, defaultDoorStyleId, defaultHandleType, numHandles);
    
    // Set Y position based on cabinet type - professional standards
    let yPosition: number;
    if (template.type === "Base Cabinet") {
      yPosition = DEFAULTS.BASE_CABINET_Y * 2; // Convert to pixels (2px per inch)
    } else if (template.type === "Wall Cabinet") {
      yPosition = DEFAULTS.WALL_CABINET_Y * 2; // Convert to pixels (2px per inch)
    } else {
      yPosition = snapToGrid(y); // Use clicked position for other types
    }
    
    const newCabinet: Cabinet = {
      id: Math.max(...cabinets.map(c => c.id), 0) + 1,
      type: template.type,
      width: template.width,
      height: template.height,
      depth: template.depth,
      x: snapToGrid(x),
      y: yPosition,
      brand: "Tafisa",
      finish: "White",
      finishId: defaultFinishId,
      doorStyleId: defaultDoorStyleId,
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

  // Calculate wall length in inches
  const calculateWallLength = useCallback((wall: Wall): number => {
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    // Convert pixels to inches (2px = 1 inch)
    return Math.round(lengthPx / 2);
  }, []);

  // Update wall endpoint
  const updateWallEndpoint = useCallback((wallId: number, endpoint: 'start' | 'end', axis: 'x' | 'y', value: number) => {
    setWalls(walls.map(wall => {
      if (wall.id === wallId) {
        if (endpoint === 'start') {
          return axis === 'x' ? { ...wall, x1: value } : { ...wall, y1: value };
        } else {
          return axis === 'x' ? { ...wall, x2: value } : { ...wall, y2: value };
        }
      }
      return wall;
    }));
  }, [walls]);
  
  // Update opening position along wall
  const updateOpeningPosition = useCallback((openingId: number, newPosition: number) => {
    setOpenings(openings.map(opening => 
      opening.id === openingId 
        ? { ...opening, position: Math.max(0, Math.min(1, newPosition)) }
        : opening
    ));
  }, [openings]);

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
              c.doorStyleId || "flat",
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
              c.doorStyleId || "flat",
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
              c.doorStyleId || "flat",
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

  // Capture canvas thumbnail for history
  const captureCanvasThumbnail = useCallback((): string => {
    if (!svgCanvasRef.current) return '';
    
    try {
      const svgElement = svgCanvasRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 200, 150);
        URL.revokeObjectURL(url);
      };
      img.src = url;
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Failed to capture thumbnail:', error);
      return '';
    }
  }, []);

  // Track layout changes for history
  useEffect(() => {
    const description = walls.length === 0 && openings.length === 0 
      ? 'Initial state'
      : `${walls.length} walls, ${openings.length} openings`;
    
    // Use a timeout to ensure SVG is rendered before capturing
    const timer = setTimeout(() => {
      const thumbnail = captureCanvasThumbnail();
      
      setHistoryThumbnails(prev => {
        // Check if this is a new state or an undo/redo navigation
        const lastState = prev[prev.length - 1];
        const stateKey = `${walls.length}-${openings.length}`;
        const lastKey = lastState ? `${lastState.description}` : '';
        
        // Only add new thumbnail if state actually changed
        if (lastKey !== description) {
          return [
            ...prev,
            {
              id: Date.now(),
              thumbnail: thumbnail || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
              timestamp: new Date(),
              description
            }
          ];
        }
        return prev;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [layoutState, captureCanvasThumbnail, walls.length, openings.length]);

  // Update history index based on undo/redo
  useEffect(() => {
    // Calculate index based on past states
    const pastLength = historyThumbnails.length > 0 ? historyThumbnails.length - 1 : 0;
    setHistoryIndex(pastLength);
  }, [historyThumbnails.length]);

  // Jump to specific history state
  const jumpToHistoryState = useCallback((index: number) => {
    if (index < 0 || index >= historyThumbnails.length) return;
    
    const diff = index - historyIndex;
    
    if (diff < 0) {
      // Going backwards - undo
      for (let i = 0; i < Math.abs(diff); i++) {
        undo();
      }
    } else if (diff > 0) {
      // Going forwards - redo
      for (let i = 0; i < diff; i++) {
        redo();
      }
    }
    
    setHistoryIndex(index);
    toast.success(`Jumped to state ${index + 1}`);
  }, [historyIndex, historyThumbnails.length, undo, redo]);


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

  // Template handlers
  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    
    if (walls.length === 0 && cabinets.length === 0) {
      toast.error("Nothing to save - add walls or cabinets first");
      return;
    }
    
    saveTemplate(templateName.trim(), walls, openings, cabinets, templateDescription.trim() || undefined);
    setShowSaveDialog(false);
    setTemplateName("");
    setTemplateDescription("");
  }, [templateName, templateDescription, walls, openings, cabinets, saveTemplate]);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = loadTemplate(templateId);
    if (template) {
      // Regenerate IDs to avoid conflicts
      const maxWallId = walls.length > 0 ? Math.max(...walls.map(w => w.id)) : 0;
      const maxOpeningId = openings.length > 0 ? Math.max(...openings.map(o => o.id)) : 0;
      const maxCabinetId = cabinets.length > 0 ? Math.max(...cabinets.map(c => c.id)) : 0;
      
      const newWalls = template.walls.map((w: any, idx: number) => ({
        ...w,
        id: maxWallId + idx + 1
      }));
      
      const wallIdMap = new Map(template.walls.map((w: any, idx: number) => [w.id, maxWallId + idx + 1]));
      
      const newOpenings = template.openings.map((o: any, idx: number) => ({
        ...o,
        id: maxOpeningId + idx + 1,
        wallId: wallIdMap.get(o.wallId) || o.wallId,
        // Add defaults for legacy templates missing new properties
        height: o.height ?? (o.type === "door" ? DEFAULTS.DOOR_HEIGHT : DEFAULTS.WINDOW_HEIGHT),
        yPosition: o.yPosition ?? (o.type === "door" ? DEFAULTS.DOOR_Y : DEFAULTS.WINDOW_Y),
      }));
      
      const newCabinets = template.cabinets.map((c: any, idx: number) => ({
        ...c,
        id: maxCabinetId + idx + 1
      }));
      
      setWalls(newWalls);
      setOpenings(newOpenings);
      setCabinets(newCabinets);
      setSelectedCabinetId(null);
      setActiveTab("items");
    }
  }, [walls, openings, cabinets, loadTemplate]);

  const openSaveDialog = useCallback(() => {
    if (walls.length === 0 && cabinets.length === 0) {
      toast.error("Nothing to save - add walls or cabinets first");
      return;
    }
    setShowSaveDialog(true);
  }, [walls, cabinets]);

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

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, cabinetId: number) => {
    const touch = e.touches[0];
    const cabinet = cabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;
    
    // Two-finger touch = rotation
    if (e.touches.length === 2) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setRotatingCabinet(cabinetId);
      setSelectedCabinetId(cabinetId);
      
      const centerX = cabinet.x + (cabinet.width * 2) / 2;
      const centerY = cabinet.y + (cabinet.depth * 2) / 2;
      const angle = Math.atan2(touch.clientY - rect.top - centerY, touch.clientX - rect.left - centerX) * (180 / Math.PI);
      
      setRotationStartAngle(angle - (cabinet.rotation || 0));
      setCurrentRotation(cabinet.rotation || 0);
    } else {
      // Single touch = drag
      setDraggingId(cabinetId);
      setSelectedCabinetId(cabinetId);
      setDragOffset({
        x: touch.clientX - cabinet.x,
        y: touch.clientY - cabinet.y
      });
    }
  }, [cabinets]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    if (rotatingCabinet !== null && e.touches.length === 2) {
      const cabinet = cabinets.find(c => c.id === rotatingCabinet);
      if (!cabinet) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = cabinet.x + (cabinet.width * 2) / 2;
      const centerY = cabinet.y + (cabinet.depth * 2) / 2;
      const angle = Math.atan2(touch.clientY - rect.top - centerY, touch.clientX - rect.left - centerX) * (180 / Math.PI);
      
      let newRotation = angle - rotationStartAngle;
      newRotation = ((newRotation % 360) + 360) % 360;
      newRotation = snapAngle(newRotation);
      
      setCurrentRotation(newRotation);
    } else if (draggingId !== null && e.touches.length === 1) {
      const newX = snapToGrid(touch.clientX - dragOffset.x);
      const newY = snapToGrid(touch.clientY - dragOffset.y);
      
      setCabinets(cabinets.map(c => 
        c.id === draggingId ? { ...c, x: newX, y: newY } : c
      ));
    }
  }, [draggingId, dragOffset, snapToGrid, cabinets, rotatingCabinet, rotationStartAngle, snapAngle]);
  
  const handleTouchEnd = useCallback(() => {
    if (rotatingCabinet !== null) {
      setCabinets(cabinets.map(c => {
        if (c.id === rotatingCabinet) {
          return { ...c, rotation: currentRotation as 0 | 90 | 180 | 270 };
        }
        return c;
      }));
      setRotatingCabinet(null);
    }
    setDraggingId(null);
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
    
    // Handle drag handle movement
    if (draggingHandle) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (draggingHandle.type === 'wall-start') {
        const wall = walls.find(w => w.id === draggingHandle.id);
        if (wall) {
          const snappedX = snapToGrid(x);
          const snappedY = snapToGrid(y);
          updateWallEndpoint(wall.id, 'start', 'x', snappedX);
          updateWallEndpoint(wall.id, 'start', 'y', snappedY);
          // Add to trail
          setDragTrail(prev => [...prev, { x: snappedX, y: snappedY }]);
          // Show feedback
          setDragFeedback({
            x: e.clientX,
            y: e.clientY - 40,
            label: `X: ${Math.round(snappedX)}px, Y: ${Math.round(snappedY)}px`
          });
        }
      } else if (draggingHandle.type === 'wall-end') {
        const wall = walls.find(w => w.id === draggingHandle.id);
        if (wall) {
          const snappedX = snapToGrid(x);
          const snappedY = snapToGrid(y);
          updateWallEndpoint(wall.id, 'end', 'x', snappedX);
          updateWallEndpoint(wall.id, 'end', 'y', snappedY);
          // Add to trail
          setDragTrail(prev => [...prev, { x: snappedX, y: snappedY }]);
          // Show feedback
          setDragFeedback({
            x: e.clientX,
            y: e.clientY - 40,
            label: `X: ${Math.round(snappedX)}px, Y: ${Math.round(snappedY)}px`
          });
        }
      } else if (draggingHandle.type === 'opening') {
        const opening = openings.find(o => o.id === draggingHandle.id);
        if (opening) {
          const wall = walls.find(w => w.id === opening.wallId);
          if (wall) {
            const newPosition = getPositionOnWall({ x, y }, wall);
            updateOpeningPosition(opening.id, newPosition);
            // Calculate position on wall for trail
            const pos = getPositionOnWall({ x, y }, wall);
            const wallX = wall.x1 + (wall.x2 - wall.x1) * pos;
            const wallY = wall.y1 + (wall.y2 - wall.y1) * pos;
            setDragTrail(prev => [...prev, { x: wallX, y: wallY }]);
            // Show feedback
            const wallLength = calculateWallLength(wall);
            const distanceFromStart = Math.round(newPosition * wallLength);
            setDragFeedback({
              x: e.clientX,
              y: e.clientY - 40,
              label: `${(newPosition * 100).toFixed(0)}% (${distanceFromStart}" from start)`
            });
          }
        }
      }
      return;
    }
    
    if (draggingId === null) return;
    
    const newX = snapToGrid(e.clientX - dragOffset.x);
    const newY = snapToGrid(e.clientY - dragOffset.y);
    
    setCabinets(cabinets.map(c => 
      c.id === draggingId ? { ...c, x: newX, y: newY } : c
    ));
  }, [draggingId, dragOffset, snapToGrid, cabinets, rotatingCabinet, handleRotateMove, draggingHandle, walls, openings, updateWallEndpoint, updateOpeningPosition]);

  const handleMouseUp = useCallback(() => {
    if (rotatingCabinet !== null) {
      handleRotateEnd();
    }
    if (draggingHandle) {
      setDraggingHandle(null);
      setDragFeedback(null);
      setDragTrail([]);
      toast.success("Position updated");
    }
    setDraggingId(null);
  }, [rotatingCabinet, handleRotateEnd, draggingHandle]);
  
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
          width: drawingTool === "door" ? DEFAULTS.DOOR_WIDTH : DEFAULTS.WINDOW_WIDTH,
          height: drawingTool === "door" ? DEFAULTS.DOOR_HEIGHT : DEFAULTS.WINDOW_HEIGHT,
          yPosition: drawingTool === "door" ? DEFAULTS.DOOR_Y : DEFAULTS.WINDOW_Y,
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
    if (selectedWallId) {
      // Remove openings associated with this wall
      setOpenings(openings.filter(o => o.wallId !== selectedWallId));
      // Remove the wall
      setWalls(walls.filter(w => w.id !== selectedWallId));
      setSelectedWallId(null);
      toast.success("Wall removed");
    } else if (walls.length > 0) {
      // Delete last wall if none selected
      setWalls(walls.slice(0, -1));
      toast.success("Wall removed");
    }
  }, [walls, openings, selectedWallId]);
  
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
            <div className="w-px h-12 bg-border" />
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => {
                  undo();
                  toast.success("Undone");
                }}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Undo</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={() => {
                  redo();
                  toast.success("Redone");
                }}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Redo</span>
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
      case "templates":
        return (
          <div className="flex items-center gap-6 px-4 py-2 bg-muted/30">
            <div className="flex flex-col items-center gap-1">
              <Button 
                onClick={openSaveDialog}
                variant="ghost"
                size="sm" 
                className="h-12 w-12 flex flex-col gap-1 hover:bg-accent"
              >
                <Save className="h-5 w-5" />
              </Button>
              <span className="text-[10px]">Save Template</span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-xs text-muted-foreground">
              {templates.length} saved template{templates.length !== 1 ? 's' : ''}
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
        <div className="flex items-center h-10 md:h-12 px-1 md:px-2 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white flex-shrink-0"
          >
            FILE
          </Button>
          
          <Button
            variant={activeTab === "room-layout" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("room-layout")}
            className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm flex-shrink-0"
          >
            ROOM
          </Button>
          
          <Button
            variant={activeTab === "items" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("items")}
            className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm flex-shrink-0"
          >
            ITEMS
          </Button>
          
          <Button
            variant={activeTab === "templates" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("templates")}
            className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm flex-shrink-0"
          >
            TEMPLATES
          </Button>
          
          <Button
            variant={activeTab === "view" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("view")}
            className="h-7 md:h-8 px-2 md:px-3 text-xs md:text-sm flex-shrink-0"
          >
            VIEW
          </Button>

          <div className="flex-1 min-w-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-7 md:h-8 px-2 md:px-3 flex-shrink-0"
          >
            <Save className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Save</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 md:h-8 px-2 md:px-3 flex-shrink-0"
          >
            <Download className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Export</span>
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
          <div className="w-full md:w-64 border-r border-border bg-card flex flex-col absolute md:relative z-30 md:z-0 h-full md:h-auto">
            <div className="p-2 md:p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-xs md:text-sm">
                {activeTab === "room-layout" ? "Room Tools" : activeTab === "templates" ? "Saved Templates" : "Cabinet Library"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeftPanel(false)}
                className="h-6 w-6 md:h-7 md:w-7 p-0"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
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
                      <Label className="text-xs font-semibold mb-2 block">3D Room Scanner</Label>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => navigate('/scan')}
                        className="w-full h-auto py-3 flex items-center justify-center gap-2"
                      >
                        <Scan className="h-4 w-4" />
                        <span className="text-xs">Scan Room with Camera</span>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically measure your space with LiDAR or camera
                      </p>
                    </div>
                    
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
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                            <path
                              d="M 2 2 L 6 2 L 6 10 L 14 10 L 14 14 L 2 14 Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </svg>
                          <span className="text-xs">L-Shaped</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => createRoomLayout('u-shaped')}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                            <path
                              d="M 2 2 L 14 2 L 14 14 L 10 14 L 10 6 L 6 6 L 6 14 L 2 14 Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                            />
                          </svg>
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
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">Walls</Label>
                          {scanSourced.walls.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5">
                              <Scan className="h-2.5 w-2.5 mr-1" />
                              From Scan
                            </Badge>
                          )}
                        </div>
                        {walls.map((wall, idx) => {
                          const isFromScan = scanSourced.walls.includes(wall.id);
                          return (
                            <Card key={wall.id} className={`p-3 ${isFromScan ? 'border-blue-200 dark:border-blue-800' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">Wall #{idx + 1}</span>
                                  {isFromScan && (
                                    <Badge variant="outline" className="text-[9px] h-4 px-1">
                                      <Scan className="h-2 w-2 mr-0.5" />
                                      Scanned
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setWalls(walls.filter(w => w.id !== wall.id));
                                    setScanSourced(prev => ({
                                      ...prev,
                                      walls: prev.walls.filter(id => id !== wall.id)
                                    }));
                                    toast.success("Wall removed");
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground mb-2">
                                  Length: {calculateWallLength(wall)}"
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-[10px]">Start X</Label>
                                    <Input 
                                      type="number"
                                      value={Math.round(wall.x1)}
                                      onChange={(e) => updateWallEndpoint(wall.id, 'start', 'x', parseInt(e.target.value) || 0)}
                                      className="h-6 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[10px]">Start Y</Label>
                                    <Input 
                                      type="number"
                                      value={Math.round(wall.y1)}
                                      onChange={(e) => updateWallEndpoint(wall.id, 'start', 'y', parseInt(e.target.value) || 0)}
                                      className="h-6 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[10px]">End X</Label>
                                    <Input 
                                      type="number"
                                      value={Math.round(wall.x2)}
                                      onChange={(e) => updateWallEndpoint(wall.id, 'end', 'x', parseInt(e.target.value) || 0)}
                                      className="h-6 text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[10px]">End Y</Label>
                                    <Input 
                                      type="number"
                                      value={Math.round(wall.y2)}
                                      onChange={(e) => updateWallEndpoint(wall.id, 'end', 'y', parseInt(e.target.value) || 0)}
                                      className="h-6 text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    
                    {openings.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">Openings</Label>
                          {scanSourced.openings.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5">
                              <Scan className="h-2.5 w-2.5 mr-1" />
                              From Scan
                            </Badge>
                          )}
                        </div>
                        {openings.map((opening) => {
                          const isFromScan = scanSourced.openings.includes(opening.id);
                          return (
                            <Card key={opening.id} className={`p-3 ${isFromScan ? 'border-blue-200 dark:border-blue-800' : ''}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium capitalize">{opening.type}</span>
                                  {isFromScan && (
                                    <Badge variant="outline" className="text-[9px] h-4 px-1">
                                      <Scan className="h-2 w-2 mr-0.5" />
                                      Scanned
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setOpenings(openings.filter(o => o.id !== opening.id));
                                    setScanSourced(prev => ({
                                      ...prev,
                                      openings: prev.openings.filter(id => id !== opening.id)
                                    }));
                                    toast.success("Opening removed");
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-[10px]">Position on Wall (0-1)</Label>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="1"
                                      step="0.1"
                                      value={opening.position}
                                      onChange={(e) => {
                                        const newPos = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                                        setOpenings(openings.map(o => 
                                          o.id === opening.id ? { ...o, position: newPos } : o
                                        ));
                                      }}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">
                                    0 = start, 0.5 = center, 1 = end
                                  </p>
                                </div>
                                
                                <div>
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
                                
                                <div>
                                  <Label className="text-[10px]">Height (inches)</Label>
                                  <Input 
                                    type="number"
                                    value={opening.height}
                                    onChange={(e) => {
                                      const newHeight = Math.max(12, Math.min(96, parseInt(e.target.value) || 30));
                                      setOpenings(openings.map(o => 
                                        o.id === opening.id ? { ...o, height: newHeight } : o
                                      ));
                                    }}
                                    className="h-7 text-xs"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-[10px]">Height from Floor (inches)</Label>
                                  <Input 
                                    type="number"
                                    value={opening.yPosition}
                                    onChange={(e) => {
                                      const newY = Math.max(0, Math.min(84, parseInt(e.target.value) || 0));
                                      setOpenings(openings.map(o => 
                                        o.id === opening.id ? { ...o, yPosition: newY } : o
                                      ));
                                    }}
                                    className="h-7 text-xs"
                                  />
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : activeTab === "templates" ? (
                <>
                  {templates.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <div>
                        <p className="text-sm font-medium">No templates saved</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a room layout, then save it as a template for later use.
                        </p>
                      </div>
                      <Button onClick={openSaveDialog} size="sm" className="mt-2">
                        <Save className="h-4 w-4 mr-2" />
                        Save Current Layout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <Card key={template.id} className="p-3 hover:bg-accent/50 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{template.name}</h4>
                                {template.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {template.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Minus className="h-3 w-3" />
                                <span>{template.walls.length}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DoorOpen className="h-3 w-3" />
                                <span>{template.openings.length}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Box className="h-3 w-3" />
                                <span>{template.cabinets.length}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={() => handleLoadTemplate(template.id)}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Load
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => duplicateTemplate(template.id)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-[10px] text-muted-foreground">
                              Saved {new Date(template.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Cabinet Properties Panel when one is selected */}
                  {selectedCabinetId && cabinets.find(c => c.id === selectedCabinetId) && (
                    <Card className="p-3 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-xs font-semibold">Cabinet Properties</Label>
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
                          <div className="space-y-3">
                            {/* Basic Info */}
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
                            
                            {/* Dimensions */}
                            <div>
                              <Label className="text-[10px] font-semibold mb-2 block">Dimensions</Label>
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
                            </div>
                            
                            {/* Rotation */}
                            <div>
                              <Label className="text-[10px]">Rotation (degrees)</Label>
                              <div className="flex gap-2">
                                <Input 
                                  type="number"
                                  value={cabinet.rotation || 0}
                                  onChange={(e) => {
                                    const newRotation = parseInt(e.target.value) % 360;
                                    setCabinets(cabinets.map(c => 
                                      c.id === selectedCabinetId ? { ...c, rotation: newRotation as 0 | 90 | 180 | 270 } : c
                                    ));
                                  }}
                                  className="h-7 text-xs flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => {
                                    const currentRot = cabinet.rotation || 0;
                                    const newRot = (currentRot + 90) % 360;
                                    setCabinets(cabinets.map(c => 
                                      c.id === selectedCabinetId ? { ...c, rotation: newRot as 0 | 90 | 180 | 270 } : c
                                    ));
                                  }}
                                >
                                  <RotateCw className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Door Style */}
                            <div>
                              <Label className="text-[10px]">Door Style</Label>
                              <select
                                value={cabinet.doorStyleId || "flat"}
                                onChange={(e) => {
                                  const doorStyle = DOOR_STYLES.find(d => d.id === e.target.value);
                                  setCabinets(cabinets.map(c => 
                                    c.id === selectedCabinetId 
                                      ? { ...c, doorStyleId: e.target.value } 
                                      : c
                                  ));
                                }}
                                className="w-full h-7 text-xs border rounded-md px-2 bg-background"
                              >
                                {DOOR_STYLES.map(style => (
                                  <option key={style.id} value={style.id}>
                                    {style.name}
                                  </option>
                                ))}
                              </select>
                              <p className="text-[9px] text-muted-foreground mt-1">
                                {DOOR_STYLES.find(d => d.id === (cabinet.doorStyleId || "flat"))?.description}
                              </p>
                            </div>
                            
                            {/* Finish */}
                            <div>
                              <Label className="text-[10px]">Finish</Label>
                              <select
                                value={cabinet.finishId || "bright-white"}
                                onChange={(e) => {
                                  const finish = MATERIAL_FINISHES.find(f => f.id === e.target.value);
                                  setCabinets(cabinets.map(c => 
                                    c.id === selectedCabinetId 
                                      ? { 
                                          ...c, 
                                          finishId: e.target.value,
                                          finish: finish?.name || "White",
                                          brand: finish?.brand || "Tafisa"
                                        } 
                                      : c
                                  ));
                                }}
                                className="w-full h-7 text-xs border rounded-md px-2 bg-background"
                              >
                                <optgroup label="Tafisa">
                                  {MATERIAL_FINISHES.filter(f => f.brand === "Tafisa").map(finish => (
                                    <option key={finish.id} value={finish.id}>{finish.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Egger">
                                  {MATERIAL_FINISHES.filter(f => f.brand === "Egger").map(finish => (
                                    <option key={finish.id} value={finish.id}>{finish.name}</option>
                                  ))}
                                </optgroup>
                                <optgroup label="Shinnoki">
                                  {MATERIAL_FINISHES.filter(f => f.brand === "Shinnoki").map(finish => (
                                    <option key={finish.id} value={finish.id}>{finish.name}</option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                            
                            {/* Hardware */}
                            <div>
                              <Label className="text-[10px] font-semibold mb-2 block">Hardware</Label>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-[10px]">Handle Type</Label>
                                  <select
                                    value={cabinet.handleType || "bar"}
                                    onChange={(e) => {
                                      setCabinets(cabinets.map(c => 
                                        c.id === selectedCabinetId 
                                          ? { ...c, handleType: e.target.value as keyof typeof HARDWARE_OPTIONS.handles } 
                                          : c
                                      ));
                                    }}
                                    className="w-full h-7 text-xs border rounded-md px-2 bg-background"
                                  >
                                    {Object.entries(HARDWARE_OPTIONS.handles).map(([key, handle]) => (
                                      <option key={key} value={key}>{handle.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[10px]">Number of Handles</Label>
                                  <Input 
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={cabinet.numHandles || 2}
                                    onChange={(e) => {
                                      setCabinets(cabinets.map(c => 
                                        c.id === selectedCabinetId 
                                          ? { ...c, numHandles: parseInt(e.target.value) || 2 } 
                                          : c
                                      ));
                                    }}
                                    className="h-7 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Drawer Configuration */}
                            <div>
                              <Label className="text-[10px] font-semibold mb-2 block">Drawer Configuration</Label>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={cabinet.hasDrawers || false}
                                    onChange={(e) => {
                                      setCabinets(cabinets.map(c => 
                                        c.id === selectedCabinetId 
                                          ? { ...c, hasDrawers: e.target.checked } 
                                          : c
                                      ));
                                    }}
                                    className="h-3 w-3"
                                  />
                                  <Label className="text-[10px]">Has Drawers</Label>
                                </div>
                                {cabinet.hasDrawers && (
                                  <div>
                                    <Label className="text-[10px]">Number of Drawers</Label>
                                    <Input 
                                      type="number"
                                      min={1}
                                      max={6}
                                      value={cabinet.numDrawers || 3}
                                      onChange={(e) => {
                                        setCabinets(cabinets.map(c => 
                                          c.id === selectedCabinetId 
                                            ? { ...c, numDrawers: parseInt(e.target.value) || 3 } 
                                            : c
                                        ));
                                      }}
                                      className="h-7 text-xs"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {cabinet.price && (
                              <div className="pt-2 border-t text-xs">
                                <span className="font-medium">Estimated Price: </span>
                                <span className="text-primary font-semibold">{formatPrice(cabinet.price)}</span>
                              </div>
                            )}
                            
                            <div className="pt-1 text-[10px] text-muted-foreground border-t">
                              💡 Shift+Drag to rotate<br/>
                              📱 Two-finger touch to rotate
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
                      {CABINET_LIBRARY.filter(c => c.type === "Corner Cabinet").map((template, idx) => {
                        const isLShape = template.label?.startsWith("LSB") || template.label?.startsWith("LSW");
                        const isUShape = template.label?.startsWith("USB");
                        const isDiagonal = template.label?.startsWith("DCB") || template.label?.startsWith("DCW");
                        const isLazySusan = template.label?.startsWith("LSBC") || template.label?.startsWith("LSWC");
                        
                        return (
                          <Card
                            key={idx}
                            className="p-2 cursor-move hover:bg-accent/50 transition-colors"
                            draggable
                            onDragStart={() => handleLibraryDragStart(template)}
                          >
                            <div className="flex items-center gap-2">
                              {/* Shape Icon Preview */}
                              <div className="flex-shrink-0 w-8 h-8 border border-border rounded">
                                <svg width="100%" height="100%" viewBox="0 0 32 32">
                                  {isLShape && (
                                    <path
                                      d="M 2 2 L 13 2 L 13 19 L 30 19 L 30 30 L 2 30 Z"
                                      fill="hsl(var(--muted))"
                                      stroke="hsl(var(--foreground))"
                                      strokeWidth="1.5"
                                    />
                                  )}
                                  {isUShape && (
                                    <path
                                      d="M 2 2 L 30 2 L 30 30 L 20 30 L 20 12 L 12 12 L 12 30 L 2 30 Z"
                                      fill="hsl(var(--muted))"
                                      stroke="hsl(var(--foreground))"
                                      strokeWidth="1.5"
                                    />
                                  )}
                                  {isDiagonal && (
                                    <path
                                      d="M 2 2 L 30 2 L 30 30 Z"
                                      fill="hsl(var(--muted))"
                                      stroke="hsl(var(--foreground))"
                                      strokeWidth="1.5"
                                    />
                                  )}
                                  {isLazySusan && (
                                    <>
                                      <circle
                                        cx="16"
                                        cy="16"
                                        r="12"
                                        fill="hsl(var(--muted))"
                                        stroke="hsl(var(--foreground))"
                                        strokeWidth="1.5"
                                      />
                                      <line x1="16" y1="16" x2="16" y2="6" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
                                      <line x1="16" y1="16" x2="26" y2="16" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
                                    </>
                                  )}
                                </svg>
                              </div>
                              
                              {/* Label and Description */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{template.label}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                              </div>
                              
                              {/* Width */}
                              <div className="text-[10px] text-muted-foreground flex-shrink-0">
                                {template.width}"W
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Moldings */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">MOLDINGS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.category === "Moldings").map((template, idx) => (
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
                              {template.width}"L
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Fillers */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">FILLERS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.category === "Fillers").map((template, idx) => (
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
                              {template.width}" × {template.height}"
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Panels */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">PANELS</h4>
                    <div className="space-y-1">
                      {CABINET_LIBRARY.filter(c => c.category === "Panels").map((template, idx) => (
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
                              {template.width}" × {template.height}"
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
              className="flex-1 bg-white relative overflow-auto touch-none"
              onMouseMove={(e) => {
                handleMouseMove(e);
                handleCanvasMouseMove(e);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleCanvasClick}
              onDrop={handleCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{ 
                cursor: drawingTool === "wall" ? "crosshair" : draggingFromLibrary ? "copy" : "default",
                minHeight: '600px'
              }}
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

              {/* Walls with openings and context menus */}
              {walls.map(wall => {
                const length = calculateWallLength(wall);
                const wallOpenings = openings.filter(o => o.wallId === wall.id);
                const midX = (wall.x1 + wall.x2) / 2;
                const midY = (wall.y1 + wall.y2) / 2;
                
                return (
                  <ContextMenu key={`wall-ctx-${wall.id}`}>
                    <ContextMenuTrigger>
                      <div
                        style={{
                          position: 'absolute',
                          left: Math.min(wall.x1, wall.x2) - 10,
                          top: Math.min(wall.y1, wall.y2) - 10,
                          width: Math.abs(wall.x2 - wall.x1) + 20,
                          height: Math.abs(wall.y2 - wall.y1) + 20,
                          cursor: 'pointer',
                          zIndex: 1
                        }}
                        onClick={() => setSelectedWallId(wall.id)}
                      />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => {
                        setSelectedWallId(wall.id);
                        setDrawingTool("door");
                        toast.info("Click on wall to add door");
                      }}>
                        <DoorOpen className="mr-2 h-4 w-4" />
                        Add Door
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => {
                        setSelectedWallId(wall.id);
                        setDrawingTool("window");
                        toast.info("Click on wall to add window");
                      }}>
                        <RectangleHorizontal className="mr-2 h-4 w-4" />
                        Add Window
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => {
                          setSelectedWallId(wall.id);
                          deleteSelectedWall();
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Wall
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
              
              {/* SVG walls rendering */}
              <svg 
                ref={svgCanvasRef}
                className="absolute inset-0" 
                style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
              >
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
                          stroke={selectedWallId === wall.id ? "#FF8C00" : "#1F2937"}
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
                
                {/* Drag handles for wall endpoints */}
                {walls.map(wall => (
                  <g key={`handles-${wall.id}`}>
                    {/* Start point handle */}
                    <circle
                      cx={wall.x1}
                      cy={wall.y1}
                      r="8"
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      style={{ 
                        cursor: 'grab',
                        pointerEvents: 'auto'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle({ type: 'wall-start', id: wall.id });
                      }}
                    />
                    <circle
                      cx={wall.x1}
                      cy={wall.y1}
                      r="3"
                      fill="#3B82F6"
                      style={{ pointerEvents: 'none' }}
                    />
                    
                    {/* End point handle */}
                    <circle
                      cx={wall.x2}
                      cy={wall.y2}
                      r="8"
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      style={{ 
                        cursor: 'grab',
                        pointerEvents: 'auto'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle({ type: 'wall-end', id: wall.id });
                      }}
                    />
                    <circle
                      cx={wall.x2}
                      cy={wall.y2}
                      r="3"
                      fill="#3B82F6"
                      style={{ pointerEvents: 'none' }}
                    />
                  </g>
                ))}
                
                {/* Drag handles for openings */}
                {openings.map(opening => {
                  const wall = walls.find(w => w.id === opening.wallId);
                  if (!wall) return null;
                  
                  const handleX = wall.x1 + (wall.x2 - wall.x1) * opening.position;
                  const handleY = wall.y1 + (wall.y2 - wall.y1) * opening.position;
                  
                  return (
                    <g key={`opening-handle-${opening.id}`}>
                      <circle
                        cx={handleX}
                        cy={handleY}
                        r="10"
                        fill="white"
                        stroke={opening.type === 'door' ? "#F59E0B" : "#10B981"}
                        strokeWidth="2"
                        style={{ 
                          cursor: 'grab',
                          pointerEvents: 'auto'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingHandle({ type: 'opening', id: opening.id });
                        }}
                      />
                      <text
                        x={handleX}
                        y={handleY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill={opening.type === 'door' ? "#F59E0B" : "#10B981"}
                        style={{ pointerEvents: 'none', fontWeight: 'bold' }}
                      >
                        {opening.type === 'door' ? 'D' : 'W'}
                      </text>
                    </g>
                  );
                })}
                
                {/* Drag trail visualization */}
                {dragTrail.length > 1 && (
                  <g>
                    <defs>
                      <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    {/* Draw trail as connected line segments */}
                    <polyline
                      points={dragTrail.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="url(#trailGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                    {/* Draw dots at each trail point */}
                    {dragTrail.map((point, idx) => (
                      <circle
                        key={idx}
                        cx={point.x}
                        cy={point.y}
                        r={2}
                        fill="rgb(59 130 246)"
                        opacity={0.3 + (idx / dragTrail.length) * 0.5}
                      />
                    ))}
                  </g>
                )}
              </svg>
              
              {/* Drag feedback tooltip */}
              {dragFeedback && (
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{
                    left: dragFeedback.x,
                    top: dragFeedback.y,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg">
                    {dragFeedback.label}
                  </div>
                  {/* Arrow pointing down */}
                  <div 
                    className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid rgb(37 99 235)'
                    }}
                  />
                </div>
              )}
              
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
                  <ContextMenu key={opening.id}>
                    <ContextMenuTrigger>
                      <div
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
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {opening.type === "door" ? "Door" : "Window"} Properties
                      </div>
                      <ContextMenuSeparator />
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Maximize2 className="mr-2 h-4 w-4" />
                          Width
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {[24, 30, 36, 42, 48, 60, 72].map(w => (
                            <ContextMenuItem 
                              key={w}
                              onClick={() => {
                                setOpenings(openings.map(o => 
                                  o.id === opening.id ? { ...o, width: w } : o
                                ));
                              }}
                            >
                              {w}" {opening.width === w && "✓"}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Maximize2 className="mr-2 h-4 w-4" />
                          Height
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {opening.type === "door" 
                            ? [78, 80, 84, 90, 96].map(h => (
                                <ContextMenuItem 
                                  key={h}
                                  onClick={() => {
                                    setOpenings(openings.map(o => 
                                      o.id === opening.id ? { ...o, height: h } : o
                                    ));
                                  }}
                                >
                                  {h}" {opening.height === h && "✓"}
                                </ContextMenuItem>
                              ))
                            : [24, 30, 36, 42, 48].map(h => (
                                <ContextMenuItem 
                                  key={h}
                                  onClick={() => {
                                    setOpenings(openings.map(o => 
                                      o.id === opening.id ? { ...o, height: h } : o
                                    ));
                                  }}
                                >
                                  {h}" {opening.height === h && "✓"}
                                </ContextMenuItem>
                              ))
                          }
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Height from Floor
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {opening.type === "door"
                            ? [0].map(y => (
                                <ContextMenuItem 
                                  key={y}
                                  onClick={() => {
                                    setOpenings(openings.map(o => 
                                      o.id === opening.id ? { ...o, yPosition: y } : o
                                    ));
                                  }}
                                >
                                  {y}" (Floor level) {opening.yPosition === y && "✓"}
                                </ContextMenuItem>
                              ))
                            : [0, 24, 36, 42, 48, 54].map(y => (
                                <ContextMenuItem 
                                  key={y}
                                  onClick={() => {
                                    setOpenings(openings.map(o => 
                                      o.id === opening.id ? { ...o, yPosition: y } : o
                                    ));
                                  }}
                                >
                                  {y}" {opening.yPosition === y && "✓"}
                                </ContextMenuItem>
                              ))
                          }
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      
                      <ContextMenuSeparator />
                      
                      <ContextMenuItem 
                        onClick={() => {
                          setOpenings(openings.filter(o => o.id !== opening.id));
                          setSelectedOpeningId(null);
                          toast.success(`${opening.type === "door" ? "Door" : "Window"} removed`);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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
                const isLShaped = cabinet.type === "Corner Cabinet" && (cabinet.label?.startsWith("LSB") || cabinet.label?.startsWith("LSW"));
                const isUShaped = cabinet.type === "Corner Cabinet" && cabinet.label?.startsWith("USB");
                const isDiagonal = cabinet.type === "Corner Cabinet" && (cabinet.label?.startsWith("DCB") || cabinet.label?.startsWith("DCW"));
                const isLazySusan = cabinet.type === "Corner Cabinet" && (cabinet.label?.startsWith("LSBC") || cabinet.label?.startsWith("LSWC"));
                const isPeninsula = cabinet.label?.startsWith("PEN");
                const hasCollision = cabinetCollisions.has(cabinet.id);
                const collisionTypes = cabinetCollisions.get(cabinet.id) || [];
                
                return (
                  <ContextMenu key={cabinet.id}>
                    <ContextMenuTrigger>
                      <div
                        className={`absolute transition-all group ${
                          selectedCabinetId === cabinet.id 
                            ? "shadow-lg z-10" 
                            : "hover:shadow-md"
                        } ${rotatingCabinet === cabinet.id ? "cursor-grabbing" : "cursor-move"} touch-none`}
                        style={{
                          left: cabinet.x,
                          top: cabinet.y,
                          width: rotation === 90 || rotation === 270 ? depthPx : widthPx,
                          height: rotation === 90 || rotation === 270 ? widthPx : depthPx,
                          transform: `rotate(${rotatingCabinet === cabinet.id ? currentRotation : rotation}deg)`,
                          transformOrigin: 'center'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, cabinet.id)}
                        onTouchStart={(e) => handleTouchStart(e, cabinet.id)}
                      >
                        {/* Collision warning indicator */}
                        {hasCollision && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-[9px] font-medium whitespace-nowrap shadow-lg animate-pulse">
                            ⚠️ Collision
                          </div>
                        )}
                        {/* L-Shape rendering */}
                        {isLShaped && (
                          <svg 
                            width="100%" 
                            height="100%" 
                            style={{ position: 'absolute', inset: 0 }}
                          >
                            <path
                              d={`M 0 0 L ${widthPx * 0.4} 0 L ${widthPx * 0.4} ${depthPx * 0.6} L ${widthPx} ${depthPx * 0.6} L ${widthPx} ${depthPx} L 0 ${depthPx} Z`}
                              fill={hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6')}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth={hasCollision ? 3 : (selectedCabinetId === cabinet.id ? 2 : 1)}
                            />
                          </svg>
                        )}
                        
                        {/* U-Shape rendering */}
                        {isUShaped && (
                          <svg 
                            width="100%" 
                            height="100%" 
                            style={{ position: 'absolute', inset: 0 }}
                          >
                            <path
                              d={`M 0 0 L ${widthPx} 0 L ${widthPx} ${depthPx} L ${widthPx * 0.7} ${depthPx} L ${widthPx * 0.7} ${depthPx * 0.3} L ${widthPx * 0.3} ${depthPx * 0.3} L ${widthPx * 0.3} ${depthPx} L 0 ${depthPx} Z`}
                              fill={hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6')}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth={hasCollision ? 3 : (selectedCabinetId === cabinet.id ? 2 : 1)}
                            />
                          </svg>
                        )}
                        
                        {/* Diagonal 45° Shape rendering */}
                        {isDiagonal && (
                          <svg 
                            width="100%" 
                            height="100%" 
                            style={{ position: 'absolute', inset: 0 }}
                          >
                            <path
                              d={`M 0 0 L ${widthPx} 0 L ${widthPx} ${depthPx} L 0 0 Z`}
                              fill={hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6')}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth={hasCollision ? 3 : (selectedCabinetId === cabinet.id ? 2 : 1)}
                            />
                          </svg>
                        )}
                        
                        {/* Lazy Susan (Circular) rendering */}
                        {isLazySusan && (
                          <svg 
                            width="100%" 
                            height="100%" 
                            style={{ position: 'absolute', inset: 0 }}
                          >
                            <circle
                              cx={widthPx / 2}
                              cy={depthPx / 2}
                              r={Math.min(widthPx, depthPx) / 2 - 2}
                              fill={hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6')}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth={hasCollision ? 3 : (selectedCabinetId === cabinet.id ? 2 : 1)}
                            />
                            {/* Rotating indicator lines */}
                            <line
                              x1={widthPx / 2}
                              y1={depthPx / 2}
                              x2={widthPx / 2}
                              y2={4}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth="1"
                              opacity="0.5"
                            />
                            <line
                              x1={widthPx / 2}
                              y1={depthPx / 2}
                              x2={widthPx - 4}
                              y2={depthPx / 2}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth="1"
                              opacity="0.5"
                            />
                          </svg>
                        )}
                        
                        {/* Peninsula rendering - extended with end panel indicator */}
                        {isPeninsula && (
                          <svg 
                            width="100%" 
                            height="100%" 
                            style={{ position: 'absolute', inset: 0 }}
                          >
                            {/* Main cabinet body */}
                            <rect
                              x="0"
                              y="0"
                              width={widthPx}
                              height={depthPx}
                              fill={hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6')}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                              strokeWidth={hasCollision ? 3 : (selectedCabinetId === cabinet.id ? 2 : 1)}
                            />
                            {/* End panel indicator (thicker line on one end) */}
                            <line
                              x1={widthPx}
                              y1="0"
                              x2={widthPx}
                              y2={depthPx}
                              stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#6B7280')}
                              strokeWidth="4"
                            />
                            {/* Divider lines to show multiple cabinets */}
                            {Array.from({ length: Math.floor(cabinet.width / 24) - 1 }).map((_, i) => {
                              const xPos = ((i + 1) * 24 * 2);
                              return (
                                <line
                                  key={i}
                                  x1={xPos}
                                  y1="0"
                                  x2={xPos}
                                  y2={depthPx}
                                  stroke={hasCollision ? '#DC2626' : (selectedCabinetId === cabinet.id ? '#FF8C00' : '#9CA3AF')}
                                  strokeWidth="1"
                                  strokeDasharray="4,4"
                                  opacity="0.4"
                                />
                              );
                            })}
                          </svg>
                        )}
                        
                        {/* Standard rectangle for non-corner/non-peninsula cabinets */}
                        {!isLShaped && !isUShaped && !isDiagonal && !isLazySusan && !isPeninsula && (
                          <div 
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: hasCollision ? '#FEE2E2' : (selectedCabinetId === cabinet.id ? '#FFE5CC' : '#F3F4F6'),
                              border: hasCollision ? '3px solid #DC2626' : (selectedCabinetId === cabinet.id ? '2px solid #FF8C00' : '1px solid #9CA3AF'),
                            }}
                          />
                        )}
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
                {cabinetCollisions.size > 0 && (
                  <div className="text-destructive font-medium mt-1 flex items-center gap-1">
                    ⚠️ Collisions: {cabinetCollisions.size}
                  </div>
                )}
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
      
      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Room Template</DialogTitle>
            <DialogDescription>
              Save your current room layout as a reusable template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., L-Shaped Kitchen with Island"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && templateName.trim()) {
                    handleSaveTemplate();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                placeholder="Add notes about this layout..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-md text-sm">
              <div className="text-center">
                <div className="font-semibold">{walls.length}</div>
                <div className="text-xs text-muted-foreground">Walls</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{openings.length}</div>
                <div className="text-xs text-muted-foreground">Openings</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{cabinets.length}</div>
                <div className="text-xs text-muted-foreground">Cabinets</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Timeline */}
      <HistoryTimeline
        history={historyThumbnails}
        currentIndex={historyIndex}
        onSelectState={jumpToHistoryState}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );
};

export default VanityDesigner;