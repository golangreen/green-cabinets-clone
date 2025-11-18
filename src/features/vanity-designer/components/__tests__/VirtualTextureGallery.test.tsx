import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualTextureGallery } from '../VirtualTextureGallery';

describe('VirtualTextureGallery', () => {
  const mockTextures = Array.from({ length: 100 }, (_, i) => `texture-${i}`);
  const mockOnClick = vi.fn();

  it('renders virtual grid container', () => {
    const { container } = render(
      <VirtualTextureGallery
        textures={mockTextures}
        selectedTexture={null}
        onTextureClick={mockOnClick}
      />
    );

    // Should render react-window grid container
    expect(container.querySelector('[style*="overflow"]')).toBeInTheDocument();
  });

  it('does not render all 100 textures at once', () => {
    const { container } = render(
      <VirtualTextureGallery
        textures={mockTextures}
        selectedTexture={null}
        onTextureClick={mockOnClick}
      />
    );

    // Virtual scrolling should only render visible + overscan items
    // Default: 4 columns, ~5 rows visible + 2 overscan = ~28 items max
    const renderedItems = container.querySelectorAll('[style*="position: absolute"]');
    expect(renderedItems.length).toBeLessThan(40);
    expect(renderedItems.length).toBeGreaterThan(0);
  });

  it('handles empty texture list', () => {
    const { container } = render(
      <VirtualTextureGallery
        textures={[]}
        selectedTexture={null}
        onTextureClick={mockOnClick}
      />
    );

    expect(container.querySelector('[style*="overflow"]')).toBeInTheDocument();
  });

  it('respects custom dimensions', () => {
    const { container } = render(
      <VirtualTextureGallery
        textures={mockTextures}
        selectedTexture={null}
        onTextureClick={mockOnClick}
        width={800}
        height={400}
        columnCount={5}
      />
    );

    const gridContainer = container.querySelector('[style*="height"]');
    expect(gridContainer).toHaveStyle({ height: '400px' });
  });
});
