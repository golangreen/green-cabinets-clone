import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useMemo } from "react";

interface Vanity3DPreviewProps {
  width: number;
  height: number;
  depth: number;
  brand: string;
}

// Convert inches to a normalized scale for 3D visualization
const SCALE_FACTOR = 0.02;

const VanityBox = ({ width, height, depth, brand }: Vanity3DPreviewProps) => {
  // Scale dimensions for better visualization
  const scaledWidth = width * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  const scaledDepth = depth * SCALE_FACTOR;

  // Brand colors
  const brandColors: { [key: string]: string } = {
    'Tafisa': '#8B7355',
    'Egger': '#6B5B4D',
    'Shinnoki': '#9B8B7E',
  };

  const color = brandColors[brand] || '#8B7355';

  // Material thickness
  const thickness = 0.05;

  return (
    <group>
      {/* Main cabinet body */}
      <mesh position={[0, scaledHeight / 2, 0]}>
        <boxGeometry args={[scaledWidth, scaledHeight, scaledDepth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>

      {/* Top countertop (slightly larger and different color) */}
      <mesh position={[0, scaledHeight + thickness / 2, 0]}>
        <boxGeometry args={[scaledWidth + 0.1, thickness, scaledDepth + 0.1]} />
        <meshStandardMaterial 
          color="#E5E5E5" 
          roughness={0.1} 
          metalness={0.5}
        />
      </mesh>

      {/* Door panels (front) */}
      <mesh position={[0, scaledHeight / 2, scaledDepth / 2 + 0.01]}>
        <boxGeometry args={[scaledWidth * 0.95, scaledHeight * 0.9, 0.02]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.2}
        />
      </mesh>

      {/* Side panels detail */}
      <mesh position={[-scaledWidth / 2 - 0.005, scaledHeight / 2, 0]}>
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[scaledWidth / 2 + 0.005, scaledHeight / 2, 0]}>
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>

      {/* Hardware - handles */}
      <mesh position={[scaledWidth * 0.3, scaledHeight * 0.6, scaledDepth / 2 + 0.03]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          roughness={0.1} 
          metalness={0.9}
        />
      </mesh>
      <mesh position={[-scaledWidth * 0.3, scaledHeight * 0.6, scaledDepth / 2 + 0.03]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          roughness={0.1} 
          metalness={0.9}
        />
      </mesh>
    </group>
  );
};

const DimensionLabels = ({ width, height, depth }: Omit<Vanity3DPreviewProps, 'brand'>) => {
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

export const Vanity3DPreview = ({ width, height, depth, brand }: Vanity3DPreviewProps) => {
  // Only render if we have valid dimensions
  const hasValidDimensions = useMemo(() => {
    return width > 0 && height > 0 && depth > 0;
  }, [width, height, depth]);

  if (!hasValidDimensions) {
    return (
      <div className="w-full aspect-square bg-secondary/20 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Enter dimensions to see preview</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-secondary/10 to-secondary/30 rounded-lg overflow-hidden border border-border">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[3, 2, 3]} />
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Lighting */}
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
        
        {/* Environment for reflections */}
        <Environment preset="apartment" />
        
        {/* Ground plane */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        
        {/* Vanity model */}
        <VanityBox width={width} height={height} depth={depth} brand={brand} />
      </Canvas>
      
      {/* Dimension labels */}
      <DimensionLabels width={width} height={height} depth={depth} />
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 right-4 text-center">
        <p className="text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block border border-border">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
};
