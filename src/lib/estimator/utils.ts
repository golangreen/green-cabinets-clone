import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD currency string, e.g. "$1,234" */
export const fmt = (n: number) => '$' + n.toLocaleString();

/** Format a nullable number as USD or dash, e.g. "$1,234" or "—" */
export const fmtOpt = (n: number | null | undefined) =>
  n != null ? '$' + n.toLocaleString() : '—';

/** Convert a File to its base64-encoded content (no data-url prefix). */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Enhance an image for better OCR accuracy before sending to Claude.
 * Scales up small images, boosts contrast, and sharpens text.
 * Falls back to plain base64 if canvas is unavailable.
 */
export async function enhanceImageForOCR(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const fallback = () =>
      fileToBase64(file).then(base64 => resolve({ base64, mimeType: file.type || 'image/jpeg' }));

    if (typeof document === 'undefined') { fallback(); return; }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const TARGET = 2048;
        const MIN_SCALE = 1600;
        let { naturalWidth: w, naturalHeight: h } = img;

        // Scale up if the image is too small for good text recognition
        const maxDim = Math.max(w, h);
        if (maxDim < MIN_SCALE) {
          const s = MIN_SCALE / maxDim;
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        // Cap to avoid oversized payloads
        if (Math.max(w, h) > TARGET) {
          const s = TARGET / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;

        // Boost contrast so blueprint labels stand out
        ctx.filter = 'contrast(1.3) brightness(1.05)';
        ctx.drawImage(img, 0, 0, w, h);
        ctx.filter = 'none';

        // Sharpening kernel (unsharp mask) — improves blurry/compressed text
        const src = ctx.getImageData(0, 0, w, h);
        const dst = ctx.createImageData(w, h);
        const s2 = src.data, d2 = dst.data;
        // kernel: [0,-1,0,-1,5,-1,0,-1,0]
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const v =
                -s2[((y-1)*w+x)*4+c] +
                -s2[(y*w+(x-1))*4+c] +
                 5*s2[i+c] +
                -s2[(y*w+(x+1))*4+c] +
                -s2[((y+1)*w+x)*4+c];
              d2[i+c] = Math.max(0, Math.min(255, v));
            }
            d2[i+3] = s2[i+3];
          }
        }
        // copy border rows/cols
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (y === 0 || y === h-1 || x === 0 || x === w-1) {
            const i = (y*w+x)*4;
            d2[i]=s2[i]; d2[i+1]=s2[i+1]; d2[i+2]=s2[i+2]; d2[i+3]=s2[i+3];
          }
        }
        ctx.putImageData(dst, 0, 0);

        // PNG is lossless and deterministic: same pixels → same bytes every time.
        // JPEG was producing different bytes per run, causing Claude to read labels
        // differently (e.g. UC1896 vs UC3096) even for the same blueprint file.
        canvas.toBlob(blob => {
          if (!blob) { fallback(); return; }
          const reader = new FileReader();
          reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: 'image/png' });
          reader.onerror = () => fallback();
          reader.readAsDataURL(blob);
        }, 'image/png');
      } catch {
        fallback();
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); fallback(); };
    img.src = url;
  });
}
