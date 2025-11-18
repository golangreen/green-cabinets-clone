import React from 'react';
import { SCALE_FACTOR } from '../MaterialUtils';

interface VanityFaucetProps {
  vanityWidth: number;
  vanityHeight: number;
  vanityDepth: number;
  includeFaucet: boolean;
  faucetStyle: 'modern' | 'traditional' | 'waterfall';
  faucetFinish: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold';
}

export const VanityFaucet: React.FC<VanityFaucetProps> = ({
  vanityWidth,
  vanityHeight,
  vanityDepth,
  includeFaucet,
  faucetStyle,
  faucetFinish,
}) => {
  if (!includeFaucet) return null;

  const scaledWidth = vanityWidth * SCALE_FACTOR;
  const scaledHeight = vanityHeight * SCALE_FACTOR;
  const scaledDepth = vanityDepth * SCALE_FACTOR;

  // Get finish color
  const getFinishColor = () => {
    switch (faucetFinish) {
      case 'chrome': return '#e0e0e0';
      case 'brushed-nickel': return '#b8b8b0';
      case 'matte-black': return '#2a2a2a';
      case 'gold': return '#d4af37';
      default: return '#e0e0e0';
    }
  };

  const getMaterialProps = () => {
    const color = getFinishColor();
    switch (faucetFinish) {
      case 'chrome':
        return { color, metalness: 0.95, roughness: 0.05 };
      case 'brushed-nickel':
        return { color, metalness: 0.85, roughness: 0.25 };
      case 'matte-black':
        return { color, metalness: 0.3, roughness: 0.8 };
      case 'gold':
        return { color, metalness: 0.9, roughness: 0.15 };
      default:
        return { color, metalness: 0.95, roughness: 0.05 };
    }
  };

  const materialProps = getMaterialProps();

  // Faucet positioned on top of vanity, slightly back from front edge
  const faucetPosition: [number, number, number] = [
    0, // Center horizontally
    scaledHeight + 0.02, // Just above vanity top
    -scaledDepth * 0.2 // Slightly back from front edge
  ];

  if (faucetStyle === 'modern') {
    // Modern single-hole faucet with tall spout
    return (
      <group position={faucetPosition}>
        {/* Base plate */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout column */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.3, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout neck (curved) */}
        <mesh position={[0, 0.3, 0.05]} rotation={[Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.015, 0.15, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout tip */}
        <mesh position={[0, 0.35, 0.12]} rotation={[Math.PI / 3, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.012, 0.05, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Handle lever */}
        <mesh position={[-0.06, 0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.015, 0.02]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    );
  }

  if (faucetStyle === 'traditional') {
    // Traditional widespread faucet with separate hot/cold handles
    return (
      <group position={faucetPosition}>
        {/* Left handle (hot) */}
        <group position={[-0.15, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.025, 0.01, 16, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Right handle (cold) */}
        <group position={[0.15, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.025, 0.01, 16, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Center spout */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.015, 0.16, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.16, 0.04]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.012, 0.08, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.18, 0.08]} rotation={[Math.PI / 2.5, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.01, 0.04, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      </group>
    );
  }

  if (faucetStyle === 'waterfall') {
    // Waterfall spout faucet with wide opening
    return (
      <group position={faucetPosition}>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.08]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Back wall */}
        <mesh position={[0, 0.05, -0.035]}>
          <boxGeometry args={[0.18, 0.1, 0.01]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Side walls */}
        <mesh position={[-0.085, 0.05, 0]}>
          <boxGeometry args={[0.01, 0.1, 0.07]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        <mesh position={[0.085, 0.05, 0]}>
          <boxGeometry args={[0.01, 0.1, 0.07]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Spout opening with glass effect */}
        <mesh position={[0, 0.08, 0.02]}>
          <boxGeometry args={[0.16, 0.04, 0.02]} />
          <meshPhysicalMaterial 
            color="#e0f7fa"
            transparent
            opacity={0.3}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Control knob */}
        <mesh position={[0.12, 0.08, -0.03]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    );
  }

  return null;
};
