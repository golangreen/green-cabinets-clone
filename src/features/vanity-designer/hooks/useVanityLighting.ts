import { useState } from 'react';

export const useVanityLighting = () => {
  const [lightingType, setLightingType] = useState("ambient");
  const [brightness, setBrightness] = useState(0.8);
  const [colorTemperature, setColorTemperature] = useState(4000);

  return {
    lightingType,
    setLightingType,
    brightness,
    setBrightness,
    colorTemperature,
    setColorTemperature,
  };
};
