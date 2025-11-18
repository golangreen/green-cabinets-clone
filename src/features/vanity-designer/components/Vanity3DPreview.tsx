import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Ruler, Camera, FileDown } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import {
  SCALE_FACTOR,
  getMaterialProps,
  DimensionLabels,
  BathroomRoom,
  Lighting,
  BathroomFixtures,
  VanityCabinet,
  VanitySink,
  MirrorCabinet,
  BathroomAccessories,
  VanityFaucet,
  VanityBacksplash,
  VanityLighting,
  type Vanity3DPreviewProps
} from './3d';

type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

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
  const [measurementMode, setMeasurementMode] = useState(false);
  const [activeMeasurement, setActiveMeasurement] = useState<MeasurementType>(null);
  const [zoom, setZoom] = useState(includeRoom && roomLength > 0 ? 5 : 3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update zoom when room is toggled
  useMemo(() => {
    if (includeRoom && roomLength > 0) {
      setZoom(5);
    }
  }, [includeRoom, roomLength]);

  const hasValidDimensions = useMemo(() => {
    return width > 0 && height > 0 && depth > 0;
  }, [width, height, depth]);

  const materialType = useMemo(() => {
    const props = getMaterialProps(brand, finish);
    return props.type;
  }, [brand, finish]);

  const handleMeasurementClick = (type: MeasurementType) => {
    setActiveMeasurement(type);
  };

  const toggleMeasurementMode = () => {
    setMeasurementMode(!measurementMode);
    if (measurementMode) {
      setActiveMeasurement(null);
    }
  };

  const downloadScreenshot = () => {
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
  };

  const printView = () => {
    toast.info("Opening print dialog...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

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
          onClick={() => setZoom(Math.max(2, zoom - 0.5))}
          className="shadow-lg h-10 w-10 p-0"
          title="Zoom out"
        >
          <span className="text-lg font-bold">−</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(Math.min(8, zoom + 0.5))}
          className="shadow-lg h-10 w-10 p-0"
          title="Zoom in"
        >
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(includeRoom && roomLength > 0 ? 5 : 3)}
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
        
        {/* Bathroom Fixtures */}
        {includeRoom && roomLength > 0 && roomWidth > 0 && (
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
          
          {/* Mirror or Medicine Cabinet above vanity */}
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
          
          {/* Bathroom Accessories */}
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
          
          {/* Faucet & Fixtures */}
          <VanityFaucet
            vanityWidth={width}
            vanityHeight={height}
            vanityDepth={depth}
            includeFaucet={includeFaucet}
            faucetStyle={faucetStyle}
            faucetFinish={faucetFinish}
          />
          
          {/* Sink */}
          <VanitySink
            vanityWidth={width}
            vanityHeight={height}
            vanityDepth={depth}
            sinkStyle={sinkStyle}
            sinkShape={sinkShape}
          />
          
          {/* Backsplash */}
          <VanityBacksplash
            vanityWidth={width}
            vanityHeight={height}
            vanityDepth={depth}
            includeBacksplash={includeBacksplash}
            backsplashMaterial={backsplashMaterial}
            backsplashHeight={backsplashHeight}
            mirrorHeight={mirrorSize === 'small' ? 24 : mirrorSize === 'large' ? 36 : 30}
          />
          
          {/* Vanity Lighting */}
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
