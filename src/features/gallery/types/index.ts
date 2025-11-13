/**
 * Gallery Feature Type Definitions
 * Centralized types for the gallery management system
 */

// ============================================================================
// Core Gallery Types
// ============================================================================

export type GalleryCategory = "kitchens" | "vanities" | "closets" | "design-to-reality" | "all";

export interface GalleryImage {
  id: string;
  path: string;
  alt: string;
  category: GalleryCategory;
  products?: ProductInfo[];
}

export interface ProductInfo {
  supplier: string;
  code: string;
  description?: string;
}

export interface HeroImage {
  id: string;
  path: string;
  alt: string;
}

// ============================================================================
// Image Upload & Processing Types
// ============================================================================

export type CompressionQuality = 'low' | 'medium' | 'high' | 'none';

export interface ImageFile {
  file: File;
  preview: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  file: File;
  preview: string;
  width: number;
  height: number;
  category: GalleryCategory;
  displayName: string;
  altText: string;
  description: string;
  compressionQuality: CompressionQuality;
}

export interface ImagePreview extends ImageMetadata {
  quality?: ImageQualityResult;
}

export interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  };
}

// ============================================================================
// Image Quality Types
// ============================================================================

export type ImageQualityIssue = 
  | 'low-resolution'
  | 'very-low-resolution'
  | 'blurry'
  | 'very-blurry'
  | 'none';

export interface ImageQualityResult {
  isBlurry: boolean;
  blurScore: number;
  isLowResolution: boolean;
  resolution: ImageDimensions;
  issues: ImageQualityIssue[];
  overallQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
}

// ============================================================================
// Editor & Modal Types
// ============================================================================

export interface EditingImage {
  index: number;
  image: ImagePreview;
}

export interface BatchEditData {
  category?: GalleryCategory;
  compressionQuality?: CompressionQuality;
}

export interface BulkMetadataFields {
  altText?: string;
  description?: string;
  displayName?: string;
}

// ============================================================================
// AI Generation Types
// ============================================================================

export interface AIGeneratedMetadata {
  altText: string;
  description: string;
  displayName: string;
}

export interface AIGenerationRequest {
  imageBase64: string;
  category: GalleryCategory;
}

export interface AIGenerationResponse {
  metadata: AIGeneratedMetadata;
}
