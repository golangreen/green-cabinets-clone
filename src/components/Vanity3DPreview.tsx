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

interface VanityBoxProps extends Vanity3DPreviewProps {
  measurementMode: boolean;
  onMeasurementClick: (type: MeasurementType) => void;
  activeMeasurement: MeasurementType;
}

const VanityBox = ({ width, height, depth, brand, finish, doorStyle, numDrawers, handleStyle, cabinetPosition = "left", measurementMode, onMeasurementClick, activeMeasurement }: VanityBoxProps) => {
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

      {/* Top countertop (marble/stone appearance) */}
      <mesh 
        position={[0, scaledHeight + thickness / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => handleClick('width')}
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
        <boxGeometry args={[scaledWidth + 0.1, thickness, scaledDepth + 0.1]} />
        <meshStandardMaterial 
          color="#FAFAFA"
          roughness={0.15}
          metalness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>

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

export const Vanity3DPreview = ({ width, height, depth, brand, finish, doorStyle, numDrawers, handleStyle, cabinetPosition = "left", fullscreen = false }: Vanity3DPreviewProps) => {
  const [measurementMode, setMeasurementMode] = useState(false);
  const [activeMeasurement, setActiveMeasurement] = useState<MeasurementType>(null);
  const [zoom, setZoom] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
          onClick={() => setZoom(3)}
          className="shadow-lg h-10 w-10 p-0"
          title="Reset zoom"
        >
          <span className="text-sm">⟲</span>
        </Button>
      </div>
      
      <Canvas shadows onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
      }}>
        <PerspectiveCamera makeDefault position={[zoom, zoom * 0.7, zoom]} />
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
        
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        
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
        />
      </Canvas>
      
      <DimensionLabels width={width} height={height} depth={depth} />
      
      <div className="absolute top-4 left-4 right-32 flex flex-col items-center gap-2">
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
