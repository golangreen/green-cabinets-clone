import React from 'react';
import { SCALE_FACTOR } from '../MaterialUtils';

interface BathroomFixturesProps {
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
}

export const BathroomFixtures: React.FC<BathroomFixturesProps> = ({
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
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </mesh>
              
              {/* Side panels */}
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
                      clearcoat={1}
                      clearcoatRoughness={0.1}
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
                      clearcoat={1}
                      clearcoatRoughness={0.1}
                    />
                  </mesh>
                </>
              )}
            </>
          )}

          {/* Shower head */}
          <group position={[0, 1.6, showerStyle === 'walk-in' ? 0 : -0.85]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.08, 32]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.3, 16]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      )}

      {/* Bathtub */}
      {includeBathtub && (
        <group position={getBathtubPosition()}>
          {bathtubStyle === 'freestanding' && (
            <group>
              {/* Tub body */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.5, 0.7]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
              </mesh>
              {/* Inner basin */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.4, 0.45, 0.65]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.15} metalness={0.05} />
              </mesh>
              {/* Decorative feet */}
              {[-0.6, 0.6].map((x) => 
                [-0.25, 0.25].map((z) => (
                  <mesh key={`${x}-${z}`} position={[x, -0.25, z]}>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
                  </mesh>
                ))
              )}
            </group>
          )}

          {bathtubStyle === 'alcove' && (
            <group>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 0.5, 0.7]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.4, 0.45, 0.65]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.15} metalness={0.05} />
              </mesh>
            </group>
          )}

          {bathtubStyle === 'corner' && (
            <group rotation={[0, Math.PI / 4, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.3, 0.5, 1.3]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.2, 0.45, 1.2]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.15} metalness={0.05} />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
};
