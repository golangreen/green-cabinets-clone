import React from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR } from '../MaterialUtils';

interface LightingProps {
  lightingType: string;
  roomLength: number;
  roomWidth: number;
  roomHeight: number;
  brightness: number;
  colorTemperature: number;
}

export const Lighting: React.FC<LightingProps> = ({
  lightingType,
  roomLength,
  roomWidth,
  roomHeight,
  brightness,
  colorTemperature
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
            <mesh position={[0, 0, 0.05]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
              <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Shade */}
            <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.2, 16]} />
              <meshStandardMaterial 
                color="#f5deb3"
                emissive={lightColor}
                emissiveIntensity={0.5 * intensityMultiplier}
                transparent
                opacity={0.8}
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
    // 3 pendant lights
    const positions: [number, number, number][] = [
      [-scaledLength * 0.25, scaledHeight - 0.05, 0],
      [0, scaledHeight - 0.05, 0],
      [scaledLength * 0.25, scaledHeight - 0.05, 0],
    ];

    return (
      <group>
        {positions.map((pos, i) => (
          <group key={`pendant-${i}`} position={pos}>
            {/* Ceiling mount */}
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
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
