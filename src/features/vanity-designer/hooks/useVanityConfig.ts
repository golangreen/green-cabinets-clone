import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { VanityConfig, VanityDimensions } from "@/types/vanity";
import { inchesWithFractionToDecimal } from "../services/vanityPricingService";
import { decodeShareableURL } from "../services/shareService";
import { roomScanner } from "@/features/room-scanner/utils/roomScanner";

export interface UseVanityConfigReturn {
  // Brand & Finish
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedFinish: string;
  setSelectedFinish: (finish: string) => void;
  
  // Dimensions (whole inches)
  width: string;
  setWidth: (width: string) => void;
  height: string;
  setHeight: (height: string) => void;
  depth: string;
  setDepth: (depth: string) => void;
  
  // Dimensions (fractions in sixteenths)
  widthFraction: string;
  setWidthFraction: (fraction: string) => void;
  heightFraction: string;
  setHeightFraction: (fraction: string) => void;
  depthFraction: string;
  setDepthFraction: (fraction: string) => void;
  
  // Location
  zipCode: string;
  setZipCode: (zipCode: string) => void;
  state: string;
  setState: (state: string) => void;
  
  // Cabinet Configuration
  doorStyle: string;
  setDoorStyle: (style: string) => void;
  numDrawers: number;
  setNumDrawers: (drawers: number) => void;
  handleStyle: string;
  setHandleStyle: (style: string) => void;
  cabinetPosition: string;
  setCabinetPosition: (position: string) => void;
  
  // Wall Configuration
  includeWalls: boolean;
  setIncludeWalls: (include: boolean) => void;
  wallWidth: string;
  setWallWidth: (width: string) => void;
  wallHeight: string;
  setWallHeight: (height: string) => void;
  hasWindow: boolean;
  setHasWindow: (has: boolean) => void;
  hasDoor: boolean;
  setHasDoor: (has: boolean) => void;
  hasMedicineCabinet: boolean;
  setHasMedicineCabinet: (has: boolean) => void;
  medicineCabinetDoorType: string;
  setMedicineCabinetDoorType: (type: string) => void;
  
  // Room & Floor Configuration
  includeRoom: boolean;
  setIncludeRoom: (include: boolean) => void;
  roomLength: string;
  setRoomLength: (length: string) => void;
  roomWidth: string;
  setRoomWidth: (width: string) => void;
  floorType: string;
  setFloorType: (type: string) => void;
  tileColor: string;
  setTileColor: (color: string) => void;
  woodFloorFinish: string;
  setWoodFloorFinish: (finish: string) => void;
  
  // Lighting Configuration
  lightingType: string;
  setLightingType: (type: string) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  colorTemperature: number;
  setColorTemperature: (temp: number) => void;
  
  // Bathroom Fixtures
  includeToilet: boolean;
  setIncludeToilet: (include: boolean) => void;
  toiletStyle: 'modern' | 'traditional' | 'wall-mounted';
  setToiletStyle: (style: 'modern' | 'traditional' | 'wall-mounted') => void;
  toiletPosition: 'left' | 'right';
  setToiletPosition: (position: 'left' | 'right') => void;
  includeShower: boolean;
  setIncludeShower: (include: boolean) => void;
  showerStyle: 'walk-in' | 'enclosed' | 'corner';
  setShowerStyle: (style: 'walk-in' | 'enclosed' | 'corner') => void;
  includeBathtub: boolean;
  setIncludeBathtub: (include: boolean) => void;
  bathtubStyle: 'freestanding' | 'alcove' | 'corner';
  setBathtubStyle: (style: 'freestanding' | 'alcove' | 'corner') => void;
  bathtubPosition: 'left' | 'right' | 'back';
  setBathtubPosition: (position: 'left' | 'right' | 'back') => void;
  
  // Wall Finish
  wallFinishType: 'paint' | 'tile';
  setWallFinishType: (type: 'paint' | 'tile') => void;
  wallPaintColor: string;
  setWallPaintColor: (color: string) => void;
  wallTileColor: string;
  setWallTileColor: (color: string) => void;
  
  // Mirror and Medicine Cabinet
  includeMirror: boolean;
  setIncludeMirror: (include: boolean) => void;
  mirrorType: 'mirror' | 'medicine-cabinet';
  setMirrorType: (type: 'mirror' | 'medicine-cabinet') => void;
  mirrorSize: 'small' | 'medium' | 'large';
  setMirrorSize: (size: 'small' | 'medium' | 'large') => void;
  mirrorShape: 'rectangular' | 'round' | 'oval' | 'arched';
  setMirrorShape: (shape: 'rectangular' | 'round' | 'oval' | 'arched') => void;
  mirrorFrame: 'none' | 'black' | 'chrome' | 'gold' | 'wood';
  setMirrorFrame: (frame: 'none' | 'black' | 'chrome' | 'gold' | 'wood') => void;
  
