// Simplified annotated blueprint renderer — draws colored dots for flagged cabinets only
import type { ReconciliationData } from '@/lib/estimator/types';

const MAX_EXPORT_WIDTH = 1600;
const FUZZY_COLOR = '#d97706';
const UNMATCHED_COLOR = '#dc2626';
const WHITE = '#ffffff';

type FlagStatus = 'fuzzy' | 'unmatched';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function extractSourceFileName(sourceLabel: string) {
  const match = sourceLabel.match(/\(([^)]+)\)\s*$/);
  return match?.[1] ?? sourceLabel;
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  status: FlagStatus,
  scale: number,
) {
  const color = status === 'fuzzy' ? FUZZY_COLOR : UNMATCHED_COLOR;
  const radius = Math.round(6 * scale);

  // Outer ring
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = WHITE;
  ctx.fill();

  // Colored dot
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export async function renderAnnotatedBlueprintDataUrls(
  files: File[],
  reconciliation: ReconciliationData,
): Promise<string[]> {
  const blueprintSources = reconciliation.sources.filter((s) => s.category === 'blueprint');

  const rendered = await Promise.all(
    blueprintSources.map(async (source) => {
      const exactFileName = extractSourceFileName(source.source);
      const file = files.find(
        (f) => f.name === exactFileName && f.type.startsWith('image/'),
      ) ?? files.find(
        (f) => source.source.includes(f.name) && f.type.startsWith('image/'),
      );
      if (!file) return null;

      // Collect only flagged markers with coordinates
      const flagged = [
        ...(source.fuzzyMatched || []).filter(c => typeof c.x === 'number' && typeof c.y === 'number')
          .map(c => ({ x: c.x!, y: c.y!, status: 'fuzzy' as FlagStatus })),
        ...source.skipped.filter(c => typeof c.x === 'number' && typeof c.y === 'number')
          .map(c => ({ x: c.x!, y: c.y!, status: 'unmatched' as FlagStatus })),
      ];

      const objectUrl = URL.createObjectURL(file);
      try {
        const image = await loadImage(objectUrl);
        const imgScale = Math.min(1, MAX_EXPORT_WIDTH / image.naturalWidth);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * imgScale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * imgScale));
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const markerScale = Math.max(1, Math.min(2, canvas.width / 800));
        for (const marker of flagged) {
          drawDot(ctx, marker.x * canvas.width, marker.y * canvas.height, marker.status, markerScale);
        }

        return canvas.toDataURL('image/png');
      } catch {
        return null;
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }),
  );

  return rendered.filter((url): url is string => Boolean(url));
}
