import { useState } from 'react';

export const useVanityWalls = () => {
  const [includeWalls, setIncludeWalls] = useState(true);
  const [wallWidth, setWallWidth] = useState("96");
  const [wallHeight, setWallHeight] = useState("96");
  const [hasWindow, setHasWindow] = useState(false);
  const [hasDoor, setHasDoor] = useState(false);
  const [hasMedicineCabinet, setHasMedicineCabinet] = useState(false);
  const [medicineCabinetDoorType, setMedicineCabinetDoorType] = useState('single');
  const [wallFinishType, setWallFinishType] = useState<'paint' | 'tile'>('paint');
  const [wallPaintColor, setWallPaintColor] = useState('#e8e4dc');
  const [wallTileColor, setWallTileColor] = useState('#ffffff');

  return {
    includeWalls,
    setIncludeWalls,
    wallWidth,
    setWallWidth,
    wallHeight,
    setWallHeight,
    hasWindow,
    setHasWindow,
    hasDoor,
    setHasDoor,
    hasMedicineCabinet,
    setHasMedicineCabinet,
    medicineCabinetDoorType,
    setMedicineCabinetDoorType,
    wallFinishType,
    setWallFinishType,
    wallPaintColor,
    setWallPaintColor,
    wallTileColor,
    setWallTileColor,
  };
};
