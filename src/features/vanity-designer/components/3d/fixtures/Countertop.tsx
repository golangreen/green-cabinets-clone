import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR } from '../MaterialUtils';

interface CountertopProps {
  width: number;
  height: number;
  depth: number;
  material: 'marble' | 'quartz' | 'granite';
  edge: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  color: string;
}

export const Countertop: React.FC<CountertopProps> = ({ 
  width, 
  height, 
  depth, 
  material, 
  edge, 
  color 
}) => {
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

  const materialProps = getMaterialProps();

  // Main countertop position
  const yPosition = scaledHeight + thickness / 2;

  if (edge === 'waterfall') {
    // Waterfall edge - extends down both sides
    return (
      <group>
        {/* Main countertop surface */}
        <mesh position={[0, yPosition, 0]} castShadow receiveShadow>
          <boxGeometry args={[scaledWidth, thickness, scaledDepth]} />
          <meshPhysicalMaterial 
            map={materialTexture}
            {...materialProps}
          />
        </mesh>
        
        {/* Left waterfall edge */}
        <mesh 
          position={[-scaledWidth / 2, scaledHeight / 2, 0]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[thickness, scaledHeight, scaledDepth]} />
          <meshPhysicalMaterial 
            map={materialTexture}
            {...materialProps}
          />
        </mesh>
        
        {/* Right waterfall edge */}
        <mesh 
          position={[scaledWidth / 2, scaledHeight / 2, 0]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[thickness, scaledHeight, scaledDepth]} />
          <meshPhysicalMaterial 
            map={materialTexture}
            {...materialProps}
          />
        </mesh>
      </group>
    );
  }

  // Standard edges (straight, beveled, bullnose)
  return (
    <group>
      {/* Main countertop */}
      <mesh position={[0, yPosition, 0]} castShadow receiveShadow>
        <boxGeometry args={[scaledWidth, thickness, scaledDepth]} />
        <meshPhysicalMaterial 
          map={materialTexture}
          {...materialProps}
        />
      </mesh>
      
      {/* Edge detail based on type */}
      {edge === 'beveled' && (
        <>
          {/* Front beveled edge */}
          <mesh 
            position={[0, yPosition + thickness / 2, scaledDepth / 2]} 
            rotation={[Math.PI / 6, 0, 0]}
          >
            <boxGeometry args={[scaledWidth, 0.01, 0.03]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </>
      )}
      
      {edge === 'bullnose' && (
        <>
          {/* Front rounded edge */}
          <mesh 
            position={[0, yPosition, scaledDepth / 2]} 
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[thickness / 2, thickness / 2, scaledWidth, 32]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </>
      )}
    </group>
  );
};
