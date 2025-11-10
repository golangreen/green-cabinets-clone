import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Line, Html } from "@react-three/drei";
import { useMemo, useState, useRef } from "react";
import * as THREE from "three";
import { Button } from "./ui/button";
import { Ruler, Camera, FileDown } from "lucide-react";
import { toast } from "sonner";

interface Vanity3DPreviewProps {
  width: number;
  height: number;
  depth: number;
  brand: string;
  finish: string;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition?: string;
  fullscreen?: boolean;
  includeRoom?: boolean;
  roomLength?: number;
  roomWidth?: number;
  roomHeight?: number;
  floorType?: string;
  tileColor?: string;
  woodFloorFinish?: string;
  includeWalls?: boolean;
  hasWindow?: boolean;
  hasDoor?: boolean;
  lightingType?: string;
  brightness?: number;
  colorTemperature?: number;
  includeToilet?: boolean;
  toiletStyle?: 'modern' | 'traditional' | 'wall-mounted';
  toiletPosition?: 'left' | 'right';
  includeShower?: boolean;
  showerStyle?: 'walk-in' | 'enclosed' | 'corner';
  includeBathtub?: boolean;
  bathtubStyle?: 'freestanding' | 'alcove' | 'corner';
  bathtubPosition?: 'left' | 'right' | 'back';
  wallFinishType?: 'paint' | 'tile';
  wallPaintColor?: string;
  wallTileColor?: string;
  includeMirror?: boolean;
  mirrorType?: 'mirror' | 'medicine-cabinet';
  mirrorSize?: 'small' | 'medium' | 'large';
  mirrorShape?: 'rectangular' | 'round' | 'oval' | 'arched';
  mirrorFrame?: 'none' | 'black' | 'chrome' | 'gold' | 'wood';
  includeTowelBar?: boolean;
  towelBarPosition?: 'left' | 'right' | 'center';
  includeToiletPaperHolder?: boolean;
  includeRobeHooks?: boolean;
  robeHookCount?: number;
  includeShelving?: boolean;
  shelvingType?: 'floating' | 'corner' | 'ladder';
  includeFaucet?: boolean;
  faucetStyle?: 'modern' | 'traditional' | 'waterfall';
  faucetFinish?: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold';
  countertopMaterial?: 'marble' | 'quartz' | 'granite';
  countertopEdge?: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  countertopColor?: string;
  sinkStyle?: 'undermount' | 'vessel' | 'integrated';
  sinkShape?: 'oval' | 'rectangular' | 'square';
  includeBacksplash?: boolean;
  backsplashMaterial?: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone';
  backsplashHeight?: '4-inch' | 'full-height';
}

// Convert inches to a normalized scale for 3D visualization
const SCALE_FACTOR = 0.02;

type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

interface MeasurementLineProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  color?: string;
}

const MeasurementLine = ({ start, end, label, color = "#00ff00" }: MeasurementLineProps) => {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} />
      <Html position={midpoint} center>
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-mono font-semibold whitespace-nowrap shadow-lg border border-primary">
          {label}
        </div>
      </Html>
      {/* End caps */}
      <mesh position={start}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

// Determine material properties based on finish
const getMaterialProps = (brand: string, finish: string) => {
  const finishLower = finish.toLowerCase();
  
  // Wood finishes (Shinnoki or wood-like Egger/Tafisa)
  const isWoodFinish = brand === 'Shinnoki' || 
    finishLower.includes('oak') || 
    finishLower.includes('walnut') || 
    finishLower.includes('wood') ||
    finishLower.includes('maple') ||
    finishLower.includes('cherry') ||
    finishLower.includes('eucalyptus') ||
    finishLower.includes('sapele') ||
    finishLower.includes('triba');
  
  // Metallic finishes
  const isMetallic = finishLower.includes('metal') || 
    finishLower.includes('chrome') || 
    finishLower.includes('silver') ||
    finishLower.includes('gold') ||
    finishLower.includes('bronze') ||
    finishLower.includes('copper');
  
  // Glossy/High-gloss finishes
  const isGlossy = finishLower.includes('gloss') || 
    finishLower.includes('lacquer') ||
    finishLower.includes('shine');
  
  // White and light finishes
  const isWhite = finishLower.includes('white') || 
    finishLower.includes('snow') ||
    finishLower.includes('ivory') ||
    finishLower.includes('cream');
  
  // Dark finishes
  const isDark = finishLower.includes('black') || 
    finishLower.includes('dark') || 
    finishLower.includes('espresso') ||
    finishLower.includes('raven') ||
    finishLower.includes('shadow') ||
    finishLower.includes('smoked');
  
  // Gray finishes
  const isGray = finishLower.includes('gray') || 
    finishLower.includes('grey') ||
    finishLower.includes('slate') ||
    finishLower.includes('concrete');
  
  // Color mapping based on finish name
  let baseColor = '#8B7355'; // Default warm wood tone
  
  if (isWhite) {
    baseColor = '#F5F5F0';
  } else if (isDark) {
    baseColor = '#2C2420';
  } else if (isGray) {
    baseColor = '#7D7D7D';
  } else if (isMetallic) {
    baseColor = '#C0C0C0';
  } else if (brand === 'Tafisa') {
    baseColor = '#8B7355'; // Melamine warm tone
  } else if (brand === 'Egger') {
    baseColor = '#6B5B4D'; // TFL/HPL tone
  } else if (brand === 'Shinnoki') {
    baseColor = '#9B8B7E'; // Natural wood veneer
  }
  
  // Material properties
  if (isWoodFinish) {
    return {
      color: baseColor,
      roughness: 0.6,
      metalness: 0,
      bumpScale: 0.02,
      type: 'wood' as const,
    };
  } else if (isMetallic) {
    return {
      color: baseColor,
      roughness: 0.15,
      metalness: 0.9,
      bumpScale: 0.005,
      type: 'metallic' as const,
    };
  } else if (isGlossy) {
    return {
      color: baseColor,
      roughness: 0.1,
      metalness: 0.2,
      bumpScale: 0,
      type: 'glossy' as const,
    };
  } else {
    // Matte/standard finish
    return {
      color: baseColor,
      roughness: 0.4,
      metalness: 0.1,
      bumpScale: 0.01,
      type: 'matte' as const,
    };
  }
};

// Get floor material properties based on type and selection
const getFloorMaterial = (floorType: string, tileColor: string, woodFloorFinish: string) => {
  if (floorType === 'tile') {
    const tileColors: Record<string, string> = {
      'white-marble': '#f8f8f8',
      'gray-marble': '#a0a0a0',
      'black-marble': '#2a2a2a',
      'cream-travertine': '#f5e6d3',
      'beige-porcelain': '#d4c5b9',
      'charcoal-slate': '#4a4a4a',
      'white-subway': '#ffffff',
      'gray-hexagon': '#8b8b8b',
      'black-white-pattern': '#cccccc',
    };
    return {
      color: tileColors[tileColor] || '#ffffff',
      roughness: 0.3,
      metalness: 0.1,
    };
  } else {
    const woodColors: Record<string, string> = {
      'natural-oak': '#c19a6b',
      'honey-oak': '#d4a574',
      'dark-walnut': '#5c4033',
      'espresso-maple': '#3e2723',
      'gray-oak': '#8b8680',
      'white-washed-oak': '#e8e0d5',
      'cherry-mahogany': '#8b4513',
      'hickory-natural': '#b8956a',
    };
    return {
      color: woodColors[woodFloorFinish] || '#c19a6b',
      roughness: 0.6,
      metalness: 0.0,
    };
  }
};

