import { useState } from 'react';

export const useVanityFinishes = () => {
  const [selectedBrand, setSelectedBrand] = useState("EGGER");
  const [selectedFinish, setSelectedFinish] = useState("Natural Halifax Oak");

  return {
    selectedBrand,
    setSelectedBrand,
    selectedFinish,
    setSelectedFinish,
  };
};
