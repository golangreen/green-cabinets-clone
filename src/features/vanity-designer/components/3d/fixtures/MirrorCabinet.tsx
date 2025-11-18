import React from 'react';
import { SCALE_FACTOR } from '../MaterialUtils';

interface MirrorCabinetProps {
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeMirror: boolean;
  mirrorType: 'mirror' | 'medicine-cabinet';
  mirrorSize: 'small' | 'medium' | 'large';
  mirrorShape: 'rectangular' | 'round' | 'oval' | 'arched';
  mirrorFrame: 'none' | 'black' | 'chrome' | 'gold' | 'wood';
}

export const MirrorCabinet: React.FC<MirrorCabinetProps> = ({
  vanityWidth,
  vanityHeight,
  vanityDepth,
  includeMirror,
  mirrorType,
  mirrorSize,
  mirrorShape,
  mirrorFrame,
}) => {
  if (!includeMirror) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Mirror dimensions based on size
  const getMirrorWidth = () => {
    switch (mirrorSize) {
      case 'small': return 24 * SCALE_FACTOR;
      case 'medium': return 36 * SCALE_FACTOR;
      case 'large': return 48 * SCALE_FACTOR;
      default: return 36 * SCALE_FACTOR;
    }
  };

  const getMirrorHeight = () => {
    switch (mirrorSize) {
      case 'small': return 28 * SCALE_FACTOR;
      case 'medium': return 36 * SCALE_FACTOR;
      case 'large': return 42 * SCALE_FACTOR;
      default: return 36 * SCALE_FACTOR;
    }
  };

  const mirrorWidth = getMirrorWidth();
  const mirrorHeight = getMirrorHeight();
  const mirrorDepth = mirrorType === 'medicine-cabinet' ? 0.1 : 0.02;

  // Position above vanity
  const yPosition = scaledHeight + mirrorHeight / 2 + 0.2;
  const zPosition = -scaledDepth / 2 - 0.05;

  // Frame color based on style
  const getFrameColor = () => {
    switch (mirrorFrame) {
      case 'black': return '#000000';
      case 'chrome': return '#c0c0c0';
      case 'gold': return '#d4af37';
      case 'wood': return '#8b7355';
      default: return null;
    }
  };

  const frameColor = getFrameColor();
  const frameThickness = mirrorFrame === 'none' ? 0 : 0.05;

  return (
    <group position={[0, yPosition, zPosition]}>
      {/* Mirror/Cabinet body */}
      {mirrorShape === 'rectangular' || mirrorShape === 'arched' ? (
        <>
          {/* Main mirror surface */}
          <mesh castShadow>
            <boxGeometry args={[mirrorWidth, mirrorHeight, mirrorDepth]} />
            <meshPhysicalMaterial
              color="#e8e8e8"
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Arched top overlay */}
          {mirrorShape === 'arched' && (
            <mesh position={[0, mirrorHeight / 2.5, 0]}>
              <cylinderGeometry args={[mirrorWidth / 2, mirrorWidth / 2, mirrorDepth, 32, 1, false, 0, Math.PI]} />
              <meshPhysicalMaterial
                color="#e8e8e8"
                metalness={0.95}
                roughness={0.05}
                envMapIntensity={1.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
          )}

          {/* Frame */}
          {frameColor && (
            <>
              {/* Top frame */}
              <mesh position={[0, mirrorHeight / 2 + frameThickness / 2, 0]}>
                <boxGeometry args={[mirrorWidth + frameThickness * 2, frameThickness, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Bottom frame */}
              <mesh position={[0, -mirrorHeight / 2 - frameThickness / 2, 0]}>
                <boxGeometry args={[mirrorWidth + frameThickness * 2, frameThickness, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Left frame */}
              <mesh position={[-mirrorWidth / 2 - frameThickness / 2, 0, 0]}>
                <boxGeometry args={[frameThickness, mirrorHeight + frameThickness * 2, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
              {/* Right frame */}
              <mesh position={[mirrorWidth / 2 + frameThickness / 2, 0, 0]}>
                <boxGeometry args={[frameThickness, mirrorHeight + frameThickness * 2, mirrorDepth + 0.02]} />
                <meshStandardMaterial 
                  color={frameColor} 
                  metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                  roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
                />
              </mesh>
            </>
          )}

          {/* Medicine cabinet shelves */}
          {mirrorType === 'medicine-cabinet' && (
            <>
              {[0, 1, 2].map((index) => (
                <mesh 
                  key={`shelf-${index}`}
                  position={[0, mirrorHeight / 4 - index * (mirrorHeight / 4), -mirrorDepth / 2 + 0.01]}
                >
                  <boxGeometry args={[mirrorWidth - 0.04, 0.01, mirrorDepth - 0.02]} />
                  <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
                </mesh>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {/* Round or Oval mirror */}
          <mesh castShadow>
            {mirrorShape === 'round' ? (
              <cylinderGeometry args={[mirrorWidth / 2, mirrorWidth / 2, mirrorDepth, 32]} />
            ) : (
              <sphereGeometry args={[mirrorWidth / 2, 32, 16, 0, Math.PI * 2, 0, Math.PI]} />
            )}
            <meshPhysicalMaterial
              color="#e8e8e8"
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={1.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          {/* Frame for round/oval */}
          {frameColor && (
            <mesh>
              <torusGeometry args={[mirrorWidth / 2, frameThickness / 2, 16, 32]} />
              <meshStandardMaterial 
                color={frameColor} 
                metalness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.9 : 0.2}
                roughness={mirrorFrame === 'chrome' || mirrorFrame === 'gold' ? 0.1 : 0.7}
              />
            </mesh>
          )}
        </>
      )}
    </group>
  );
};