// Room component with walls and floor
const Room = ({ 
  roomLength, 
  roomWidth, 
  roomHeight, 
  floorType, 
  tileColor, 
  woodFloorFinish,
  includeWalls,
  hasWindow,
  hasDoor,
  wallFinishType,
  wallPaintColor,
  wallTileColor
}: {
  roomLength: number;
  roomWidth: number;
  roomHeight: number;
  floorType: string;
  tileColor: string;
  woodFloorFinish: string;
  includeWalls: boolean;
  hasWindow: boolean;
  hasDoor: boolean;
  wallFinishType: string;
  wallPaintColor: string;
  wallTileColor: string;
}) => {
  const scaledLength = roomLength * SCALE_FACTOR;
  const scaledWidth = roomWidth * SCALE_FACTOR;
  const scaledHeight = roomHeight * SCALE_FACTOR;
  
  const floorMaterial = useMemo(() => 
    getFloorMaterial(floorType, tileColor, woodFloorFinish),
    [floorType, tileColor, woodFloorFinish]
  );

  // Get wall material based on finish type
  const getWallMaterial = () => {
    if (wallFinishType === 'paint') {
      const paintColors: { [key: string]: string } = {
        'white': '#ffffff',
        'beige': '#f5f5dc',
        'light-gray': '#d3d3d3',
        'sage-green': '#9dc183',
        'light-blue': '#add8e6',
        'cream': '#fffdd0'
      };
      return {
        color: paintColors[wallPaintColor] || '#ffffff',
        roughness: 0.9,
        metalness: 0.0
      };
    } else {
      const tileColors: { [key: string]: string } = {
        'white-subway': '#ffffff',
        'gray-subway': '#808080',
        'marble': '#f8f8f8',
        'travertine': '#d8c8b8',
        'porcelain': '#e8e8e8',
        'mosaic': '#c0c0c0'
      };
      return {
        color: tileColors[wallTileColor] || '#ffffff',
        roughness: 0.2,
        metalness: 0.1
      };
    }
  };

  const wallMaterial = useMemo(() => getWallMaterial(), [wallFinishType, wallPaintColor, wallTileColor]);

  // Create floor texture
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (floorType === 'tile') {
      // Tile pattern
      ctx.fillStyle = floorMaterial.color;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Grout lines
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2;
      const tileSize = 64;
      for (let x = 0; x <= 1024; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
    } else {
      // Wood plank pattern
      ctx.fillStyle = floorMaterial.color;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Wood grain lines
      ctx.strokeStyle = new THREE.Color(floorMaterial.color).multiplyScalar(0.8).getStyle();
      ctx.lineWidth = 1;
      const plankHeight = 128;
      for (let y = 0; y <= 1024; y += plankHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
        
        // Add wood grain detail
        for (let i = 0; i < 10; i++) {
          const grainY = y + Math.random() * plankHeight;
          ctx.beginPath();
          ctx.moveTo(0, grainY);
          ctx.lineTo(1024, grainY);
          ctx.globalAlpha = 0.1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [floorType, floorMaterial.color]);

  // Create wall texture for tiles
  const wallTexture = useMemo(() => {
    if (wallFinishType !== 'tile') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base tile color
    ctx.fillStyle = wallMaterial.color;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Grout lines
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = wallTileColor === 'mosaic' ? 1 : 2;
    
    const tileSize = wallTileColor === 'mosaic' ? 32 : 
                    wallTileColor.includes('subway') ? 96 : 64;
    
    for (let x = 0; x <= 1024; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += (wallTileColor.includes('subway') ? 48 : tileSize)) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }, [wallFinishType, wallTileColor, wallMaterial.color]);

  return (
    <group>
      {/* Floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[scaledLength, scaledWidth]} />
        <meshStandardMaterial 
          map={floorTexture}
          color={floorMaterial.color}
          roughness={floorMaterial.roughness}
          metalness={floorMaterial.metalness}
        />
      </mesh>

      {/* Walls */}
      {includeWalls && (
        <>
          {/* Back wall */}
          <mesh position={[0, scaledHeight / 2, -scaledWidth / 2]} receiveShadow castShadow>
            <boxGeometry args={[scaledLength, scaledHeight, 0.1]} />
            <meshStandardMaterial 
              map={wallTexture}
              color={wallMaterial.color} 
              roughness={wallMaterial.roughness}
              metalness={wallMaterial.metalness}
            />
          </mesh>

          {/* Left wall */}
          <mesh position={[-scaledLength / 2, scaledHeight / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.1, scaledHeight, scaledWidth]} />
            <meshStandardMaterial 
              map={wallTexture}
              color={wallMaterial.color} 
              roughness={wallMaterial.roughness}
              metalness={wallMaterial.metalness}
            />
          </mesh>

          {/* Right wall with optional door */}
          {hasDoor ? (
            <>
              {/* Wall segment below door */}
              <mesh position={[scaledLength / 2, 0.5, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, 1, scaledWidth]} />
                <meshStandardMaterial 
                  map={wallTexture}
                  color={wallMaterial.color} 
                  roughness={wallMaterial.roughness}
                  metalness={wallMaterial.metalness}
                />
              </mesh>
              {/* Wall segment above door */}
              <mesh position={[scaledLength / 2, scaledHeight - 0.5, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, 1, scaledWidth]} />
                <meshStandardMaterial 
                  map={wallTexture}
                  color={wallMaterial.color} 
                  roughness={wallMaterial.roughness}
                  metalness={wallMaterial.metalness}
                />
              </mesh>
              {/* Door */}
              <mesh position={[scaledLength / 2, scaledHeight / 2, 0]} castShadow>
                <boxGeometry args={[0.05, scaledHeight - 2, 1.5]} />
                <meshStandardMaterial color="#8b7355" roughness={0.7} />
              </mesh>
            </>
          ) : (
            <mesh position={[scaledLength / 2, scaledHeight / 2, 0]} receiveShadow castShadow>
              <boxGeometry args={[0.1, scaledHeight, scaledWidth]} />
              <meshStandardMaterial 
                map={wallTexture}
                color={wallMaterial.color} 
                roughness={wallMaterial.roughness}
                metalness={wallMaterial.metalness}
              />
            </mesh>
          )}

          {/* Front wall with optional window */}
          {hasWindow ? (
            <>
              {/* Wall segment below window */}
              <mesh position={[0, 1, scaledWidth / 2]} receiveShadow castShadow>
                <boxGeometry args={[scaledLength, 2, 0.1]} />
                <meshStandardMaterial 
                  map={wallTexture}
                  color={wallMaterial.color} 
                  roughness={wallMaterial.roughness}
                  metalness={wallMaterial.metalness}
                />
              </mesh>
              {/* Wall segment above window */}
              <mesh position={[0, scaledHeight - 0.5, scaledWidth / 2]} receiveShadow castShadow>
                <boxGeometry args={[scaledLength, 1, 0.1]} />
                <meshStandardMaterial 
                  map={wallTexture}
                  color={wallMaterial.color} 
                  roughness={wallMaterial.roughness}
                  metalness={wallMaterial.metalness}
                />
              </mesh>
              {/* Window frame */}
              <mesh position={[0, scaledHeight / 2, scaledWidth / 2]} castShadow>
                <boxGeometry args={[2, 1.5, 0.05]} />
                <meshStandardMaterial 
                  color="#87ceeb" 
                  transparent 
                  opacity={0.3} 
                  roughness={0.1}
                  metalness={0.1}
                />
              </mesh>
            </>
          ) : (
            <mesh position={[0, scaledHeight / 2, scaledWidth / 2]} receiveShadow castShadow>
              <boxGeometry args={[scaledLength, scaledHeight, 0.1]} />
              <meshStandardMaterial 
                map={wallTexture}
                color={wallMaterial.color} 
                roughness={wallMaterial.roughness}
                metalness={wallMaterial.metalness}
              />
            </mesh>
          )}
        </>
      )}
    </group>
  );
};

// Lighting fixtures component
const LightingFixtures = ({
  lightingType,
  roomLength,
  roomWidth,
  roomHeight,
  brightness,
  colorTemperature
}: {
  lightingType: string;
  roomLength: number;
  roomWidth: number;
  roomHeight: number;
  brightness: number;
  colorTemperature: number;
}) => {
  const scaledLength = roomLength * SCALE_FACTOR;
  const scaledWidth = roomWidth * SCALE_FACTOR;
  const scaledHeight = roomHeight * SCALE_FACTOR;

  // Convert color temperature to RGB
  const getLightColor = (temp: number) => {
    // Warm (2700K) to Cool (6500K)
    if (temp < 3000) return new THREE.Color(1, 0.8, 0.6); // Warm white
    if (temp < 4000) return new THREE.Color(1, 0.95, 0.9); // Neutral
    if (temp < 5000) return new THREE.Color(0.95, 0.95, 1); // Cool white
    return new THREE.Color(0.9, 0.95, 1); // Daylight
  };

  const lightColor = getLightColor(colorTemperature);
  const intensityMultiplier = brightness / 100;

  if (lightingType === 'recessed') {
    // 4 recessed ceiling lights
    const positions: [number, number, number][] = [
      [-scaledLength * 0.25, scaledHeight - 0.1, -scaledWidth * 0.25],
      [scaledLength * 0.25, scaledHeight - 0.1, -scaledWidth * 0.25],
      [-scaledLength * 0.25, scaledHeight - 0.1, scaledWidth * 0.25],
      [scaledLength * 0.25, scaledHeight - 0.1, scaledWidth * 0.25],
    ];

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={`recessed-${i}`} position={pos}>
            {/* Recessed housing */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.12, 0.15, 16]} />
              <meshStandardMaterial color="#f5f5f5" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Light bulb glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
              <meshStandardMaterial 
                color={lightColor}
                emissive={lightColor}
                emissiveIntensity={2 * intensityMultiplier}
              />
            </mesh>
            {/* Point light */}
            <pointLight 
              position={[0, -0.1, 0]} 
              color={lightColor}
              intensity={1.5 * intensityMultiplier}
              distance={8}
              castShadow
            />
          </group>
        ))}
      </group>
    );
  }

  if (lightingType === 'sconce') {
    // 2 wall sconces on sides
    const positions: [number, number, number, number][] = [
      [-scaledLength * 0.45, scaledHeight * 0.6, 0, Math.PI / 2],
      [scaledLength * 0.45, scaledHeight * 0.6, 0, -Math.PI / 2],
    ];

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={`sconce-${i}`} position={[pos[0], pos[1], pos[2]]} rotation={[0, pos[3], 0]}>
            {/* Wall plate */}
            <mesh position={[0, 0, -0.05]}>
              <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
              <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Sconce arm */}
            <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Glass shade */}
            <mesh position={[0, 0, 0.15]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshPhysicalMaterial 
                color={lightColor}
                emissive={lightColor}
                emissiveIntensity={1.5 * intensityMultiplier}
                transparent
                opacity={0.7}
                roughness={0.1}
              />
            </mesh>
            {/* Point light */}
            <pointLight 
              position={[0, 0, 0.15]} 
              color={lightColor}
              intensity={1.2 * intensityMultiplier}
              distance={6}
              castShadow
            />
          </group>
        ))}
      </group>
    );
  }

  if (lightingType === 'pendant') {
    // 2 pendant lights over vanity area
    const positions: [number, number, number][] = [
      [-scaledLength * 0.15, scaledHeight * 0.7, 0],
      [scaledLength * 0.15, scaledHeight * 0.7, 0],
    ];

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={`pendant-${i}`} position={pos}>
            {/* Ceiling mount */}
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Cable/rod */}
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.6, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Pendant shade - cone shape */}
            <mesh position={[0, -0.65, 0]}>
              <coneGeometry args={[0.15, 0.25, 16]} />
              <meshStandardMaterial 
                color="#d0d0d0"
                metalness={0.4}
                roughness={0.5}
              />
            </mesh>
            {/* Light bulb */}
            <mesh position={[0, -0.75, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial 
                color={lightColor}
                emissive={lightColor}
                emissiveIntensity={2 * intensityMultiplier}
              />
            </mesh>
            {/* Point light */}
            <pointLight 
              position={[0, -0.75, 0]} 
              color={lightColor}
              intensity={1.8 * intensityMultiplier}
              distance={7}
              castShadow
            />
          </group>
        ))}
      </group>
    );
  }

  return null;
};

