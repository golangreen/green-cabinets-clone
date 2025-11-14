/**
 * Gallery Feature - Public API
 * All external imports should come from this file
 */

// Hooks
export {
  useGalleryManager,
  useGalleryContext,
  GalleryProvider,
} from './hooks';

// Query hooks for fetching gallery data
export {
  useGalleryImages,
  useHeroImages,
  useGalleryImagesByCategory,
  type GalleryImage,
  type GalleryImageRecord,
} from './hooks/useGalleryQueries';

// Components
export {
  GalleryErrorBoundary,
  GalleryFileSelector,
  GalleryImageProcessor,
  LazyImage,
} from './components';

// Types
export type {
  ImagePreview,
  CompressionQuality,
  ImageQualityIssue,
  ImageQualityResult,
} from './types';
