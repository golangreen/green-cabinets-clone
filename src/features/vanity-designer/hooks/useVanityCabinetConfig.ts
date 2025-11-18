import { useState } from 'react';

export const useVanityCabinetConfig = () => {
  const [doorStyle, setDoorStyle] = useState("shaker");
  const [numDrawers, setNumDrawers] = useState(2);
  const [handleStyle, setHandleStyle] = useState("modern");
  const [cabinetPosition, setCabinetPosition] = useState("floor");

  return {
    doorStyle,
    setDoorStyle,
    numDrawers,
    setNumDrawers,
    handleStyle,
    setHandleStyle,
    cabinetPosition,
    setCabinetPosition,
  };
};