  // Bathroom Accessories
  includeTowelBar: boolean;
  setIncludeTowelBar: (include: boolean) => void;
  towelBarPosition: 'left' | 'right' | 'center';
  setTowelBarPosition: (position: 'left' | 'right' | 'center') => void;
  includeToiletPaperHolder: boolean;
  setIncludeToiletPaperHolder: (include: boolean) => void;
  includeRobeHooks: boolean;
  setIncludeRobeHooks: (include: boolean) => void;
  robeHookCount: number;
  setRobeHookCount: (count: number) => void;
  includeShelving: boolean;
  setIncludeShelving: (include: boolean) => void;
  shelvingType: 'floating' | 'corner' | 'ladder';
  setShelvingType: (type: 'floating' | 'corner' | 'ladder') => void;
  
  // Faucet and Fixtures
  includeFaucet: boolean;
  setIncludeFaucet: (include: boolean) => void;
  faucetStyle: 'modern' | 'traditional' | 'waterfall';
  setFaucetStyle: (style: 'modern' | 'traditional' | 'waterfall') => void;
  faucetFinish: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold';
  setFaucetFinish: (finish: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold') => void;
  
  // Countertop
  countertopMaterial: 'marble' | 'quartz' | 'granite';
  setCountertopMaterial: (material: 'marble' | 'quartz' | 'granite') => void;
  countertopEdge: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  setCountertopEdge: (edge: 'straight' | 'beveled' | 'bullnose' | 'waterfall') => void;
  countertopColor: string;
  setCountertopColor: (color: string) => void;
  
  // Sink
  sinkStyle: 'undermount' | 'vessel' | 'integrated';
  setSinkStyle: (style: 'undermount' | 'vessel' | 'integrated') => void;
  sinkShape: 'oval' | 'rectangular' | 'square';
  setSinkShape: (shape: 'oval' | 'rectangular' | 'square') => void;
  
  // Backsplash
  includeBacksplash: boolean;
  setIncludeBacksplash: (include: boolean) => void;
  backsplashMaterial: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone';
  setBacksplashMaterial: (material: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone') => void;
  backsplashHeight: '4-inch' | 'full-height';
  setBacksplashHeight: (height: '4-inch' | 'full-height') => void;
  
  // Vanity Lighting
  includeVanityLighting: boolean;
  setIncludeVanityLighting: (include: boolean) => void;
  vanityLightingStyle: 'sconce' | 'led-strip' | 'pendant';
  setVanityLightingStyle: (style: 'sconce' | 'led-strip' | 'pendant') => void;
  vanityLightBrightness: number;
  setVanityLightBrightness: (brightness: number) => void;
  vanityLightTemp: number;
  setVanityLightTemp: (temp: number) => void;
  
  // Computed values
  dimensionsInInches: {
    width: number;
    height: number;
    depth: number;
  };
  
  // Actions
  loadScannedMeasurements: () => void;
  applyTemplateConfig: (config: any) => void;
}

export const useVanityConfig = (): UseVanityConfigReturn => {
  // Brand & Finish
  const [selectedBrand, setSelectedBrand] = useState<string>("Tafisa");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  
  // Dimensions (whole inches)
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [depth, setDepth] = useState<string>("");
  
  // Dimensions (fractions in sixteenths)
  const [widthFraction, setWidthFraction] = useState<string>("0");
  const [heightFraction, setHeightFraction] = useState<string>("0");
  const [depthFraction, setDepthFraction] = useState<string>("0");
  
  // Location
  const [zipCode, setZipCode] = useState<string>("");
  const [state, setState] = useState<string>("");
  
  // Cabinet Configuration
  const [doorStyle, setDoorStyle] = useState<string>("double");
  const [numDrawers, setNumDrawers] = useState<number>(2);
  const [handleStyle, setHandleStyle] = useState<string>("bar");
  const [cabinetPosition, setCabinetPosition] = useState<string>("left");
  
  // Wall Configuration
  const [includeWalls, setIncludeWalls] = useState(false);
  const [wallWidth, setWallWidth] = useState<string>("");
  const [wallHeight, setWallHeight] = useState<string>("");
  const [hasWindow, setHasWindow] = useState(false);
  const [hasDoor, setHasDoor] = useState(false);
  const [hasMedicineCabinet, setHasMedicineCabinet] = useState(false);
  const [medicineCabinetDoorType, setMedicineCabinetDoorType] = useState<string>("mirror");
  
  // Room & Floor Configuration
  const [includeRoom, setIncludeRoom] = useState(false);
  const [roomLength, setRoomLength] = useState<string>("");
  const [roomWidth, setRoomWidth] = useState<string>("");
  const [floorType, setFloorType] = useState<string>("tile");
  const [tileColor, setTileColor] = useState<string>("white-marble");
  const [woodFloorFinish, setWoodFloorFinish] = useState<string>("natural-oak");
  
  // Lighting Configuration
  const [lightingType, setLightingType] = useState<string>("recessed");
  const [brightness, setBrightness] = useState<number>(80);
  const [colorTemperature, setColorTemperature] = useState<number>(4000);
  
  // Bathroom Fixtures
  const [includeToilet, setIncludeToilet] = useState(false);
  const [toiletStyle, setToiletStyle] = useState<'modern' | 'traditional' | 'wall-mounted'>('modern');
  const [toiletPosition, setToiletPosition] = useState<'left' | 'right'>('left');
  const [includeShower, setIncludeShower] = useState(false);
  const [showerStyle, setShowerStyle] = useState<'walk-in' | 'enclosed' | 'corner'>('walk-in');
  const [includeBathtub, setIncludeBathtub] = useState(false);
  const [bathtubStyle, setBathtubStyle] = useState<'freestanding' | 'alcove' | 'corner'>('freestanding');
  const [bathtubPosition, setBathtubPosition] = useState<'left' | 'right' | 'back'>('back');
  
  // Wall Finish
  const [wallFinishType, setWallFinishType] = useState<'paint' | 'tile'>('paint');
  const [wallPaintColor, setWallPaintColor] = useState<string>('white');
  const [wallTileColor, setWallTileColor] = useState<string>('white-subway');
  
  // Mirror and Medicine Cabinet
  const [includeMirror, setIncludeMirror] = useState(true);
  const [mirrorType, setMirrorType] = useState<'mirror' | 'medicine-cabinet'>('mirror');
  const [mirrorSize, setMirrorSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [mirrorShape, setMirrorShape] = useState<'rectangular' | 'round' | 'oval' | 'arched'>('rectangular');
  const [mirrorFrame, setMirrorFrame] = useState<'none' | 'black' | 'chrome' | 'gold' | 'wood'>('chrome');
  
  // Bathroom Accessories
  const [includeTowelBar, setIncludeTowelBar] = useState(false);
  const [towelBarPosition, setTowelBarPosition] = useState<'left' | 'right' | 'center'>('center');
  const [includeToiletPaperHolder, setIncludeToiletPaperHolder] = useState(false);
  const [includeRobeHooks, setIncludeRobeHooks] = useState(false);
  const [robeHookCount, setRobeHookCount] = useState(2);
  const [includeShelving, setIncludeShelving] = useState(false);
  const [shelvingType, setShelvingType] = useState<'floating' | 'corner' | 'ladder'>('floating');
  
  // Faucet and Fixtures
  const [includeFaucet, setIncludeFaucet] = useState(true);
  const [faucetStyle, setFaucetStyle] = useState<'modern' | 'traditional' | 'waterfall'>('modern');
  const [faucetFinish, setFaucetFinish] = useState<'chrome' | 'brushed-nickel' | 'matte-black' | 'gold'>('chrome');
  
  // Countertop
  const [countertopMaterial, setCountertopMaterial] = useState<'marble' | 'quartz' | 'granite'>('quartz');
  const [countertopEdge, setCountertopEdge] = useState<'straight' | 'beveled' | 'bullnose' | 'waterfall'>('straight');
  const [countertopColor, setCountertopColor] = useState<string>('white');
  
  // Sink
  const [sinkStyle, setSinkStyle] = useState<'undermount' | 'vessel' | 'integrated'>('undermount');
  const [sinkShape, setSinkShape] = useState<'oval' | 'rectangular' | 'square'>('oval');
  
  // Backsplash
  const [includeBacksplash, setIncludeBacksplash] = useState(false);
  const [backsplashMaterial, setBacksplashMaterial] = useState<'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone'>('subway-tile');
  const [backsplashHeight, setBacksplashHeight] = useState<'4-inch' | 'full-height'>('4-inch');
  
  // Vanity Lighting
  const [includeVanityLighting, setIncludeVanityLighting] = useState(true);
  const [vanityLightingStyle, setVanityLightingStyle] = useState<'sconce' | 'led-strip' | 'pendant'>('sconce');
  const [vanityLightBrightness, setVanityLightBrightness] = useState<number>(85);
  const [vanityLightTemp, setVanityLightTemp] = useState<number>(3000);
  
  // Computed values
  const dimensionsInInches = useMemo(() => ({
    width: inchesWithFractionToDecimal(parseFloat(width || "0"), parseInt(widthFraction)),
    height: inchesWithFractionToDecimal(parseFloat(height || "0"), parseInt(heightFraction)),
    depth: inchesWithFractionToDecimal(parseFloat(depth || "0"), parseInt(depthFraction)),
  }), [width, widthFraction, height, heightFraction, depth, depthFraction]);
  
  // Load scanned measurements from storage
  const loadScannedMeasurements = () => {
    try {
      // Check sessionStorage first (from recent scan)
      const currentScanStr = sessionStorage.getItem('current_scan');
      if (currentScanStr) {
        const scan = JSON.parse(currentScanStr);
        applyScannedMeasurements(scan);
        return;
      }

      // Check for saved scans using roomScanner utility
      const scans = roomScanner.getSavedScans();
      if (scans.length > 0) {
        const latestScan = scans[scans.length - 1];
        applyScannedMeasurements(latestScan);
      }
    } catch (error) {
      console.error('Error loading scanned measurements:', error);
    }
  };

  const applyScannedMeasurements = (scan: any) => {
    // Convert meters to inches (1 meter = 39.3701 inches)
    const widthInches = Math.round(scan.measurements.width * 39.3701);
    const heightInches = Math.round(scan.measurements.height * 39.3701);
    const depthInches = Math.round(scan.measurements.depth * 39.3701);

    setWidth(Math.floor(widthInches).toString());
    setHeight(Math.floor(heightInches).toString());
    setDepth(Math.floor(depthInches).toString());
    setWidthFraction("0");
    setHeightFraction("0");
    setDepthFraction("0");

    toast.success(`Measurements loaded from ${scan.roomName}`, {
      description: `${widthInches}" W × ${depthInches}" D × ${heightInches}" H`,
    });
  };
  
  // Apply template configuration
  const applyTemplateConfig = (config: any) => {
    setSelectedBrand(config.brand);
    setSelectedFinish(config.finish);
    setWidth(config.width);
    setWidthFraction(config.widthFraction);
    setHeight(config.height);
    setHeightFraction(config.heightFraction);
    setDepth(config.depth);
    setDepthFraction(config.depthFraction);
    setDoorStyle(config.doorStyle);
    setNumDrawers(config.numDrawers);
    setHandleStyle(config.handleStyle);
    if (config.cabinetPosition) {
      setCabinetPosition(config.cabinetPosition);
    }
  };

  // Load shared configuration from URL
  const loadSharedConfiguration = () => {
    const sharedConfig = decodeShareableURL();
    if (sharedConfig) {
      console.log('Loading shared configuration from URL', sharedConfig);
      
      if (sharedConfig.brand) setSelectedBrand(sharedConfig.brand);
      if (sharedConfig.finish) setSelectedFinish(sharedConfig.finish);
      if (sharedConfig.width) setWidth(sharedConfig.width);
      if (sharedConfig.widthFraction) setWidthFraction(sharedConfig.widthFraction);
      if (sharedConfig.height) setHeight(sharedConfig.height);
      if (sharedConfig.heightFraction) setHeightFraction(sharedConfig.heightFraction);
      if (sharedConfig.depth) setDepth(sharedConfig.depth);
      if (sharedConfig.depthFraction) setDepthFraction(sharedConfig.depthFraction);
      if (sharedConfig.doorStyle) setDoorStyle(sharedConfig.doorStyle);
      if (sharedConfig.numDrawers) setNumDrawers(sharedConfig.numDrawers);
      if (sharedConfig.handleStyle) setHandleStyle(sharedConfig.handleStyle);
      if (sharedConfig.cabinetPosition) setCabinetPosition(sharedConfig.cabinetPosition);
      if (sharedConfig.includeRoom !== undefined) setIncludeRoom(sharedConfig.includeRoom);
      if (sharedConfig.roomLength) setRoomLength(sharedConfig.roomLength);
      if (sharedConfig.roomWidth) setRoomWidth(sharedConfig.roomWidth);
      if (sharedConfig.floorType) setFloorType(sharedConfig.floorType);
      if (sharedConfig.tileColor) setTileColor(sharedConfig.tileColor);
      if (sharedConfig.woodFloorFinish) setWoodFloorFinish(sharedConfig.woodFloorFinish);
      if (sharedConfig.includeWalls !== undefined) setIncludeWalls(sharedConfig.includeWalls);
      if (sharedConfig.wallTileColor) setWallTileColor(sharedConfig.wallTileColor);
      if (sharedConfig.state) setState(sharedConfig.state);
      
      toast.success("Loaded shared vanity design!");
      return true;
    }
    return false;
  };
  
  // Load scanned measurements or shared config on mount
  useEffect(() => {
    // Try to load shared configuration first
    const loadedShared = loadSharedConfiguration();
    
    // If no shared config, load scanned measurements
    if (!loadedShared) {
      loadScannedMeasurements();
    }
  }, []);
  
  return {
    selectedBrand,
    setSelectedBrand,
    selectedFinish,
    setSelectedFinish,
    width,
    setWidth,
    height,
    setHeight,
    depth,
    setDepth,
    widthFraction,
    setWidthFraction,
    heightFraction,
    setHeightFraction,
    depthFraction,
    setDepthFraction,
    zipCode,
    setZipCode,
    state,
    setState,
    doorStyle,
    setDoorStyle,
    numDrawers,
    setNumDrawers,
    handleStyle,
    setHandleStyle,
    cabinetPosition,
    setCabinetPosition,
    includeWalls,
    setIncludeWalls,
    wallWidth,
    setWallWidth,
    wallHeight,
    setWallHeight,
    hasWindow,
    setHasWindow,
    hasDoor,
    setHasDoor,
    hasMedicineCabinet,
    setHasMedicineCabinet,
    medicineCabinetDoorType,
    setMedicineCabinetDoorType,
    includeRoom,
    setIncludeRoom,
    roomLength,
    setRoomLength,
    roomWidth,
    setRoomWidth,
    floorType,
    setFloorType,
    tileColor,
    setTileColor,
    woodFloorFinish,
    setWoodFloorFinish,
    lightingType,
    setLightingType,
    brightness,
    setBrightness,
    colorTemperature,
    setColorTemperature,
    includeToilet,
    setIncludeToilet,
    toiletStyle,
    setToiletStyle,
    toiletPosition,
    setToiletPosition,
    includeShower,
    setIncludeShower,
    showerStyle,
    setShowerStyle,
    includeBathtub,
    setIncludeBathtub,
    bathtubStyle,
    setBathtubStyle,
    bathtubPosition,
    setBathtubPosition,
    wallFinishType,
    setWallFinishType,
    wallPaintColor,
    setWallPaintColor,
    wallTileColor,
    setWallTileColor,
    includeMirror,
    setIncludeMirror,
    mirrorType,
    setMirrorType,
    mirrorSize,
    setMirrorSize,
    mirrorShape,
    setMirrorShape,
    mirrorFrame,
    setMirrorFrame,
    includeTowelBar,
    setIncludeTowelBar,
    towelBarPosition,
    setTowelBarPosition,
    includeToiletPaperHolder,
    setIncludeToiletPaperHolder,
    includeRobeHooks,
    setIncludeRobeHooks,
    robeHookCount,
    setRobeHookCount,
    includeShelving,
    setIncludeShelving,
    shelvingType,
    setShelvingType,
    includeFaucet,
    setIncludeFaucet,
    faucetStyle,
    setFaucetStyle,
    faucetFinish,
    setFaucetFinish,
    countertopMaterial,
    setCountertopMaterial,
    countertopEdge,
    setCountertopEdge,
    countertopColor,
    setCountertopColor,
    sinkStyle,
    setSinkStyle,
    sinkShape,
    setSinkShape,
    includeBacksplash,
    setIncludeBacksplash,
    backsplashMaterial,
    setBacksplashMaterial,
    backsplashHeight,
    setBacksplashHeight,
    includeVanityLighting,
    setIncludeVanityLighting,
    vanityLightingStyle,
    setVanityLightingStyle,
    vanityLightBrightness,
    setVanityLightBrightness,
    vanityLightTemp,
    setVanityLightTemp,
    dimensionsInInches,
    loadScannedMeasurements,
    applyTemplateConfig,
  };
};
