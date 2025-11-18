import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useMemo, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Ruler, Camera, FileDown } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useInteractionState } from '../hooks/useInteractionState';
import {
  getMaterialProps,
  DimensionLabels,
  BathroomRoom,
  Lighting,
  VanityCabinet,
  type Vanity3DPreviewProps
} from './3d';

type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

// Lazy load heavy 3D fixture components
const BathroomFixtures = lazy(() => import('./3d/fixtures/BathroomFixtures').then(m => ({ default: m.BathroomFixtures })));
const VanitySink = lazy(() => import('./3d/fixtures/VanitySink').then(m => ({ default: m.VanitySink })));
const MirrorCabinet = lazy(() => import('./3d/fixtures/MirrorCabinet').then(m => ({ default: m.MirrorCabinet })));
const BathroomAccessories = lazy(() => import('./3d/fixtures/BathroomAccessories').then(m => ({ default: m.BathroomAccessories })));
const VanityFaucet = lazy(() => import('./3d/fixtures/VanityFaucet').then(m => ({ default: m.VanityFaucet })));
const VanityBacksplash = lazy(() => import('./3d/fixtures/VanityBacksplash').then(m => ({ default: m.VanityBacksplash })));
const VanityLighting = lazy(() => import('./3d/fixtures/VanityLighting').then(m => ({ default: m.VanityLighting })));

