import { useState } from 'react';

export const useVanityRoomConfig = () => {
  const [includeRoom, setIncludeRoom] = useState(true);
  const [roomLength, setRoomLength] = useState("120");
  const [roomWidth, setRoomWidth] = useState("96");
  const [floorType, setFloorType] = useState("tile");
  const [tileColor, setTileColor] = useState("#d4d4d4");
  const [woodFloorFinish, setWoodFloorFinish] = useState("natural-oak");

  return {
    includeRoom,
    setIncludeRoom,
    roomLength,
    setRoomLength,
    roomWidth,
    setRoomWidth,
    floorType,
    setFloorType,
    tileColor,
    setTileColor,
    woodFloorFinish,
    setWoodFloorFinish,
  };
};
