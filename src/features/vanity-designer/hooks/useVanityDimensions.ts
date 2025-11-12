/**
 * useVanityDimensions Hook
 * Manages vanity dimension state and validation
 */

import { useState, useMemo } from 'react';
import { inchesWithFractionToDecimal } from '../services/vanityPricingService';

export interface VanityDimensions {
  width: string;
  height: string;
  depth: string;
  widthFraction: string;
  heightFraction: string;
  depthFraction: string;
}

export function useVanityDimensions() {
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [widthFraction, setWidthFraction] = useState<string>('0');
  const [heightFraction, setHeightFraction] = useState<string>('0');
  const [depthFraction, setDepthFraction] = useState<string>('0');

  const dimensionsInInches = useMemo(
    () => ({
      width: inchesWithFractionToDecimal(parseFloat(width || '0'), parseInt(widthFraction)),
      height: inchesWithFractionToDecimal(parseFloat(height || '0'), parseInt(heightFraction)),
      depth: inchesWithFractionToDecimal(parseFloat(depth || '0'), parseInt(depthFraction)),
    }),
    [width, widthFraction, height, heightFraction, depth, depthFraction]
  );

  const setDimensions = (dims: Partial<VanityDimensions>) => {
    if (dims.width !== undefined) setWidth(dims.width);
    if (dims.height !== undefined) setHeight(dims.height);
    if (dims.depth !== undefined) setDepth(dims.depth);
    if (dims.widthFraction !== undefined) setWidthFraction(dims.widthFraction);
    if (dims.heightFraction !== undefined) setHeightFraction(dims.heightFraction);
    if (dims.depthFraction !== undefined) setDepthFraction(dims.depthFraction);
  };

  return {
    width,
    setWidth,
    height,
    setHeight,
    depth,
    setDepth,
    widthFraction,
    setWidthFraction,
    heightFraction,
    setHeightFraction,
    depthFraction,
    setDepthFraction,
    dimensionsInInches,
    setDimensions,
  };
}
