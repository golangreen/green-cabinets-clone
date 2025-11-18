import * as THREE from "three";

export const SCALE_FACTOR = 0.02;

export type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

export interface MaterialProps {
  color: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  type: 'wood' | 'metallic' | 'painted';
}

export const getMaterialProps = (brand: string, finish: string): MaterialProps => {
  const finishLower = finish.toLowerCase();
  
  // Determine material type based on finish
  let type: 'wood' | 'metallic' | 'painted' = 'wood';
  if (finishLower.includes('metal') || finishLower.includes('steel') || finishLower.includes('chrome')) {
    type = 'metallic';
  } else if (finishLower.includes('painted') || finishLower.includes('white') || finishLower.includes('gray')) {
    type = 'painted';
  }
  
  if (finishLower.includes('walnut')) {
    return { color: '#4a3728', roughness: 0.6, metalness: 0.1, bumpScale: 0.002, type: 'wood' };
  }
  if (finishLower.includes('oak')) {
    return { color: '#d4a574', roughness: 0.65, metalness: 0.05, bumpScale: 0.003, type: 'wood' };
  }
  if (finishLower.includes('maple')) {
    return { color: '#e8d5b7', roughness: 0.55, metalness: 0.08, bumpScale: 0.002, type: 'wood' };
  }
  if (finishLower.includes('cherry')) {
    return { color: '#9a4545', roughness: 0.5, metalness: 0.12, bumpScale: 0.002, type: 'wood' };
  }
  if (finishLower.includes('espresso') || finishLower.includes('dark')) {
    return { color: '#2c1810', roughness: 0.45, metalness: 0.15, bumpScale: 0.001, type: 'wood' };
  }
  if (finishLower.includes('white')) {
    return { color: '#f5f5f5', roughness: 0.4, metalness: 0.05, bumpScale: 0.001, type: 'painted' };
  }
  if (finishLower.includes('gray') || finishLower.includes('grey')) {
    return { color: '#808080', roughness: 0.5, metalness: 0.1, bumpScale: 0.002, type: 'painted' };
  }
  
  return { color: '#a67c52', roughness: 0.6, metalness: 0.08, bumpScale: 0.002, type: 'wood' };
};

export const createWoodTexture = (materialProps: MaterialProps): THREE.CanvasTexture | null => {
  if (materialProps.type !== 'wood') return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Create wood grain pattern
  const gradient = ctx.createLinearGradient(0, 0, 512, 0);
  const baseColorRgb = new THREE.Color(materialProps.color);
  const darkColor = baseColorRgb.clone().multiplyScalar(0.7);
  const lightColor = baseColorRgb.clone().multiplyScalar(1.2);
  
  gradient.addColorStop(0, `rgb(${darkColor.r * 255}, ${darkColor.g * 255}, ${darkColor.b * 255})`);
  gradient.addColorStop(0.5, `rgb(${baseColorRgb.r * 255}, ${baseColorRgb.g * 255}, ${baseColorRgb.b * 255})`);
  gradient.addColorStop(1, `rgb(${lightColor.r * 255}, ${lightColor.g * 255}, ${lightColor.b * 255})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add noise for grain texture
  const imageData = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
};

export const createBumpMap = (bumpScale: number): THREE.CanvasTexture | null => {
  if (bumpScale === 0) return null;
  
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Create noise pattern for bump
  const imageData = ctx.createImageData(256, 256);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.random() * 255;
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
};
