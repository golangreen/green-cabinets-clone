import React from 'react';
import { SCALE_FACTOR } from '../MaterialUtils';

interface BathroomAccessoriesProps {
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
}

export const BathroomAccessories: React.FC<BathroomAccessoriesProps> = ({
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
            const x = -scaledWidth / 2 + spacing * (index + 1);
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
                  position={[0, -scaledHeight / 2 + index * (scaledHeight / 2), 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.01, 0.01, 0.3, 16]} />
                  <meshStandardMaterial color="#8b7355" roughness={0.6} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}
    </group>
  );
};
