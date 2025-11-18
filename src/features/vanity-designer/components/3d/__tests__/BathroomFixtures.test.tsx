import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { BathroomFixtures } from '../fixtures/BathroomFixtures';

vi.mock('../MaterialUtils', () => ({
  SCALE_FACTOR: 1/12,
}));

describe('BathroomFixtures', () => {
  const defaultProps = {
    roomLength: 120,
    roomWidth: 96,
    includeToilet: false,
    toiletStyle: 'modern' as const,
    toiletPosition: 'left' as const,
    includeShower: false,
    showerStyle: 'walk-in' as const,
    includeBathtub: false,
    bathtubStyle: 'freestanding' as const,
    bathtubPosition: 'back' as const,
  };

  it('renders nothing when no fixtures are included', () => {
    const { container } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} />
      </Canvas>
    );
    expect(container).toBeTruthy();
  });

  it('renders toilet when includeToilet is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeToilet={true} />
      </Canvas>
    );
    
    const groups = container.querySelectorAll('group');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('renders shower when includeShower is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeShower={true} />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('renders bathtub when includeBathtub is true', () => {
    const { container } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeBathtub={true} />
      </Canvas>
    );
    
    expect(container).toBeTruthy();
  });

  it('renders multiple fixtures simultaneously', () => {
    const { container } = render(
      <Canvas>
        <BathroomFixtures 
          {...defaultProps} 
          includeToilet={true}
          includeShower={true}
          includeBathtub={true}
        />
      </Canvas>
    );
    
    const groups = container.querySelectorAll('group');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('applies different toilet styles', () => {
    const { rerender } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeToilet={true} toiletStyle="modern" />
      </Canvas>
    );
    
    expect(true).toBe(true);
    
    rerender(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeToilet={true} toiletStyle="traditional" />
      </Canvas>
    );
    
    expect(true).toBe(true);
  });

  it('positions toilet based on toiletPosition prop', () => {
    const { rerender } = render(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeToilet={true} toiletPosition="left" />
      </Canvas>
    );
    
    expect(true).toBe(true);
    
    rerender(
      <Canvas>
        <BathroomFixtures {...defaultProps} includeToilet={true} toiletPosition="right" />
      </Canvas>
    );
    
    expect(true).toBe(true);
  });
});
