import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR } from '../MaterialUtils';

interface VanityBacksplashProps {
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeBacksplash: boolean;
  backsplashMaterial: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone';
  backsplashHeight: '4-inch' | 'full-height';
  mirrorHeight?: number;
}

export const VanityBacksplash: React.FC<VanityBacksplashProps> = ({ 
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

    return new THREE.CanvasTexture(canvas);
  }, [backsplashMaterial, materialProps]);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[scaledWidth, backsplashHeightValue, 0.02]} />
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
