/**
 * Web Worker for Material Calculations
 * Offloads heavy material property calculations from main thread
 */

import { getMaterialProps, createWoodTexture, createBumpMap } from '@/features/vanity-designer/components/3d/MaterialUtils';

interface WorkerMessage {
  type: string;
  payload: any;
  id: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'CALCULATE_MATERIAL_PROPS': {
        const { brand, finish } = payload;
        const materialProps = getMaterialProps(brand, finish);
        self.postMessage({ 
          type: 'MATERIAL_PROPS_RESULT', 
          payload: materialProps,
          id 
        });
        break;
      }

      case 'GENERATE_WOOD_TEXTURE': {
        const { materialProps } = payload;
        // Note: Three.js textures can't be transferred via postMessage
        // This is a placeholder for future Canvas-based texture generation
        self.postMessage({ 
          type: 'WOOD_TEXTURE_RESULT', 
          payload: { 
            success: true,
            message: 'Texture generation not supported in worker yet' 
          },
          id 
        });
        break;
      }

      case 'GENERATE_BUMP_MAP': {
        const { bumpScale } = payload;
        // Note: Three.js textures can't be transferred via postMessage
        // This is a placeholder for future Canvas-based texture generation
        self.postMessage({ 
          type: 'BUMP_MAP_RESULT', 
          payload: { 
            success: true,
            message: 'Bump map generation not supported in worker yet' 
          },
          id 
        });
        break;
      }

      default:
        self.postMessage({
          type: 'ERROR',
          payload: { message: `Unknown worker message type: ${type}` },
          id,
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : 'Unknown error' },
      id,
    });
  }
};
