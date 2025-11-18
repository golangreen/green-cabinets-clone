import { memo } from "react";
import { Line, Html } from "@react-three/drei";

export interface MeasurementLineProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  color?: string;
}

const MeasurementLineComponent = ({ start, end, label, color = "#00ff00" }: MeasurementLineProps) => {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} />
      <Html position={midpoint} center>
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-mono font-semibold whitespace-nowrap shadow-lg border border-primary">
          {label}
        </div>
      </Html>
      {/* End caps */}
      <mesh position={start}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

export const MeasurementLine = memo(MeasurementLineComponent);

const DimensionLabelsComponent = ({ width, height, depth }: { width: number; height: number; depth: number }) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border">
      <div className="text-center">
        <div className="text-muted-foreground">Width</div>
        <div className="font-semibold">{width.toFixed(2)}"</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Height</div>
        <div className="font-semibold">{height.toFixed(2)}"</div>
      </div>
      <div className="text-center">
        <div className="text-muted-foreground">Depth</div>
        <div className="font-semibold">{depth.toFixed(2)}"</div>
      </div>
    </div>
  );
};

export const DimensionLabels = memo(DimensionLabelsComponent);
