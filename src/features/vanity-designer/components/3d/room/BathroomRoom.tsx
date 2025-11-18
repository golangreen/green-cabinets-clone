import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR } from '../MaterialUtils';

interface BathroomRoomProps {
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
}

const getFloorMaterial = (floorType: string, tileColor: string, woodFloorFinish: string) => {
  if (floorType === 'tile') {
    const tileColors: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'gray': '#808080',
      'beige': '#f5f5dc',
      'cream': '#fffdd0',
      'terracotta': '#e97451'
    };
    return {
      color: tileColors[tileColor] || '#ffffff',
      roughness: 0.3,
      metalness: 0.1,
    };
  } else {
    const woodColors: { [key: string]: string } = {
      'oak': '#c19a6b',
      'walnut': '#5c4033',
      'maple': '#d4a574',
      'cherry': '#8b4513',
      'mahogany': '#800000',
      'bamboo': '#e1c16e'
    };
    return {
      color: woodColors[woodFloorFinish] || '#c19a6b',
      roughness: 0.6,
      metalness: 0.0,
    };
  }
};

export const BathroomRoom: React.FC<BathroomRoomProps> = ({ 
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
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(scaledLength / 2, scaledWidth / 2);
    return texture;
  }, [floorType, floorMaterial.color, scaledLength, scaledWidth]);

  // Create wall texture (for tile walls)
  const wallTexture = useMemo(() => {
    if (wallFinishType !== 'tile') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base color
    ctx.fillStyle = wallMaterial.color;
    ctx.fillRect(0, 0, 512, 512);

    // Subway tile pattern
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;
    const tileWidth = 128;
    const tileHeight = 64;
    
    for (let y = 0; y < 512; y += tileHeight) {
      const offset = (y / tileHeight) % 2 === 0 ? 0 : tileWidth / 2;
      for (let x = -tileWidth / 2; x < 512; x += tileWidth) {
        ctx.strokeRect(x + offset, y, tileWidth, tileHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(scaledLength / 1.5, scaledHeight / 1.5);
    return texture;
  }, [wallFinishType, wallMaterial.color, scaledLength, scaledHeight]);

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
          {hasDoor ? (
            <>
              {/* Lower door section */}
              <mesh position={[-scaledLength / 2, scaledHeight * 0.3, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, scaledHeight * 0.6, scaledWidth * 0.4]} />
                <meshStandardMaterial color={wallMaterial.color} roughness={wallMaterial.roughness} metalness={wallMaterial.metalness} />
              </mesh>
              {/* Upper door section */}
              <mesh position={[-scaledLength / 2, scaledHeight * 0.8, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, scaledHeight * 0.4, scaledWidth * 0.4]} />
                <meshStandardMaterial color={wallMaterial.color} roughness={wallMaterial.roughness} metalness={wallMaterial.metalness} />
              </mesh>
              {/* Door frame */}
              <mesh position={[-scaledLength / 2 + 0.08, scaledHeight * 0.4, 0]}>
                <boxGeometry args={[0.06, scaledHeight * 0.8, scaledWidth * 0.28]} />
                <meshStandardMaterial color="#8b7355" roughness={0.7} />
              </mesh>
              {/* Door knob */}
              <mesh position={[-scaledLength / 2 + 0.12, scaledHeight * 0.4, scaledWidth * 0.08]} castShadow>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Side wall sections */}
              <mesh position={[-scaledLength / 2, scaledHeight / 2, scaledWidth * 0.3]} receiveShadow castShadow>
                <boxGeometry args={[0.1, scaledHeight, scaledWidth * 0.4]} />
                <meshStandardMaterial color={wallMaterial.color} roughness={wallMaterial.roughness} metalness={wallMaterial.metalness} />
              </mesh>
            </>
          ) : (
            <mesh position={[-scaledLength / 2, scaledHeight / 2, 0]} receiveShadow castShadow>
              <boxGeometry args={[0.1, scaledHeight, scaledWidth]} />
              <meshStandardMaterial 
                map={wallTexture}
                color={wallMaterial.color} 
                roughness={wallMaterial.roughness}
                metalness={wallMaterial.metalness}
              />
            </mesh>
          )}

          {/* Right wall */}
          {hasWindow ? (
            <>
              {/* Lower window section */}
              <mesh position={[scaledLength / 2, scaledHeight * 0.3, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, scaledHeight * 0.6, scaledWidth]} />
                <meshStandardMaterial color={wallMaterial.color} roughness={wallMaterial.roughness} metalness={wallMaterial.metalness} />
              </mesh>
              {/* Upper window section */}
              <mesh position={[scaledLength / 2, scaledHeight * 0.85, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.1, scaledHeight * 0.3, scaledWidth]} />
                <meshStandardMaterial color={wallMaterial.color} roughness={wallMaterial.roughness} metalness={wallMaterial.metalness} />
              </mesh>
              {/* Window frame */}
              <mesh position={[scaledLength / 2 - 0.06, scaledHeight * 0.6, 0]}>
                <boxGeometry args={[0.04, scaledHeight * 0.4, scaledWidth * 0.5]} />
                <meshStandardMaterial color="#f5f5f5" roughness={0.4} metalness={0.6} />
              </mesh>
              {/* Window glass */}
              <mesh position={[scaledLength / 2 - 0.04, scaledHeight * 0.6, 0]}>
                <boxGeometry args={[0.02, scaledHeight * 0.35, scaledWidth * 0.45]} />
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

          {/* Front wall (facing user) */}
          <mesh position={[0, scaledHeight / 2, scaledWidth / 2]} receiveShadow castShadow>
            <boxGeometry args={[scaledLength, scaledHeight, 0.1]} />
            <meshStandardMaterial 
              map={wallTexture}
              color={wallMaterial.color} 
              roughness={wallMaterial.roughness}
              metalness={wallMaterial.metalness}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
