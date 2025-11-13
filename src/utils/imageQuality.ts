export interface ImageQualityResult {
  isLowResolution: boolean;
  isBlurry: boolean;
  width: number;
  height: number;
  sharpnessScore: number;
  warnings: string[];
}

const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const BLUR_THRESHOLD = 100; // Lower values indicate more blur

/**
 * Calculate image sharpness using Laplacian variance
 * Higher values indicate sharper images
 */
const calculateSharpness = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  const grayscale = new Float32Array(width * height);

  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale[i / 4] = gray;
  }

  // Apply Laplacian operator
  let sum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Laplacian kernel
      const laplacian = 
        -grayscale[idx - width - 1] - grayscale[idx - width] - grayscale[idx - width + 1] +
        -grayscale[idx - 1] + 8 * grayscale[idx] - grayscale[idx + 1] +
        -grayscale[idx + width - 1] - grayscale[idx + width] - grayscale[idx + width + 1];

      sum += laplacian * laplacian;
      count++;
    }
  }

  // Return variance (measure of sharpness)
  return sum / count;
};

/**
 * Analyze image quality for resolution and blur
 */
export const analyzeImageQuality = async (file: File): Promise<ImageQualityResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const { width, height } = img;
        const canvas = document.createElement('canvas');
        
        // Sample a portion of the image for blur detection (for performance)
        const sampleWidth = Math.min(width, 512);
        const sampleHeight = Math.min(height, 512);
        
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw sampled portion of image
        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        
        // Calculate sharpness
        const sharpnessScore = calculateSharpness(imageData);
        
        // Check quality criteria
        const isLowResolution = width < MIN_WIDTH || height < MIN_HEIGHT;
        const isBlurry = sharpnessScore < BLUR_THRESHOLD;
        
        const warnings: string[] = [];
        
        if (isLowResolution) {
          warnings.push(
            `Low resolution: ${width}x${height}px (recommended minimum: ${MIN_WIDTH}x${MIN_HEIGHT}px)`
          );
        }
        
        if (isBlurry) {
          warnings.push(
            `Image appears blurry (sharpness score: ${sharpnessScore.toFixed(0)}, threshold: ${BLUR_THRESHOLD})`
          );
        }

        URL.revokeObjectURL(url);
        
        resolve({
          isLowResolution,
          isBlurry,
          width,
          height,
          sharpnessScore,
          warnings
        });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Get quality badge color based on issues
 */
export const getQualityBadgeVariant = (result: ImageQualityResult): 'default' | 'secondary' | 'destructive' => {
  if (result.isLowResolution && result.isBlurry) return 'destructive';
  if (result.isLowResolution || result.isBlurry) return 'secondary';
  return 'default';
};

/**
 * Get quality status text
 */
export const getQualityStatusText = (result: ImageQualityResult): string => {
  if (result.isLowResolution && result.isBlurry) return 'Poor Quality';
  if (result.isLowResolution) return 'Low Resolution';
  if (result.isBlurry) return 'Blurry';
  return 'Good Quality';
};
