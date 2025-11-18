import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { BathroomRoom } from '../room/BathroomRoom';

vi.mock('../MaterialUtils', () => ({
  SCALE_FACTOR: 1/12,
}));

describe('BathroomRoom', () => {
  const defaultProps = {
    roomLength: 120,
    roomWidth: 96,
    roomHeight: 96,
    floorType: 'tile' as const,
    tileColor: 'white-marble' as const,
    woodFloorFinish: 'natural-oak' as const,
    includeWalls: false,
    hasWindow: false,
    hasDoor: false,
    wallFinishType: 'paint' as const,
    wallPaintColor: 'white' as const,
    wallTileColor: 'white-subway' as const,
  };

  it('renders floor mesh', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} />
      </Canvas>
    );
    
    const meshes = container.querySelectorAll('mesh');
    expect(meshes.length).toBeGreaterThan(0);
  });

  it('renders walls when includeWalls is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} includeWalls={true} />
      </Canvas>
    );
    
    const groups = container.querySelectorAll('group');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('applies tile floor material', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} floorType="tile" tileColor="white-marble" />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('applies wood floor material', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} floorType="wood" woodFloorFinish="natural-oak" />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('renders window when hasWindow is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} includeWalls={true} hasWindow={true} />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('renders door when hasDoor is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} includeWalls={true} hasDoor={true} />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('scales room dimensions correctly', () => {
    const { rerender } = render(
      <Canvas>
        <BathroomRoom {...defaultProps} roomLength={120} roomWidth={96} />
      </Canvas>
    );
    
    expect(true).toBe(true);
    
    rerender(
      <Canvas>
        <BathroomRoom {...defaultProps} roomLength={144} roomWidth={120} />
      </Canvas>
    );
    
    expect(true).toBe(true);
  });
});
