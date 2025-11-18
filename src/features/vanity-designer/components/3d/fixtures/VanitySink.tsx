import React from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR } from '../MaterialUtils';

interface VanitySinkProps {
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  sinkStyle: 'undermount' | 'vessel' | 'integrated';
  sinkShape: 'oval' | 'rectangular' | 'square';
}

export const VanitySink: React.FC<VanitySinkProps> = ({ 
  vanityWidth, 
  vanityHeight, 
  vanityDepth, 
  sinkStyle, 
  sinkShape 
}) => {
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
      const width = sinkDims.width;
      const depth = sinkDims.depth;
      
      return (
        <group position={position}>
          {/* Outer vessel */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, sinkDepthValue, depth]} />
            <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} />
          </mesh>
          {/* Inner cavity */}
          <mesh position={[0, 0.02, 0]}>
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
    // Integrated sink - part of countertop, no seam
    const position: [number, number, number] = [
      0,
      scaledHeight - sinkDepthValue / 2 + 0.02,
      -scaledDepth * 0.15
    ];

    if (sinkShape === 'oval') {
      return (
        <group position={position}>
          {/* Seamless basin */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[sinkDims.width / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.08} metalness={0.02} />
          </mesh>
          {/* Drain */}
          <mesh position={[0, -sinkDepthValue / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    } else {
      const width = sinkDims.width;
      const depth = sinkDims.depth;
      
      return (
        <group position={position}>
          {/* Seamless basin */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, sinkDepthValue, depth]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.08} metalness={0.02} />
          </mesh>
          {/* Inner surface */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[width - 0.02, sinkDepthValue - 0.02, depth - 0.02]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.1} metalness={0.01} />
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

  return null;
};
