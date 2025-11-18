import { memo, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import { TextureSwatch } from './TextureSwatch';

interface VirtualTextureGalleryProps {
  textures: string[];
  selectedTexture: string | null;
  onTextureClick: (texture: string) => void;
  columnCount?: number;
  rowHeight?: number;
  width?: number;
  height?: number;
}

export const VirtualTextureGallery = memo(({
  textures,
  selectedTexture,
  onTextureClick,
  columnCount = 4,
  rowHeight = 120,
  width = 650,
  height = 600,
}: VirtualTextureGalleryProps) => {
  const rowCount = Math.ceil(textures.length / columnCount);

  // Extract brand from context or props (assuming single brand per gallery)
  const brand = "Tafisa"; // This should be passed as a prop in real implementation

  const Cell = useMemo(() => {
    return ({ columnIndex, rowIndex, style }: any) => {
      const index = rowIndex * columnCount + columnIndex;
      if (index >= textures.length) return null;

      const texture = textures[index];
      return (
        <div style={style} className="p-2">
          <TextureSwatch
            finishName={texture}
            brand={brand}
            selected={texture === selectedTexture}
            onClick={() => onTextureClick(texture)}
          />
        </div>
      );
    };
  }, [textures, selectedTexture, onTextureClick, columnCount, brand]);

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={150}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={width}
      overscanRowCount={2}
      className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
    >
      {Cell}
    </FixedSizeGrid>
  );
});

VirtualTextureGallery.displayName = 'VirtualTextureGallery';