// Bathroom Fixtures Component
const BathroomFixtures: React.FC<{
  roomLength: number;
  roomWidth: number;
  includeToilet: boolean;
  toiletStyle: 'modern' | 'traditional' | 'wall-mounted';
  toiletPosition: 'left' | 'right';
  includeShower: boolean;
  showerStyle: 'walk-in' | 'enclosed' | 'corner';
  includeBathtub: boolean;
  bathtubStyle: 'freestanding' | 'alcove' | 'corner';
  bathtubPosition: 'left' | 'right' | 'back';
}> = ({
  roomLength,
  roomWidth,
  includeToilet,
  toiletStyle,
  toiletPosition,
  includeShower,
  showerStyle,
  includeBathtub,
  bathtubStyle,
  bathtubPosition,
}) => {
  const inchesToFeet = (inches: number) => inches * SCALE_FACTOR;

  // Toilet positioning
  const getToiletPosition = (): [number, number, number] => {
    const x = toiletPosition === 'left' ? -inchesToFeet(roomWidth) / 2 + 0.5 : inchesToFeet(roomWidth) / 2 - 0.5;
    return [x, 0.2, -inchesToFeet(roomLength) / 2 + 0.8];
  };

  // Bathtub positioning
  const getBathtubPosition = (): [number, number, number] => {
    if (bathtubPosition === 'back') {
      return [0, 0.15, inchesToFeet(roomLength) / 2 - 0.8];
    } else if (bathtubPosition === 'left') {
      return [-inchesToFeet(roomWidth) / 2 + 0.8, 0.15, 0];
    } else {
      return [inchesToFeet(roomWidth) / 2 - 0.8, 0.15, 0];
    }
  };

  // Shower positioning (opposite corner from toilet)
  const getShowerPosition = (): [number, number, number] => {
    const x = toiletPosition === 'left' ? inchesToFeet(roomWidth) / 2 - 0.8 : -inchesToFeet(roomWidth) / 2 + 0.8;
    return [x, 0, inchesToFeet(roomLength) / 2 - 0.8];
  };

  return (
    <group>
      {/* Toilet */}
      {includeToilet && (
        <group position={getToiletPosition()}>
          {/* Toilet bowl */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.25, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
          </mesh>
          
          {/* Toilet tank (not for wall-mounted) */}
          {toiletStyle !== 'wall-mounted' && (
            <mesh position={[0, 0.3, -0.12]} castShadow>
              <boxGeometry args={[0.25, 0.4, 0.12]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
          )}
          
          {/* Seat */}
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 16, 32]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
          </mesh>

          {/* Modern style accent */}
          {toiletStyle === 'modern' && (
            <mesh position={[0, 0.18, 0.18]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.1, 16]} />
              <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
            </mesh>
          )}
        </group>
      )}

      {/* Shower */}
      {includeShower && (
        <group position={getShowerPosition()}>
          {/* Shower base */}
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[
              showerStyle === 'corner' ? 1.5 : 1.8,
              0.06,
              showerStyle === 'corner' ? 1.5 : 1.8
            ]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.1} metalness={0.3} />
          </mesh>

          {/* Glass panels */}
          {showerStyle !== 'walk-in' && (
            <>
              {/* Front panel with door */}
              <mesh position={[0, 0.75, showerStyle === 'corner' ? 0.75 : 0.9]}>
                <boxGeometry args={[showerStyle === 'corner' ? 1.5 : 1.8, 1.5, 0.03]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.3}
                  roughness={0.1}
                  metalness={0.1}
                  transmission={0.9}
                />
              </mesh>
              
              {/* Side panels for enclosed */}
              {showerStyle === 'enclosed' && (
                <>
                  <mesh position={[-0.9, 0.75, 0]}>
                    <boxGeometry args={[0.03, 1.5, 1.8]} />
                    <meshPhysicalMaterial
                      color="#ffffff"
                      transparent
                      opacity={0.3}
                      roughness={0.1}
                      metalness={0.1}
                      transmission={0.9}
                    />
                  </mesh>
                  <mesh position={[0.9, 0.75, 0]}>
                    <boxGeometry args={[0.03, 1.5, 1.8]} />
                    <meshPhysicalMaterial
                      color="#ffffff"
                      transparent
                      opacity={0.3}
                      roughness={0.1}
                      metalness={0.1}
                      transmission={0.9}
                    />
                  </mesh>
                </>
              )}

              {/* Corner panels */}
              {showerStyle === 'corner' && (
                <mesh position={[-0.75, 0.75, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <boxGeometry args={[1.5, 1.5, 0.03]} />
                  <meshPhysicalMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.1}
                    transmission={0.9}
                  />
                </mesh>
              )}
            </>
          )}

          {/* Shower head */}
          <group position={[0, 1.4, -0.85]}>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.03, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.4, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>

          {/* Faucet controls */}
          <group position={[-0.3, 0.6, -0.87]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.03, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          <group position={[0.3, 0.6, -0.87]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.03, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      )}

      {/* Bathtub */}
      {includeBathtub && (
        <group 
          position={getBathtubPosition()}
          rotation={[0, bathtubPosition === 'left' ? Math.PI / 2 : bathtubPosition === 'right' ? -Math.PI / 2 : 0, 0]}
        >
          {bathtubStyle === 'freestanding' ? (
            // Freestanding tub
            <group>
              <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.5, 2.1, 16, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
              </mesh>
              {/* Chrome feet */}
              {[-0.9, -0.3, 0.3, 0.9].map((z, i) => (
                <mesh key={i} position={[0, -0.55, z]}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
              ))}
            </group>
          ) : (
            // Alcove or corner tub
            <mesh castShadow receiveShadow>
              <boxGeometry args={[
                bathtubStyle === 'corner' ? 1.8 : 1.0,
                0.4,
                bathtubStyle === 'corner' ? 1.8 : 2.7
              ]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
            </mesh>
          )}

          {/* Faucet */}
          <group position={[bathtubStyle === 'freestanding' ? 0.55 : 0.5, 0.25, bathtubStyle === 'freestanding' ? 0 : -1.2]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.25, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0.13, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.01, 0.18, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

// Sink Component with different styles and shapes
const VanitySink: React.FC<{
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  sinkStyle: 'undermount' | 'vessel' | 'integrated';
  sinkShape: 'oval' | 'rectangular' | 'square';
}> = ({ vanityWidth, vanityHeight, vanityDepth, sinkStyle, sinkShape }) => {
  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Sink dimensions based on shape
  const getSinkDimensions = () => {
    switch (sinkShape) {
      case 'oval':
        return { width: 0.35, depth: 0.28 };
      case 'rectangular':
        return { width: 0.4, depth: 0.3 };
      case 'square':
        return { width: 0.32, depth: 0.32 };
      default:
        return { width: 0.35, depth: 0.28 };
    }
  };

  const sinkDims = getSinkDimensions();
  const sinkDepthValue = 0.12; // How deep the sink basin is

  if (sinkStyle === 'undermount') {
    // Undermount sink - recessed below countertop surface
    const position: [number, number, number] = [
      0,
      scaledHeight - sinkDepthValue / 2,
      -scaledDepth * 0.15
    ];

    if (sinkShape === 'oval') {
      return (
        <group position={position}>
          {/* Sink basin - ellipsoid for oval shape */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[sinkDims.width / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -sinkDepthValue / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    } else {
      // Rectangular or square
      const width = sinkShape === 'square' ? sinkDims.width : sinkDims.width;
      const depth = sinkShape === 'square' ? sinkDims.depth : sinkDims.depth;
      
      return (
        <group position={position}>
          {/* Sink basin */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, sinkDepthValue, depth]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
          </mesh>
          {/* Inner cavity */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[width - 0.04, sinkDepthValue - 0.04, depth - 0.04]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.15} metalness={0.03} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -sinkDepthValue / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    }
  }

  if (sinkStyle === 'vessel') {
    // Vessel sink - sits on top of countertop
    const position: [number, number, number] = [
      0,
      scaledHeight + sinkDepthValue / 2,
      -scaledDepth * 0.15
    ];

    if (sinkShape === 'oval') {
      return (
        <group position={position}>
          {/* Vessel bowl */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[sinkDims.width / 2, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
            <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
          </mesh>
          {/* Bowl rim */}
          <mesh position={[0, sinkDepthValue / 2, 0]}>
            <torusGeometry args={[sinkDims.width / 2, 0.01, 16, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -sinkDepthValue / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    } else {
      // Rectangular or square vessel
      const width = sinkShape === 'square' ? sinkDims.width : sinkDims.width;
      const depth = sinkShape === 'square' ? sinkDims.depth : sinkDims.depth;
      
      return (
        <group position={position}>
          {/* Outer walls */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, sinkDepthValue, depth]} />
            <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} />
          </mesh>
          {/* Inner cavity */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[width - 0.03, sinkDepthValue - 0.03, depth - 0.03]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={0.05} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -sinkDepthValue / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    }
  }

  if (sinkStyle === 'integrated') {
    // Integrated sink - carved into countertop, same material
    const position: [number, number, number] = [
      0,
      scaledHeight + 0.01,
      -scaledDepth * 0.15
    ];

    if (sinkShape === 'oval') {
      return (
        <group position={position}>
          {/* Integrated basin - slightly recessed */}
          <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
            <sphereGeometry args={[sinkDims.width / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.12} metalness={0.25} />
          </mesh>
          {/* Basin rim - blended edge */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[sinkDims.width / 2, 0.015, 8, 32]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.15} metalness={0.2} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    } else {
      // Rectangular or square integrated
      const width = sinkShape === 'square' ? sinkDims.width : sinkDims.width;
      const depth = sinkShape === 'square' ? sinkDims.depth : sinkDims.depth;
      
      return (
        <group position={position}>
          {/* Recessed basin */}
          <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.06, depth]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.12} metalness={0.25} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    }
  }

  return null;
};

// Backsplash Component with different materials and heights
const VanityBacksplash: React.FC<{
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeBacksplash: boolean;
  backsplashMaterial: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone';
  backsplashHeight: '4-inch' | 'full-height';
  mirrorHeight?: number;
}> = ({ 
  vanityWidth, 
  vanityHeight, 
  vanityDepth, 
  includeBacksplash, 
  backsplashMaterial, 
  backsplashHeight,
  mirrorHeight 
}) => {
  if (!includeBacksplash) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Calculate backsplash height
  const backsplashHeightValue = backsplashHeight === '4-inch' 
    ? 4 * SCALE_FACTOR  // 4 inches
    : (mirrorHeight || 30) * SCALE_FACTOR; // Full height to bottom of mirror (default 30")

  // Position backsplash just behind the countertop
  const position: [number, number, number] = [
    0,
    scaledHeight + backsplashHeightValue / 2,
    -scaledDepth / 2 - 0.01  // Just behind the back edge
  ];

  // Get material properties based on selected material
  const getMaterialProps = () => {
    switch (backsplashMaterial) {
      case 'subway-tile':
        return {
          color: '#f8f8f8',
          roughness: 0.2,
          metalness: 0.05,
          needsTexture: true,
          tileSize: 0.06  // Subway tile size
        };
      case 'marble-slab':
        return {
          color: '#f0f0f0',
          roughness: 0.15,
          metalness: 0.15,
          needsTexture: true,
          tileSize: 0  // No tile pattern for slab
        };
      case 'glass-tile':
        return {
          color: '#e8f4f8',
          roughness: 0.05,
          metalness: 0.3,
          needsTexture: true,
          tileSize: 0.04  // Glass mosaic
        };
      case 'stone':
        return {
          color: '#d8d0c8',
          roughness: 0.4,
          metalness: 0.0,
          needsTexture: true,
          tileSize: 0.08  // Natural stone tiles
        };
      default:
        return {
          color: '#f8f8f8',
          roughness: 0.2,
          metalness: 0.05,
          needsTexture: true,
          tileSize: 0.06
        };
    }
  };

  const materialProps = getMaterialProps();

  // Create texture for tiled materials
  const texture = useMemo(() => {
    if (!materialProps.needsTexture) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base color
    ctx.fillStyle = materialProps.color;
    ctx.fillRect(0, 0, 512, 512);

    if (materialProps.tileSize > 0) {
      // Draw tile pattern
      const tileSizePx = materialProps.tileSize * 256;
      ctx.strokeStyle = backsplashMaterial === 'glass-tile' ? '#c0d8e0' : '#cccccc';
      ctx.lineWidth = backsplashMaterial === 'glass-tile' ? 1 : 2;

      if (backsplashMaterial === 'subway-tile') {
        // Subway tile pattern (offset brick pattern)
        const tileHeight = tileSizePx / 3;
        for (let y = 0; y < 512; y += tileHeight) {
          const offset = (Math.floor(y / tileHeight) % 2) * (tileSizePx / 2);
          for (let x = -tileSizePx; x < 512 + tileSizePx; x += tileSizePx) {
            ctx.strokeRect(x + offset, y, tileSizePx, tileHeight);
          }
        }
      } else {
        // Regular grid pattern for glass and stone
        for (let x = 0; x <= 512; x += tileSizePx) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
          ctx.stroke();
        }
        for (let y = 0; y <= 512; y += tileSizePx) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }
      }
    }

    // Add marble veining for marble-slab
    if (backsplashMaterial === 'marble-slab') {
      ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, 0);
        ctx.bezierCurveTo(
          Math.random() * 512, Math.random() * 512,
          Math.random() * 512, Math.random() * 512,
          Math.random() * 512, 512
        );
        ctx.stroke();
      }
    }

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = canvasTexture.wrapT = THREE.RepeatWrapping;
    canvasTexture.repeat.set(2, 2);
    return canvasTexture;
  }, [backsplashMaterial, materialProps.color, materialProps.tileSize]);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[scaledWidth * 0.95, backsplashHeightValue, 0.02]} />
        <meshStandardMaterial 
          map={texture}
          color={materialProps.color}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>
    </group>
  );
};

// Faucet and Fixtures Component
const VanityFaucet: React.FC<{
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeFaucet: boolean;
  faucetStyle: 'modern' | 'traditional' | 'waterfall';
  faucetFinish: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold';
}> = ({
  vanityWidth,
  vanityHeight,
  vanityDepth,
  includeFaucet,
  faucetStyle,
  faucetFinish,
}) => {
  if (!includeFaucet) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Get finish color
  const getFinishColor = () => {
    switch (faucetFinish) {
      case 'chrome': return '#e0e0e0';
      case 'brushed-nickel': return '#b8b8b0';
      case 'matte-black': return '#2a2a2a';
      case 'gold': return '#d4af37';
      default: return '#e0e0e0';
    }
  };

  const getMaterialProps = () => {
    const color = getFinishColor();
    switch (faucetFinish) {
      case 'chrome':
        return { color, metalness: 0.95, roughness: 0.05 };
      case 'brushed-nickel':
        return { color, metalness: 0.85, roughness: 0.25 };
      case 'matte-black':
        return { color, metalness: 0.3, roughness: 0.8 };
      case 'gold':
        return { color, metalness: 0.9, roughness: 0.15 };
      default:
        return { color, metalness: 0.95, roughness: 0.05 };
    }
  };

  const materialProps = getMaterialProps();

  // Faucet positioned on top of vanity, slightly back from front edge
  const faucetPosition: [number, number, number] = [
    0, // Center horizontally
    scaledHeight + 0.02, // Just above vanity top
    -scaledDepth * 0.2 // Slightly back from front edge
  ];

  if (faucetStyle === 'modern') {
    // Modern single-hole faucet with tall spout
    return (
      <group position={faucetPosition}>
        {/* Base plate */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout column */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.3, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout neck (curved) */}
        <mesh position={[0, 0.3, 0.05]} rotation={[Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.015, 0.15, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout tip */}
        <mesh position={[0, 0.35, 0.12]} rotation={[Math.PI / 3, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.012, 0.05, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Handle lever */}
        <mesh position={[-0.06, 0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.015, 0.02]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Sink basin (white ceramic) */}
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.22, 0.1, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
        </mesh>
      </group>
    );
  }

  if (faucetStyle === 'traditional') {
    // Traditional widespread faucet with separate hot/cold handles
    return (
      <group position={faucetPosition}>
        {/* Left handle (hot) */}
        <group position={[-0.15, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Cross handle */}
          <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Right handle (cold) */}
        <group position={[0.15, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Cross handle */}
          <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.01]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Center spout */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          {/* Curved spout */}
          <mesh position={[0, 0.2, 0.08]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.15, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.25, 0.15]} rotation={[Math.PI / 2.5, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.012, 0.05, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Sink basin */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.28, 0.25, 0.1, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
        </mesh>
      </group>
    );
  }

  if (faucetStyle === 'waterfall') {
    // Waterfall faucet with wide flat spout
    return (
      <group position={faucetPosition}>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.12, 0.01, 0.08]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Vertical support */}
        <mesh position={[0, 0.15, -0.03]}>
          <boxGeometry args={[0.06, 0.3, 0.02]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Waterfall spout - wide and flat */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.06]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout opening */}
        <mesh position={[0, 0.27, 0.04]}>
          <boxGeometry args={[0.16, 0.01, 0.01]} />
          <meshStandardMaterial 
            color="#87CEEB" 
            transparent 
            opacity={0.6}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        
        {/* Side handles (minimalist levers) */}
        <mesh position={[-0.1, 0.2, -0.03]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.06, 0.012, 0.015]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0.1, 0.2, -0.03]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.06, 0.012, 0.015]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Rectangular vessel sink */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.4, 0.06, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.05} />
        </mesh>
      </group>
    );
  }

  return null;
};

// Bathroom Accessories Component
const BathroomAccessories: React.FC<{
  vanityWidth: number;
  vanityHeight: number;
  roomLength: number;
  roomWidth: number;
  includeTowelBar: boolean;
  towelBarPosition: 'left' | 'right' | 'center';
  includeToiletPaperHolder: boolean;
  toiletPosition: 'left' | 'right';
  includeRobeHooks: boolean;
  robeHookCount: number;
  includeShelving: boolean;
  shelvingType: 'floating' | 'corner' | 'ladder';
}> = ({
  vanityWidth,
  vanityHeight,
  roomLength,
  roomWidth,
  includeTowelBar,
  towelBarPosition,
  includeToiletPaperHolder,
  toiletPosition,
  includeRobeHooks,
  robeHookCount,
  includeShelving,
  shelvingType,
}) => {
  const inchesToFeet = (inches: number) => inches * SCALE_FACTOR;
  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;

  // Towel Bar positioning
  const getTowelBarPosition = (): [number, number, number] => {
    const height = scaledHeight * 0.7;
    if (towelBarPosition === 'left') {
      return [-scaledWidth * 0.8, height, -inchesToFeet(roomWidth) / 2 + 0.1];
    } else if (towelBarPosition === 'right') {
      return [scaledWidth * 0.8, height, -inchesToFeet(roomWidth) / 2 + 0.1];
    } else {
      return [0, height, -inchesToFeet(roomWidth) / 2 + 0.1];
    }
  };

  // Toilet Paper Holder positioning (near toilet)
  const getToiletPaperHolderPosition = (): [number, number, number] => {
    const x = toiletPosition === 'left' 
      ? -inchesToFeet(roomWidth) / 2 + 0.4 
      : inchesToFeet(roomWidth) / 2 - 0.4;
    return [x, 0.5, -inchesToFeet(roomLength) / 2 + 0.9];
  };

  return (
    <group>
      {/* Towel Bar */}
      {includeTowelBar && (
        <group position={getTowelBarPosition()}>
          {/* Wall mount brackets */}
          <mesh position={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Towel bar */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Towel draped on bar */}
          <mesh position={[0, -0.05, 0.02]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.5, 0.02, 0.3]} />
            <meshStandardMaterial color="#87CEEB" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* Toilet Paper Holder */}
      {includeToiletPaperHolder && (
        <group position={getToiletPaperHolderPosition()}>
          {/* Wall plate */}
          <mesh position={[0, 0, -0.02]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Arm */}
          <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.15, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Toilet paper roll */}
          <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Robe Hooks */}
      {includeRobeHooks && (
        <>
          {Array.from({ length: robeHookCount }).map((_, index) => {
            const spacing = 0.4;
            const startX = -(robeHookCount - 1) * spacing / 2;
            const x = startX + index * spacing;
            return (
              <group 
                key={`hook-${index}`} 
                position={[x, scaledHeight * 0.9, -inchesToFeet(roomWidth) / 2 + 0.1]}
              >
                {/* Wall plate */}
                <mesh position={[0, 0, -0.02]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Hook */}
                <mesh position={[0, -0.02, 0.03]} rotation={[Math.PI / 4, 0, 0]}>
                  <torusGeometry args={[0.04, 0.01, 16, 32, Math.PI]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {/* Shelving Units */}
      {includeShelving && (
        <group>
          {shelvingType === 'floating' && (
            <>
              {/* Two floating shelves above toilet area */}
              {[0, 1].map((index) => {
                const x = toiletPosition === 'left' 
                  ? -inchesToFeet(roomWidth) / 2 + 0.6 
                  : inchesToFeet(roomWidth) / 2 - 0.6;
                const y = scaledHeight + 0.3 + index * 0.4;
                return (
                  <group key={`shelf-${index}`} position={[x, y, -inchesToFeet(roomLength) / 2 + 0.5]}>
                    {/* Shelf */}
                    <mesh>
                      <boxGeometry args={[0.6, 0.02, 0.25]} />
                      <meshStandardMaterial color="#8b7355" roughness={0.5} />
                    </mesh>
                    {/* Decorative items */}
                    <mesh position={[-0.15, 0.05, 0]}>
                      <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
                      <meshStandardMaterial color="#87CEEB" roughness={0.3} />
                    </mesh>
                  </group>
                );
              })}
            </>
          )}

          {shelvingType === 'corner' && (
            <>
              {/* Corner shelf unit */}
              {[0, 1, 2].map((index) => {
                const cornerX = toiletPosition === 'left' 
                  ? -inchesToFeet(roomWidth) / 2 + 0.2 
                  : inchesToFeet(roomWidth) / 2 - 0.2;
                const y = scaledHeight + 0.2 + index * 0.35;
                return (
                  <group 
                    key={`corner-shelf-${index}`} 
                    position={[cornerX, y, -inchesToFeet(roomLength) / 2 + 0.2]}
                    rotation={[0, toiletPosition === 'left' ? Math.PI / 4 : -Math.PI / 4, 0]}
                  >
                    <mesh>
                      <boxGeometry args={[0.35, 0.02, 0.35]} />
                      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
                    </mesh>
                  </group>
                );
              })}
            </>
          )}

          {shelvingType === 'ladder' && (
            <group 
              position={[
                toiletPosition === 'left' ? inchesToFeet(roomWidth) / 2 - 0.4 : -inchesToFeet(roomWidth) / 2 + 0.4,
                scaledHeight / 2,
                inchesToFeet(roomLength) / 2 - 0.3
              ]}
            >
              {/* Ladder sides */}
              <mesh position={[-0.15, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, scaledHeight * 2, 16]} />
                <meshStandardMaterial color="#8b7355" roughness={0.6} />
              </mesh>
              <mesh position={[0.15, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, scaledHeight * 2, 16]} />
                <meshStandardMaterial color="#8b7355" roughness={0.6} />
              </mesh>
              {/* Rungs/Shelves */}
              {[0, 1, 2, 3].map((index) => (
                <mesh 
                  key={`rung-${index}`} 
                  position={[0, -scaledHeight * 0.7 + index * 0.4, 0]} 
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.3, 16]} />
                  <meshStandardMaterial color="#8b7355" roughness={0.6} />
                </mesh>
              ))}
              {/* Towels on ladder */}
              <mesh position={[0, 0.2, 0.05]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.25, 0.02, 0.35]} />
                <meshStandardMaterial color="#f0e68c" roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
};

// Mirror and Medicine Cabinet Component
const MirrorCabinet: React.FC<{
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeMirror: boolean;
  mirrorType: 'mirror' | 'medicine-cabinet';
  mirrorSize: 'small' | 'medium' | 'large';
  mirrorShape: 'rectangular' | 'round' | 'oval' | 'arched';
  mirrorFrame: 'none' | 'black' | 'chrome' | 'gold' | 'wood';
}> = ({
  vanityWidth,
  vanityHeight,
  vanityDepth,
  includeMirror,
  mirrorType,
  mirrorSize,
  mirrorShape,
  mirrorFrame,
}) => {
  if (!includeMirror) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Mirror dimensions based on size
  const getMirrorWidth = () => {
    switch (mirrorSize) {
      case 'small': return 24 * SCALE_FACTOR;
      case 'medium': return 36 * SCALE_FACTOR;
      case 'large': return 48 * SCALE_FACTOR;
      default: return 36 * SCALE_FACTOR;
    }
  };

  const getMirrorHeight = () => {
    switch (mirrorSize) {
      case 'small': return 28 * SCALE_FACTOR;
      case 'medium': return 36 * SCALE_FACTOR;
      case 'large': return 42 * SCALE_FACTOR;
      default: return 36 * SCALE_FACTOR;
    }
  };

  const mirrorWidth = getMirrorWidth();
  const mirrorHeight = getMirrorHeight();
  const mirrorDepth = mirrorType === 'medicine-cabinet' ? 0.1 : 0.02;

  // Position above vanity
  const yPosition = scaledHeight + mirrorHeight / 2 + 0.2;
  const zPosition = -scaledDepth / 2 - 0.05;

  // Frame color based on style
  const getFrameColor = () => {
    switch (mirrorFrame) {
      case 'black': return '#000000';
      case 'chrome': return '#c0c0c0';
      case 'gold': return '#d4af37';
      case 'wood': return '#8b7355';
      default: return null;
    }
  };

  const frameColor = getFrameColor();
  const frameThickness = mirrorFrame === 'none' ? 0 : 0.05;

  return (
    <group position={[0, yPosition, zPosition]}>
      {/* Mirror/Cabinet body */}
      {mirrorShape === 'rectangular' || mirrorShape === 'arched' ? (
        <>
          {/* Main mirror surface */}
          <mesh castShadow>
            <boxGeometry args={[mirrorWidth, mirrorHeight, mirrorDepth]} />
            <meshPhysicalMaterial
              color="#e8e8e8"
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Arched top overlay */}
          {mirrorShape === 'arched' && (
            <mesh position={[0, mirrorHeight / 2.5, 0]}>
              <cylinderGeometry args={[mirrorWidth / 2, mirrorWidth / 2, mirrorDepth, 32, 1, false, 0, Math.PI]} />
              <meshPhysicalMaterial
                color="#e8e8e8"
                metalness={0.95}
                roughness={0.05}
                envMapIntensity={1.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          )}

          {/* Frame */}
          {frameColor && (
            <>
              {/* Top frame */}
              <mesh position={[0, mirrorHeight / 2 + frameThickness / 2, 0]}>
                <boxGeometry args={[mirrorWidth + frameThickness * 2, frameThickness, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Bottom frame */}
              <mesh position={[0, -mirrorHeight / 2 - frameThickness / 2, 0]}>
                <boxGeometry args={[mirrorWidth + frameThickness * 2, frameThickness, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Left frame */}
              <mesh position={[-mirrorWidth / 2 - frameThickness / 2, 0, 0]}>
                <boxGeometry args={[frameThickness, mirrorHeight + frameThickness * 2, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Right frame */}
              <mesh position={[mirrorWidth / 2 + frameThickness / 2, 0, 0]}>
                <boxGeometry args={[frameThickness, mirrorHeight + frameThickness * 2, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
            </>
          )}
        </>
      ) : (
        <>
          {/* Round or Oval mirror */}
          <mesh castShadow rotation={[0, 0, mirrorShape === 'oval' ? 0 : 0]}>
            {mirrorShape === 'round' ? (
              <cylinderGeometry args={[mirrorWidth / 2, mirrorWidth / 2, mirrorDepth, 32]} />
            ) : (
              <cylinderGeometry args={[mirrorWidth / 2, mirrorHeight / 2.5, mirrorDepth, 32]} />
            )}
            <meshPhysicalMaterial
              color="#e8e8e8"
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Frame for round/oval */}
          {frameColor && (
            <mesh rotation={[0, 0, 0]}>
              {mirrorShape === 'round' ? (
                <torusGeometry args={[mirrorWidth / 2 + frameThickness / 2, frameThickness, 16, 32]} />
              ) : (
                <torusGeometry args={[mirrorWidth / 2 + frameThickness / 2, frameThickness, 16, 32]} />
              )}
              <meshStandardMaterial 
                color={frameColor} 
                metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
              />
            </mesh>
          )}
        </>
      )}

      {/* Medicine cabinet features */}
      {mirrorType === 'medicine-cabinet' && mirrorShape === 'rectangular' && (
        <>
          {/* Shelves inside */}
          <mesh position={[0, mirrorHeight / 4, mirrorDepth / 2]}>
            <boxGeometry args={[mirrorWidth - 0.1, 0.02, 0.08]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, -mirrorHeight / 4, mirrorDepth / 2]}>
            <boxGeometry args={[mirrorWidth - 0.1, 0.02, 0.08]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          
          {/* Handle */}
          <mesh position={[mirrorWidth / 3, 0, -mirrorDepth / 2 - 0.02]}>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Countertop Component with different materials and edge profiles
const Countertop: React.FC<{
  width: number;
  height: number;
  depth: number;
  material: 'marble' | 'quartz' | 'granite';
  edge: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  color: string;
}> = ({ width, height, depth, material, edge, color }) => {
  const scaledWidth = width * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  const scaledDepth = depth * SCALE_FACTOR;
  const thickness = 0.05;

  // Get material color
  const getMaterialColor = () => {
    const colors: { [key: string]: string } = {
      'white': '#FAFAFA',
      'cream': '#F5F5DC',
      'gray': '#8B8B8B',
      'black': '#2B2B2B',
      'beige': '#D4C5B9',
      'brown': '#6B5B4D'
    };
    return colors[color] || '#FAFAFA';
  };

  // Get material properties
  const getMaterialProps = () => {
    const baseColor = getMaterialColor();
    
    switch (material) {
      case 'marble':
        return {
          color: baseColor,
          roughness: 0.1,
          metalness: 0.4,
          envMapIntensity: 1.5
        };
      case 'quartz':
        return {
          color: baseColor,
          roughness: 0.15,
          metalness: 0.3,
          envMapIntensity: 1.2
        };
      case 'granite':
        return {
          color: baseColor,
          roughness: 0.2,
          metalness: 0.35,
          envMapIntensity: 1.3
        };
      default:
        return {
          color: baseColor,
          roughness: 0.15,
          metalness: 0.3,
          envMapIntensity: 1.2
        };
    }
  };

  // Create texture based on material
  const materialTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const baseColorRgb = new THREE.Color(getMaterialColor());
    ctx.fillStyle = baseColorRgb.getStyle();
    ctx.fillRect(0, 0, 512, 512);

    if (material === 'marble') {
      // Add marble veining
      ctx.strokeStyle = new THREE.Color(baseColorRgb).multiplyScalar(0.85).getStyle();
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512;
        const startY = Math.random() * 512;
        ctx.moveTo(startX, startY);
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            startX + (Math.random() - 0.5) * 200,
            startY + j * 100 + (Math.random() - 0.5) * 80
          );
        }
        ctx.stroke();
      }
    } else if (material === 'granite') {
      // Add granite speckles
      const imageData = ctx.getImageData(0, 0, 512, 512);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() > 0.97) {
          const brightness = Math.random() > 0.5 ? 40 : -40;
          imageData.data[i] += brightness;
          imageData.data[i + 1] += brightness;
          imageData.data[i + 2] += brightness;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (material === 'quartz') {
      // Add subtle quartz shimmer
      const imageData = ctx.getImageData(0, 0, 512, 512);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() > 0.98) {
          const shimmer = 30;
          imageData.data[i] += shimmer;
          imageData.data[i + 1] += shimmer;
          imageData.data[i + 2] += shimmer;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, [material, color]);

  const matProps = getMaterialProps();

  if (edge === 'waterfall') {
    // Waterfall edge - countertop extends down the sides
    return (
      <group>
        {/* Main top surface */}
        <mesh position={[0, scaledHeight + thickness / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[scaledWidth + 0.1, thickness, scaledDepth + 0.1]} />
          <meshStandardMaterial 
            map={materialTexture}
            {...matProps}
          />
        </mesh>
        
        {/* Left waterfall edge */}
        <mesh 
          position={[-scaledWidth / 2 - 0.05, scaledHeight / 2, 0]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[thickness, scaledHeight, scaledDepth + 0.1]} />
          <meshStandardMaterial 
            map={materialTexture}
            {...matProps}
          />
        </mesh>
        
        {/* Right waterfall edge */}
        <mesh 
          position={[scaledWidth / 2 + 0.05, scaledHeight / 2, 0]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[thickness, scaledHeight, scaledDepth + 0.1]} />
          <meshStandardMaterial 
            map={materialTexture}
            {...matProps}
          />
        </mesh>
      </group>
    );
  }

  // For other edge types, create custom geometry with edge profile
  const countertopGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = (scaledWidth + 0.1) / 2;
    const d = (scaledDepth + 0.1) / 2;
    
    // Create the top rectangle
    shape.moveTo(-w, -d);
    shape.lineTo(w, -d);
    shape.lineTo(w, d);
    shape.lineTo(-w, d);
    shape.closePath();
    
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: edge !== 'straight',
      bevelThickness: edge === 'bullnose' ? 0.02 : 0.01,
      bevelSize: edge === 'bullnose' ? 0.02 : 0.01,
      bevelOffset: 0,
      bevelSegments: edge === 'bullnose' ? 8 : 3
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [scaledWidth, scaledDepth, edge, thickness]);

  return (
    <mesh 
      geometry={countertopGeometry}
      position={[0, scaledHeight + thickness / 2, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial 
        map={materialTexture}
        {...matProps}
      />
    </mesh>
  );
};

interface VanityBoxProps extends Vanity3DPreviewProps {
  measurementMode: boolean;
  onMeasurementClick: (type: MeasurementType) => void;
  activeMeasurement: MeasurementType;
}

const VanityBox = ({ 
  width, 
  height, 
  depth, 
  brand, 
  finish, 
  doorStyle, 
  numDrawers, 
  handleStyle, 
  cabinetPosition = "left", 
  measurementMode, 
  onMeasurementClick, 
  activeMeasurement,
  countertopMaterial = 'quartz',
  countertopEdge = 'straight',
  countertopColor = 'white'
}: VanityBoxProps) => {
  // Scale dimensions for better visualization
  const scaledWidth = width * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  const scaledDepth = depth * SCALE_FACTOR;

  // Get material properties based on finish
  const materialProps = useMemo(() => getMaterialProps(brand, finish), [brand, finish]);

  // Material thickness
  const thickness = 0.05;

  // Create procedural wood grain texture
  const woodTexture = useMemo(() => {
    if (materialProps.type !== 'wood') return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Create wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    const baseColorRgb = new THREE.Color(materialProps.color);
    const darkColor = baseColorRgb.clone().multiplyScalar(0.7);
    const lightColor = baseColorRgb.clone().multiplyScalar(1.2);
    
    gradient.addColorStop(0, `rgb(${darkColor.r * 255}, ${darkColor.g * 255}, ${darkColor.b * 255})`);
    gradient.addColorStop(0.5, `rgb(${baseColorRgb.r * 255}, ${baseColorRgb.g * 255}, ${baseColorRgb.b * 255})`);
    gradient.addColorStop(1, `rgb(${lightColor.r * 255}, ${lightColor.g * 255}, ${lightColor.b * 255})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add noise for grain texture
    const imageData = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [materialProps.color, materialProps.type]);

  // Create bump map for surface detail
  const bumpMap = useMemo(() => {
    if (materialProps.bumpScale === 0) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Create noise pattern for bump
    const imageData = ctx.createImageData(256, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, [materialProps.bumpScale]);

  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (type: MeasurementType) => {
    if (measurementMode) {
      onMeasurementClick(type);
    }
  };

  return (
    <group>
      {/* Measurement lines */}
      {activeMeasurement === 'height' && (
        <MeasurementLine
          start={[scaledWidth / 2 + 0.2, 0, 0]}
          end={[scaledWidth / 2 + 0.2, scaledHeight, 0]}
          label={`${height.toFixed(1)}"`}
          color="#00ff00"
        />
      )}
      {activeMeasurement === 'width' && (
        <MeasurementLine
          start={[-scaledWidth / 2, scaledHeight + 0.15, scaledDepth / 2 + 0.2]}
          end={[scaledWidth / 2, scaledHeight + 0.15, scaledDepth / 2 + 0.2]}
          label={`${width.toFixed(1)}"`}
          color="#0099ff"
        />
      )}
      {activeMeasurement === 'depth' && (
        <MeasurementLine
          start={[scaledWidth / 2 + 0.2, scaledHeight / 2, -scaledDepth / 2]}
          end={[scaledWidth / 2 + 0.2, scaledHeight / 2, scaledDepth / 2]}
          label={`${depth.toFixed(1)}"`}
          color="#ff9900"
        />
      )}
      {activeMeasurement === 'door' && doorStyle === 'single' && (
        <>
          <MeasurementLine
            start={[-scaledWidth * 0.475, scaledHeight * 0.95, scaledDepth / 2 + 0.05]}
            end={[scaledWidth * 0.475, scaledHeight * 0.95, scaledDepth / 2 + 0.05]}
            label={`${(width * 0.95).toFixed(1)}"`}
            color="#ff00ff"
          />
          <MeasurementLine
            start={[scaledWidth * 0.48, scaledHeight * 0.05, scaledDepth / 2 + 0.05]}
            end={[scaledWidth * 0.48, scaledHeight * 0.9, scaledDepth / 2 + 0.05]}
            label={`${(height * 0.85).toFixed(1)}"`}
            color="#ff00ff"
          />
        </>
      )}

      {/* Main cabinet body */}
      <mesh 
        ref={meshRef}
        position={[0, scaledHeight / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => handleClick('height')}
        onPointerOver={(e) => {
          if (measurementMode) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[scaledWidth, scaledHeight, scaledDepth]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
        />
      </mesh>

      {/* Countertop with custom material and edge */}
      <Countertop
        width={width}
        height={height}
        depth={depth}
        material={countertopMaterial}
        edge={countertopEdge}
        color={countertopColor}
      />

      {/* Door/Drawer Configuration */}
      {doorStyle === 'single' && (
        <>
          <mesh 
            position={[0, scaledHeight / 2, scaledDepth / 2 + 0.01]} 
            castShadow
            onClick={() => handleClick('door')}
            onPointerOver={(e) => {
              if (measurementMode) {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[scaledWidth * 0.95, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
        </>
      )}

      {doorStyle === 'double' && (
        <>
          <mesh position={[-scaledWidth * 0.25, scaledHeight / 2, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          <mesh position={[scaledWidth * 0.25, scaledHeight / 2, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
          {handleStyle === 'knob' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
        </>
      )}

      {doorStyle === 'drawers' && (
        <>
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.9) / numDrawers;
            const drawerY = scaledHeight * 0.05 + drawerHeight * i + drawerHeight / 2;
            return (
              <group key={i}>
                <mesh position={[0, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.95, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh position={[0, drawerY, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.01, 0.01, Math.min(0.2, scaledWidth * 0.4), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <>
                    <mesh position={[-scaledWidth * 0.15, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.02, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                    <mesh position={[scaledWidth * 0.15, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.02, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
        </>
      )}

      {doorStyle === 'mixed' && (
        <>
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.45) / numDrawers;
            const drawerY = scaledHeight * 0.5 + drawerHeight * i + drawerHeight / 2;
            return (
              <group key={`drawer-${i}`}>
                <mesh position={[0, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.95, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh position={[0, drawerY, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.008, 0.008, Math.min(0.15, scaledWidth * 0.3), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <>
                    <mesh position={[-scaledWidth * 0.12, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.018, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                    <mesh position={[scaledWidth * 0.12, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.018, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
          <mesh position={[-scaledWidth * 0.25, scaledHeight * 0.225, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.4, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          <mesh position={[scaledWidth * 0.25, scaledHeight * 0.225, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.4, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight * 0.225, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.12, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight * 0.225, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.12, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
          {handleStyle === 'knob' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight * 0.225, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.022, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight * 0.225, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.022, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Door + Drawer Side-by-Side */}
      {doorStyle === 'door-drawer-split' && (
        <>
          {/* Cabinet side (door) */}
          <mesh 
            position={[
              cabinetPosition === 'left' ? -scaledWidth * 0.25 : scaledWidth * 0.25, 
              scaledHeight / 2, 
              scaledDepth / 2 + 0.01
            ]} 
            castShadow
          >
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.03
              ]} 
              rotation={[0, 0, Math.PI / 2]} 
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.04
              ]} 
              castShadow
            >
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          
          {/* Drawer side */}
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.9) / numDrawers;
            const drawerY = scaledHeight * 0.05 + drawerHeight * i + drawerHeight / 2;
            const drawerX = cabinetPosition === 'left' ? scaledWidth * 0.25 : -scaledWidth * 0.25;
            return (
              <group key={`drawer-split-${i}`}>
                <mesh position={[drawerX, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.45, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh 
                    position={[drawerX, drawerY, scaledDepth / 2 + 0.03]} 
                    rotation={[0, 0, Math.PI / 2]} 
                    castShadow
                  >
                    <cylinderGeometry args={[0.008, 0.008, Math.min(0.15, scaledWidth * 0.3), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <mesh position={[drawerX, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                    <sphereGeometry args={[0.018, 16, 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
              </group>
            );
          })}
        </>
      )}

      {/* Door + Open Shelf Side-by-Side */}
      {doorStyle === 'door-shelf-split' && (
        <>
          {/* Cabinet side (door) */}
          <mesh 
            position={[
              cabinetPosition === 'left' ? -scaledWidth * 0.25 : scaledWidth * 0.25, 
              scaledHeight / 2, 
              scaledDepth / 2 + 0.01
            ]} 
            castShadow
          >
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.03
              ]} 
              rotation={[0, 0, Math.PI / 2]} 
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.04
              ]} 
              castShadow
            >
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          
          {/* Open shelf side - 2 shelves */}
          {[0.33, 0.67].map((ratio, i) => {
            const shelfY = scaledHeight * ratio;
            const shelfX = cabinetPosition === 'left' ? scaledWidth * 0.25 : -scaledWidth * 0.25;
            return (
              <mesh 
                key={`shelf-${i}`}
                position={[shelfX, shelfY, 0]} 
                castShadow
              >
                <boxGeometry args={[scaledWidth * 0.44, 0.02, scaledDepth * 0.95]} />
                <meshStandardMaterial 
                  color={materialProps.color}
                  map={woodTexture}
                  roughness={materialProps.roughness}
                  metalness={materialProps.metalness}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Open Shelves Only */}
      {doorStyle === 'open-shelves' && (
        <>
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const shelfY = scaledHeight * ratio;
            return (
              <mesh 
                key={`open-shelf-${i}`}
                position={[0, shelfY, 0]} 
                castShadow
              >
                <boxGeometry args={[scaledWidth * 0.95, 0.02, scaledDepth * 0.95]} />
                <meshStandardMaterial 
                  color={materialProps.color}
                  map={woodTexture}
                  roughness={materialProps.roughness}
                  metalness={materialProps.metalness}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Side panels */}
      <mesh 
        position={[-scaledWidth / 2 - 0.005, scaledHeight / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => handleClick('depth')}
        onPointerOver={(e) => {
          if (measurementMode) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>
      <mesh position={[scaledWidth / 2 + 0.005, scaledHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>
    </group>
  );
};

const DimensionLabels = ({ width, height, depth }: { width: number; height: number; depth: number }) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
      <div className="text-center">
        <div className="text-muted-foreground">Width</div>
        <div className="font-semibold">{width.toFixed(2)}"</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Height</div>
        <div className="font-semibold">{height.toFixed(2)}"</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Depth</div>
        <div className="font-semibold">{depth.toFixed(2)}"</div>
      </div>
    </div>
  );
};

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
  backsplashHeight = '4-inch'
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
      console.error("Screenshot error:", error);
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
      <div className={`w-full ${fullscreen ? 'h-full' : 'aspect-square'} bg-secondary/20 rounded-lg flex items-center justify-center`}>
        <p className="text-muted-foreground text-sm">Enter dimensions to see preview</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${fullscreen ? 'h-full' : 'aspect-square'} bg-gradient-to-br from-secondary/10 to-secondary/30 rounded-lg overflow-hidden border border-border`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant={measurementMode ? "default" : "outline"}
          size="sm"
          onClick={toggleMeasurementMode}
          className="shadow-lg"
        >
          <Ruler className="w-4 h-4 mr-2" />
          {measurementMode ? "Measuring" : "Measure"}
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
          <Room
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
          <LightingFixtures
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
          <VanityBox 
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
          {materialType === 'glossy' && '💎 High Gloss'}
          {materialType === 'matte' && '🎨 Matte Finish'}
        </p>
      </div>
      
      {/* Print-only specs */}
      <div className="hidden print:block absolute top-4 right-4 bg-background p-4 rounded-lg shadow-lg border border-border max-w-xs">
        <h3 className="font-bold text-lg mb-3">Vanity Specifications</h3>
        <ul className="text-sm space-y-2">
          <li><strong>Dimensions:</strong> {width}" W × {height}" H × {depth}" D</li>
          <li><strong>Brand:</strong> {brand}</li>
          <li><strong>Finish:</strong> {finish}</li>
          <li><strong>Door Style:</strong> {doorStyle}</li>
          {doorStyle === 'drawers' && <li><strong>Drawers:</strong> {numDrawers}</li>}
          <li><strong>Handle:</strong> {handleStyle}</li>
          <li className="pt-2 text-xs text-muted-foreground">Generated: {new Date().toLocaleDateString()}</li>
        </ul>
      </div>
    </div>
  );
};
