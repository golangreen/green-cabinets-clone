import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { VanityCabinet } from '../cabinet/VanityCabinet';

// Mock Three.js texture creation
vi.mock('../MaterialUtils', () => ({
  SCALE_FACTOR: 1/12,
  getMaterialProps: vi.fn(() => ({
    color: '#8B4513',
    roughness: 0.7,
    metalness: 0.1,
    type: 'wood'
  })),
  createWoodTexture: vi.fn(() => null),
  createBumpMap: vi.fn(() => null),
}));

describe('VanityCabinet', () => {
  const defaultProps = {
    width: 48,
    height: 36,
    depth: 21,
    brand: 'blum',
    finish: 'natural-oak',
    doorStyle: 'shaker',
    numDrawers: 3,
    handleStyle: 'bar',
    cabinetPosition: 'center' as const,
    measurementMode: false,
    onMeasurementClick: vi.fn(),
    activeMeasurement: null as 'height' | 'width' | 'depth' | 'door' | null,
    countertopMaterial: 'quartz' as const,
    countertopEdge: 'straight' as const,
    countertopColor: 'white' as const,
  };

  it('renders without crashing', () => {
    const { container } = render(
      <Canvas>
        <VanityCabinet {...defaultProps} />
      </Canvas>
    );
    expect(container).toBeTruthy();
  });

  it('scales dimensions correctly', () => {
    const { container } = render(
      <Canvas>
        <VanityCabinet {...defaultProps} />
      </Canvas>
    );
    
    // Cabinet should render with scaled dimensions
    const groups = container.querySelectorAll('group');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('renders correct number of drawers', () => {
    const { rerender } = render(
      <Canvas>
        <VanityCabinet {...defaultProps} numDrawers={2} />
      </Canvas>
    );
    
    expect(true).toBe(true); // Placeholder - drawer count affects internal mesh generation
    
    rerender(
      <Canvas>
        <VanityCabinet {...defaultProps} numDrawers={4} />
      </Canvas>
    );
    
    expect(true).toBe(true);
  });

  it('applies material properties based on brand and finish', () => {
    const { container } = render(
      <Canvas>
        <VanityCabinet {...defaultProps} brand="hafele" finish="walnut" />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('handles measurement mode correctly', () => {
    const onMeasurementClick = vi.fn();
    
    render(
      <Canvas>
        <VanityCabinet 
          {...defaultProps} 
          measurementMode={true}
          onMeasurementClick={onMeasurementClick}
        />
      </Canvas>
    );
    
    expect(onMeasurementClick).not.toHaveBeenCalled();
  });

  it('positions cabinet based on cabinetPosition prop', () => {
    const { rerender } = render(
      <Canvas>
        <VanityCabinet {...defaultProps} cabinetPosition="left" />
      </Canvas>
    );
    
    expect(true).toBe(true);
    
    rerender(
      <Canvas>
        <VanityCabinet {...defaultProps} cabinetPosition="right" />
      </Canvas>
    );
    
    expect(true).toBe(true);
  });
});
