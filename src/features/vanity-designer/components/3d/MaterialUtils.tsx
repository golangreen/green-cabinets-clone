import * as THREE from "three";

export const SCALE_FACTOR = 0.02;

export type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

export interface MaterialProps {
  color: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
}

export const getMaterialProps = (finish: string): MaterialProps => {
  const finishLower = finish.toLowerCase();
  
  if (finishLower.includes('walnut')) {
    return { color: '#4a3728', roughness: 0.6, metalness: 0.1, bumpScale: 0.002 };
  }
  if (finishLower.includes('oak')) {
    return { color: '#d4a574', roughness: 0.65, metalness: 0.05, bumpScale: 0.003 };
  }
  if (finishLower.includes('maple')) {
    return { color: '#e8d5b7', roughness: 0.55, metalness: 0.08, bumpScale: 0.002 };
  }
  if (finishLower.includes('cherry')) {
    return { color: '#9a4545', roughness: 0.5, metalness: 0.12, bumpScale: 0.002 };
  }
  if (finishLower.includes('espresso') || finishLower.includes('dark')) {
    return { color: '#2c1810', roughness: 0.45, metalness: 0.15, bumpScale: 0.001 };
  }
  if (finishLower.includes('white')) {
    return { color: '#f5f5f5', roughness: 0.4, metalness: 0.05, bumpScale: 0.001 };
  }
  if (finishLower.includes('gray') || finishLower.includes('grey')) {
    return { color: '#808080', roughness: 0.5, metalness: 0.1, bumpScale: 0.002 };
  }
  
  return { color: '#a67c52', roughness: 0.6, metalness: 0.08, bumpScale: 0.002 };
};

export const createWoodTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const gradient = ctx.createLinearGradient(0, 0, 512, 0);
  gradient.addColorStop(0, '#8b7355');
  gradient.addColorStop(0.5, '#a0826d');
  gradient.addColorStop(1, '#8b7355');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.lineTo(Math.random() * 512, 512);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
};

export const createBumpMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, Math.random() * 50);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};