export const Vanity3DPreview = ({
  width, 
  height, 
  depth, 
  brand, 
  finish, 
  doorStyle, 
  numDrawers, 
  handleStyle, 
  cabinetPosition = "left", 
  fullscreen = false,
  includeRoom = false,
  roomLength = 0,
  roomWidth = 0,
  roomHeight = 96,
  floorType = "tile",
  tileColor = "white-marble",
  woodFloorFinish = "natural-oak",
  includeWalls = false,
  hasWindow = false,
  hasDoor = false,
  lightingType = "recessed",
  brightness = 80,
  colorTemperature = 4000,
  includeToilet = false,
  toiletStyle = 'modern',
  toiletPosition = 'left',
  includeShower = false,
  showerStyle = 'walk-in',
  includeBathtub = false,
  bathtubStyle = 'freestanding',
  bathtubPosition = 'back',
  wallFinishType = 'paint',
  wallPaintColor = 'white',
  wallTileColor = 'white-subway',
  includeMirror = true,
  mirrorType = 'mirror',
  mirrorSize = 'medium',
  mirrorShape = 'rectangular',
  mirrorFrame = 'chrome',
  includeTowelBar = false,
  towelBarPosition = 'center',
  includeToiletPaperHolder = false,
  includeRobeHooks = false,
  robeHookCount = 2,
  includeShelving = false,
  shelvingType = 'floating',
  includeFaucet = true,
  faucetStyle = 'modern',
  faucetFinish = 'chrome',
  countertopMaterial = 'quartz',
  countertopEdge = 'straight',
  countertopColor = 'white',
  sinkStyle = 'undermount',
  sinkShape = 'oval',
  includeBacksplash = false,
  backsplashMaterial = 'subway-tile',
  backsplashHeight = '4-inch',
  includeVanityLighting = true,
  vanityLightingStyle = 'sconce',
  vanityLightBrightness = 85,
  vanityLightTemp = 3000
}: Vanity3DPreviewProps) => {
  const defaultZoom = includeRoom && roomLength > 0 ? 5 : 3;
  const {
    measurementMode,
    activeMeasurement,
    zoom,
    toggleMeasurementMode,
    setActiveMeasurement,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useInteractionState(defaultZoom);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update zoom when room configuration changes
  useEffect(() => {
    if (includeRoom && roomLength > 0) {
      resetZoom(5);
    }
  }, [includeRoom, roomLength, resetZoom]);

  const hasValidDimensions = useMemo(() => {
    return width > 0 && height > 0 && depth > 0;
  }, [width, height, depth]);

  const materialType = useMemo(() => {
    const props = getMaterialProps(brand, finish);
    return props.type;
  }, [brand, finish]);

  const handleMeasurementClick = useCallback((type: MeasurementType) => {
    setActiveMeasurement(type);
  }, [setActiveMeasurement]);

  const downloadScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not ready");
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `vanity-${width}x${height}x${depth}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Screenshot downloaded!");
        }
      });
    } catch (error) {
      logger.error('Screenshot error', error, { component: 'Vanity3DPreview' });
      toast.error("Failed to capture screenshot");
    }
  }, [width, height, depth]);

  const printView = useCallback(() => {
    toast.info("Opening print dialog...");
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  if (!hasValidDimensions) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <p className="text-muted-foreground text-center p-4">
          Enter vanity dimensions to see 3D preview
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-full'}`}>
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant={measurementMode ? "default" : "outline"}
          size="sm"
          onClick={toggleMeasurementMode}
          className="shadow-lg"
        >
          <Ruler className="w-4 h-4 mr-2" />
          Measure
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadScreenshot}
          className="shadow-lg"
        >
          <Camera className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={printView}
          className="shadow-lg"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={zoomOut}
          className="shadow-lg h-10 w-10 p-0"
          title="Zoom out"
        >
          <span className="text-lg font-bold">−</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={zoomIn}
          className="shadow-lg h-10 w-10 p-0"
          title="Zoom in"
        >
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetZoom(defaultZoom)}
          className="shadow-lg h-10 w-10 p-0"
          title="Reset zoom"
        >
          <span className="text-sm">⟲</span>
        </Button>
      </div>
      
      <Canvas shadows onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
      }}>
        <PerspectiveCamera 
          makeDefault 
          position={includeRoom && roomLength > 0 ? [zoom * 1.5, zoom, zoom * 1.5] : [zoom, zoom * 0.7, zoom]} 
        />
        <OrbitControls 
          enablePan={false}
          minDistance={zoom}
          maxDistance={zoom}
          maxPolarAngle={Math.PI / 2}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.5}
        />
        <pointLight position={[0, 2, 0]} intensity={0.3} />
        
        <Environment preset="apartment" />
        
        {/* Room with floor and walls */}
        {includeRoom && roomLength > 0 && roomWidth > 0 ? (
          <BathroomRoom
            roomLength={roomLength}
            roomWidth={roomWidth}
            roomHeight={roomHeight}
            floorType={floorType}
            tileColor={tileColor}
            woodFloorFinish={woodFloorFinish}
            includeWalls={includeWalls}
            hasWindow={hasWindow}
            hasDoor={hasDoor}
            wallFinishType={wallFinishType}
            wallPaintColor={wallPaintColor}
            wallTileColor={wallTileColor}
          />
        ) : (
          /* Default shadow plane when no room */
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        )}
        
        {/* Lighting fixtures (only when room is included) */}
        {includeRoom && roomLength > 0 && roomWidth > 0 && (
          <Lighting
            lightingType={lightingType}
            roomLength={roomLength}
            roomWidth={roomWidth}
            roomHeight={roomHeight}
            brightness={brightness}
            colorTemperature={colorTemperature}
          />
        )}
        
        {/* Bathroom Fixtures - Lazy Loaded */}
        {includeRoom && roomLength > 0 && roomWidth > 0 && (
          <Suspense fallback={null}>
            <BathroomFixtures
              roomLength={roomLength}
              roomWidth={roomWidth}
              includeToilet={includeToilet}
              toiletStyle={toiletStyle}
              toiletPosition={toiletPosition}
              includeShower={includeShower}
              showerStyle={showerStyle}
              includeBathtub={includeBathtub}
              bathtubStyle={bathtubStyle}
              bathtubPosition={bathtubPosition}
            />
          </Suspense>
        )}
        
        {/* Vanity positioned in center of room or at origin */}
        <group position={[0, 0, 0]}>
          <VanityCabinet 
            width={width} 
            height={height} 
            depth={depth} 
            brand={brand} 
            finish={finish}
            doorStyle={doorStyle}
            numDrawers={numDrawers}
            handleStyle={handleStyle}
            cabinetPosition={cabinetPosition}
            measurementMode={measurementMode}
            onMeasurementClick={handleMeasurementClick}
            activeMeasurement={activeMeasurement}
            countertopMaterial={countertopMaterial}
            countertopEdge={countertopEdge}
            countertopColor={countertopColor}
          />
          
          {/* Mirror or Medicine Cabinet above vanity - Lazy Loaded */}
          <Suspense fallback={null}>
            <MirrorCabinet
              vanityWidth={width}
              vanityHeight={height}
              vanityDepth={depth}
              includeMirror={includeMirror}
              mirrorType={mirrorType}
              mirrorSize={mirrorSize}
              mirrorShape={mirrorShape}
              mirrorFrame={mirrorFrame}
            />
          </Suspense>
          
          {/* Bathroom Accessories - Lazy Loaded */}
          <Suspense fallback={null}>
            <BathroomAccessories
              vanityWidth={width}
              vanityHeight={height}
              roomLength={roomLength}
              roomWidth={roomWidth}
              includeTowelBar={includeTowelBar}
              towelBarPosition={towelBarPosition}
              includeToiletPaperHolder={includeToiletPaperHolder}
              toiletPosition={toiletPosition}
              includeRobeHooks={includeRobeHooks}
              robeHookCount={robeHookCount}
              includeShelving={includeShelving}
              shelvingType={shelvingType}
            />
          </Suspense>
          
          {/* Faucet & Fixtures - Lazy Loaded */}
          <Suspense fallback={null}>
            <VanityFaucet
              vanityWidth={width}
              vanityHeight={height}
              vanityDepth={depth}
              includeFaucet={includeFaucet}
              faucetStyle={faucetStyle}
              faucetFinish={faucetFinish}
            />
          </Suspense>
          
          {/* Sink - Lazy Loaded */}
          <Suspense fallback={null}>
            <VanitySink
              vanityWidth={width}
              vanityHeight={height}
              vanityDepth={depth}
              sinkStyle={sinkStyle}
              sinkShape={sinkShape}
            />
          </Suspense>
          
          {/* Backsplash - Lazy Loaded */}
          <Suspense fallback={null}>
            <VanityBacksplash
              vanityWidth={width}
              vanityHeight={height}
              vanityDepth={depth}
              includeBacksplash={includeBacksplash}
              backsplashMaterial={backsplashMaterial}
              backsplashHeight={backsplashHeight}
              mirrorHeight={mirrorSize === 'small' ? 24 : mirrorSize === 'large' ? 36 : 30}
            />
          </Suspense>
          
          {/* Vanity Lighting - Lazy Loaded */}
          <Suspense fallback={null}>
            <VanityLighting
              vanityWidth={width}
              vanityHeight={height}
              vanityDepth={depth}
              mirrorSize={mirrorSize}
              includeVanityLighting={includeVanityLighting}
              vanityLightingStyle={vanityLightingStyle}
              vanityLightBrightness={vanityLightBrightness}
              vanityLightTemp={vanityLightTemp}
            />
          </Suspense>
        </group>
      </Canvas>
      
      <DimensionLabels width={width} height={height} depth={depth} />
      
      <div className="absolute top-4 left-4 right-32 flex flex-col items-center gap-2">
        {includeRoom && roomLength > 0 ? (
          <p className="text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm rounded-lg px-3 py-1.5 border border-primary">
            🏠 Full Bathroom Layout • {(roomLength / 12).toFixed(1)}' × {(roomWidth / 12).toFixed(1)}'
          </p>
        ) : null}
        {measurementMode ? (
          <p className="text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
            Click on vanity parts to measure
          </p>
        ) : (
          <p className="text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
            Drag to rotate • Scroll to zoom
          </p>
        )}
        <p className="text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm rounded-lg px-3 py-1.5 border border-primary">
          {materialType === 'wood' && '🌲 Wood Grain'}
          {materialType === 'metallic' && '✨ Metallic'}
          {materialType === 'painted' && '🎨 Painted'}
        </p>
      </div>
      
      {activeMeasurement && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl border border-primary">
            <p className="text-sm font-semibold">
              {activeMeasurement === 'height' && `Height: ${height.toFixed(2)}"`}
              {activeMeasurement === 'width' && `Width: ${width.toFixed(2)}"`}
              {activeMeasurement === 'depth' && `Depth: ${depth.toFixed(2)}"`}
              {activeMeasurement === 'door' && 'Door Detail View'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
