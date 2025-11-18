import React from 'react';
import { SCALE_FACTOR } from '../MaterialUtils';

interface VanityLightingProps {
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  mirrorSize: 'small' | 'medium' | 'large';
  includeVanityLighting: boolean;
  vanityLightingStyle: 'sconce' | 'led-strip' | 'pendant';
  vanityLightBrightness: number;
  vanityLightTemp: number;
}

export const VanityLighting: React.FC<VanityLightingProps> = ({ 
  vanityWidth, 
  vanityHeight, 
  vanityDepth, 
  mirrorSize,
  includeVanityLighting, 
  vanityLightingStyle, 
  vanityLightBrightness,
  vanityLightTemp 
}) => {
  if (!includeVanityLighting) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Calculate mirror dimensions for positioning
  const mirrorHeight = (mirrorSize === 'small' ? 24 : mirrorSize === 'large' ? 36 : 30) * SCALE_FACTOR;
  const mirrorY = scaledHeight + mirrorHeight / 2 + 0.1;

  // Convert color temperature to RGB
  const getTempColor = (temp: number): string => {
    if (temp <= 3000) return '#ffd699'; // Warm white
    if (temp <= 4000) return '#fff5e6'; // Neutral white
    if (temp <= 5000) return '#fffef0'; // Cool white
    return '#f0f8ff'; // Daylight
  };

  const lightColor = getTempColor(vanityLightTemp);
  const intensityMultiplier = vanityLightBrightness / 100;

  if (vanityLightingStyle === 'sconce') {
    // Wall sconce fixtures on both sides of mirror
    const sconcePositions: [number, number][] = [
      [-scaledWidth * 0.4, mirrorY],
      [scaledWidth * 0.4, mirrorY]
    ];

    return (
      <group>
        {sconcePositions.map((pos, i) => (
          <group key={`sconce-${i}`} position={[pos[0], pos[1], -scaledDepth / 2 - 0.05]}>
            {/* Base plate */}
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
              <meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Arm */}
            <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
              <meshStandardMaterial color="#404040" metalness={0.7} roughness={0.3} />
            </mesh>
            
            {/* Glass shade */}
            <mesh position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshPhysicalMaterial 
                color={lightColor}
                emissive={lightColor}
                emissiveIntensity={intensityMultiplier}
                transparent
                opacity={0.8}
                roughness={0.1}
              />
            </mesh>
            
            {/* Point light */}
            <pointLight 
              color={lightColor} 
              intensity={2 * intensityMultiplier} 
              distance={2}
              decay={2}
            />
          </group>
        ))}
      </group>
    );
  }

  if (vanityLightingStyle === 'led-strip') {
    // LED strip around mirror perimeter
    const stripWidth = scaledWidth * 0.7;

    return (
      <group position={[0, mirrorY, -scaledDepth / 2 - 0.02]}>
        {/* Top strip */}
        <mesh position={[0, mirrorHeight / 2, 0]}>
          <boxGeometry args={[stripWidth, 0.015, 0.01]} />
          <meshStandardMaterial 
            color={lightColor}
            emissive={lightColor}
            emissiveIntensity={1.6 * intensityMultiplier}
          />
        </mesh>
        
        {/* Bottom strip */}
        <mesh position={[0, -mirrorHeight / 2, 0]}>
          <boxGeometry args={[stripWidth, 0.015, 0.01]} />
          <meshStandardMaterial 
            color={lightColor}
            emissive={lightColor}
            emissiveIntensity={1.6 * intensityMultiplier}
          />
        </mesh>
        
        {/* Side strips */}
        <mesh position={[-stripWidth / 2, 0, 0]}>
          <boxGeometry args={[0.015, mirrorHeight, 0.01]} />
          <meshStandardMaterial 
            color={lightColor}
            emissive={lightColor}
            emissiveIntensity={1.6 * intensityMultiplier}
          />
        </mesh>
        <mesh position={[stripWidth / 2, 0, 0]}>
          <boxGeometry args={[0.015, mirrorHeight, 0.01]} />
          <meshStandardMaterial 
            color={lightColor}
            emissive={lightColor}
            emissiveIntensity={1.6 * intensityMultiplier}
          />
        </mesh>
        
        {/* Ambient lighting */}
        <pointLight 
          position={[0, 0, 0.1]} 
          color={lightColor} 
          intensity={1.5 * intensityMultiplier} 
          distance={3}
        />
      </group>
    );
  }

  if (vanityLightingStyle === 'pendant') {
    // Pendant lights hanging above vanity
    const pendantCount = 3;
    const spacing = scaledWidth / (pendantCount + 1);

    return (
      <group>
        {Array.from({ length: pendantCount }).map((_, i) => (
          <group 
            key={`pendant-${i}`} 
            position={[
              -scaledWidth / 2 + spacing * (i + 1),
              scaledHeight + mirrorHeight + 0.5,
              -scaledDepth * 0.3
            ]}
          >
            {/* Ceiling mount */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
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
