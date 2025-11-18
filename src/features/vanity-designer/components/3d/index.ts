// Measurement utilities
export { MeasurementLine, DimensionLabels } from './MeasurementTools';
export type { MeasurementLineProps } from './MeasurementTools';

// Material utilities
export {
  SCALE_FACTOR,
  getMaterialProps,
  createWoodTexture,
  createBumpMap
} from './MaterialUtils';
export type { MaterialProps, MeasurementType } from './MaterialUtils';

// Fixture components
export { 
  BathroomFixtures, 
  VanitySink, 
  MirrorCabinet,
  VanityFaucet,
  VanityBacksplash,
  VanityLighting,
  BathroomAccessories,
  Countertop
} from './fixtures';

// Room components
export { BathroomRoom, Lighting } from './room';

// Cabinet components
export { VanityCabinet } from './cabinet';

// Type definitions
export type { Vanity3DPreviewProps } from './types';
