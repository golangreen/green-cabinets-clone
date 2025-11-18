import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SCALE_FACTOR, getMaterialProps, createWoodTexture, createBumpMap } from '../MaterialUtils';
import { MeasurementLine } from '../MeasurementTools';
import { Countertop } from '../fixtures';
import { useMaterialWorker } from '@/hooks/useMaterialWorker';

type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

interface VanityCabinetProps {
  width: number;
  height: number;
  depth: number;
  brand: string;
  finish: string;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition?: string;
  measurementMode: boolean;
  onMeasurementClick: (type: MeasurementType) => void;
  activeMeasurement: MeasurementType;
  countertopMaterial?: 'marble' | 'quartz' | 'granite';
  countertopEdge?: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  countertopColor?: string;
}

export const VanityCabinet: React.FC<VanityCabinetProps> = ({ 
  width, 
  height, 
  depth, 
  brand, 
  finish, 
  doorStyle, 
  numDrawers, 
  handleStyle, 
  cabinetPosition = "left", 
  measurementMode, 
  onMeasurementClick, 
  activeMeasurement,
  countertopMaterial = 'quartz',
  countertopEdge = 'straight',
  countertopColor = 'white'
}) => {
  // Scale dimensions for better visualization
  const scaledWidth = width * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  const scaledDepth = depth * SCALE_FACTOR;

  // Offload material calculations to Web Worker for better performance
  const { calculateMaterialProps } = useMaterialWorker();
  const [materialProps, setMaterialProps] = useState(() => getMaterialProps(brand, finish));

  useEffect(() => {
    // Try Web Worker first, fallback to main thread
    calculateMaterialProps(brand, finish)
      .then(props => setMaterialProps(props))
      .catch(() => setMaterialProps(getMaterialProps(brand, finish)));
  }, [brand, finish, calculateMaterialProps]);

  // Material thickness
  const thickness = 0.05;

  // Create procedural wood grain texture
  const woodTexture = useMemo(() => createWoodTexture(materialProps), [materialProps]);

  // Create bump map for surface detail
  const bumpMap = useMemo(() => createBumpMap(materialProps.bumpScale), [materialProps.bumpScale]);

  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (type: MeasurementType) => {
    if (measurementMode) {
      onMeasurementClick(type);
    }
  };

  return (
    <group>
      {/* Measurement lines */}
      {activeMeasurement === 'height' && (
        <MeasurementLine
          start={[-scaledWidth / 2 - 0.3, 0, 0]}
          end={[-scaledWidth / 2 - 0.3, scaledHeight, 0]}
          label={`${height.toFixed(2)}"`}
          color="#00ff00"
        />
      )}
      {activeMeasurement === 'width' && (
        <MeasurementLine
          start={[-scaledWidth / 2, scaledHeight + 0.3, 0]}
          end={[scaledWidth / 2, scaledHeight + 0.3, 0]}
          label={`${width.toFixed(2)}"`}
          color="#0000ff"
        />
      )}
      {activeMeasurement === 'depth' && (
        <MeasurementLine
          start={[scaledWidth / 2 + 0.3, 0, -scaledDepth / 2]}
          end={[scaledWidth / 2 + 0.3, 0, scaledDepth / 2]}
          label={`${depth.toFixed(2)}"`}
          color="#ff0000"
        />
      )}

      {/* Main cabinet body */}
      <mesh 
        ref={meshRef}
        position={[0, scaledHeight / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => handleClick('height')}
        onPointerOver={(e) => {
          if (measurementMode) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[scaledWidth, scaledHeight, scaledDepth]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>

      {/* Countertop with custom material and edge */}
      <Countertop
        width={width}
        height={height}
        depth={depth}
        material={countertopMaterial}
        edge={countertopEdge}
        color={countertopColor}
      />

      {/* Door/Drawer Configuration */}
      {doorStyle === 'single' && (
        <>
          <mesh 
            position={[0, scaledHeight / 2, scaledDepth / 2 + 0.01]} 
            castShadow
            onClick={() => handleClick('door')}
            onPointerOver={(e) => {
              if (measurementMode) {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[scaledWidth * 0.95, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
        </>
      )}

      {doorStyle === 'double' && (
        <>
          <mesh position={[-scaledWidth * 0.25, scaledHeight / 2, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          <mesh position={[scaledWidth * 0.25, scaledHeight / 2, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
          {handleStyle === 'knob' && (
            <>
              <mesh position={[-scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[scaledWidth * 0.1, scaledHeight / 2, scaledDepth / 2 + 0.04]} castShadow>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
              </mesh>
            </>
          )}
        </>
      )}

      {doorStyle === 'drawers' && (
        <>
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.9) / numDrawers;
            const drawerY = scaledHeight * 0.05 + drawerHeight * i + drawerHeight / 2;
            return (
              <group key={i}>
                <mesh position={[0, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.95, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh position={[0, drawerY, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.01, 0.01, Math.min(0.2, scaledWidth * 0.4), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <>
                    <mesh position={[-scaledWidth * 0.15, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.02, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                    <mesh position={[scaledWidth * 0.15, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.02, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
        </>
      )}

      {doorStyle === 'mixed' && (
        <>
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.45) / numDrawers;
            const drawerY = scaledHeight * 0.5 + drawerHeight * i + drawerHeight / 2;
            return (
              <group key={`drawer-${i}`}>
                <mesh position={[0, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.95, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh position={[0, drawerY, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.008, 0.008, Math.min(0.15, scaledWidth * 0.3), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <>
                    <mesh position={[-scaledWidth * 0.1, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.015, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                    <mesh position={[scaledWidth * 0.1, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                      <sphereGeometry args={[0.015, 16, 16]} />
                      <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                    </mesh>
                  </>
                )}
              </group>
            );
          })}
          <mesh position={[0, scaledHeight * 0.225, scaledDepth / 2 + 0.01]} castShadow>
            <boxGeometry args={[scaledWidth * 0.95, scaledHeight * 0.45, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight * 0.225, scaledDepth / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh position={[scaledWidth * 0.35, scaledHeight * 0.225, scaledDepth / 2 + 0.04]} castShadow>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
        </>
      )}

      {/* Drawer + Door Side-by-Side */}
      {doorStyle === 'drawer-door-split' && (
        <>
          {/* Drawer side */}
          {Array.from({ length: numDrawers }).map((_, i) => {
            const drawerHeight = (scaledHeight * 0.9) / numDrawers;
            const drawerY = scaledHeight * 0.05 + drawerHeight * i + drawerHeight / 2;
            const drawerX = cabinetPosition === 'left' ? scaledWidth * 0.25 : -scaledWidth * 0.25;
            return (
              <group key={`drawer-split-${i}`}>
                <mesh position={[drawerX, drawerY, scaledDepth / 2 + 0.01]} castShadow>
                  <boxGeometry args={[scaledWidth * 0.45, drawerHeight * 0.95, 0.02]} />
                  <meshStandardMaterial 
                    color={materialProps.color}
                    map={woodTexture}
                    bumpMap={bumpMap}
                    bumpScale={materialProps.bumpScale}
                    roughness={materialProps.roughness * 0.9}
                    metalness={materialProps.metalness}
                    envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
                  />
                </mesh>
                {handleStyle === 'bar' && (
                  <mesh 
                    position={[drawerX, drawerY, scaledDepth / 2 + 0.03]} 
                    rotation={[0, 0, Math.PI / 2]} 
                    castShadow
                  >
                    <cylinderGeometry args={[0.008, 0.008, Math.min(0.15, scaledWidth * 0.3), 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
                {handleStyle === 'knob' && (
                  <mesh position={[drawerX, drawerY, scaledDepth / 2 + 0.04]} castShadow>
                    <sphereGeometry args={[0.018, 16, 16]} />
                    <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Door side */}
          <mesh 
            position={[
              cabinetPosition === 'left' ? -scaledWidth * 0.25 : scaledWidth * 0.25, 
              scaledHeight / 2, 
              scaledDepth / 2 + 0.01
            ]} 
            castShadow
          >
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.03
              ]} 
              rotation={[0, 0, Math.PI / 2]} 
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.04
              ]} 
              castShadow
            >
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
        </>
      )}

      {/* Door + Open Shelf Side-by-Side */}
      {doorStyle === 'door-shelf-split' && (
        <>
          {/* Cabinet side (door) */}
          <mesh 
            position={[
              cabinetPosition === 'left' ? -scaledWidth * 0.25 : scaledWidth * 0.25, 
              scaledHeight / 2, 
              scaledDepth / 2 + 0.01
            ]} 
            castShadow
          >
            <boxGeometry args={[scaledWidth * 0.45, scaledHeight * 0.9, 0.02]} />
            <meshStandardMaterial 
              color={materialProps.color}
              map={woodTexture}
              bumpMap={bumpMap}
              bumpScale={materialProps.bumpScale}
              roughness={materialProps.roughness * 0.9}
              metalness={materialProps.metalness}
              envMapIntensity={materialProps.type === 'metallic' ? 1.5 : 0.8}
            />
          </mesh>
          {handleStyle === 'bar' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.03
              ]} 
              rotation={[0, 0, Math.PI / 2]} 
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.15, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          {handleStyle === 'knob' && (
            <mesh 
              position={[
                cabinetPosition === 'left' ? -scaledWidth * 0.1 : scaledWidth * 0.1, 
                scaledHeight / 2, 
                scaledDepth / 2 + 0.04
              ]} 
              castShadow
            >
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#B8B8B8" roughness={0.25} metalness={0.85} />
            </mesh>
          )}
          
          {/* Shelf side (open shelves) */}
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const shelfY = scaledHeight * ratio;
            const shelfX = cabinetPosition === 'left' ? scaledWidth * 0.25 : -scaledWidth * 0.25;
            return (
              <mesh 
                key={`shelf-${i}`}
                position={[shelfX, shelfY, 0]} 
                castShadow
              >
                <boxGeometry args={[scaledWidth * 0.44, 0.02, scaledDepth * 0.95]} />
                <meshStandardMaterial 
                  color={materialProps.color}
                  map={woodTexture}
                  roughness={materialProps.roughness}
                  metalness={materialProps.metalness}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Open Shelves Only */}
      {doorStyle === 'open-shelves' && (
        <>
          {[0.25, 0.5, 0.75].map((ratio, i) => {
            const shelfY = scaledHeight * ratio;
            return (
              <mesh 
                key={`open-shelf-${i}`}
                position={[0, shelfY, 0]} 
                castShadow
              >
                <boxGeometry args={[scaledWidth * 0.95, 0.02, scaledDepth * 0.95]} />
                <meshStandardMaterial 
                  color={materialProps.color}
                  map={woodTexture}
                  roughness={materialProps.roughness}
                  metalness={materialProps.metalness}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Side panels */}
      <mesh 
        position={[-scaledWidth / 2 - 0.005, scaledHeight / 2, 0]} 
        castShadow 
        receiveShadow
        onClick={() => handleClick('depth')}
        onPointerOver={(e) => {
          if (measurementMode) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>
      <mesh position={[scaledWidth / 2 + 0.005, scaledHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.01, scaledHeight * 0.98, scaledDepth * 0.98]} />
        <meshStandardMaterial 
          color={materialProps.color}
          map={woodTexture}
          bumpMap={bumpMap}
          bumpScale={materialProps.bumpScale}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
        />
      </mesh>
    </group>
  );
};
