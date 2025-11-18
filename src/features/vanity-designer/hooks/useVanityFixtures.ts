import { useState } from 'react';

export const useVanityFixtures = () => {
  const [includeToilet, setIncludeToilet] = useState(false);
  const [toiletStyle, setToiletStyle] = useState<'modern' | 'traditional' | 'wall-mounted'>('modern');
  const [toiletPosition, setToiletPosition] = useState<'left' | 'right'>('right');
  const [includeShower, setIncludeShower] = useState(false);
  const [showerStyle, setShowerStyle] = useState<'walk-in' | 'enclosed' | 'corner'>('walk-in');
  const [includeBathtub, setIncludeBathtub] = useState(false);
  const [bathtubStyle, setBathtubStyle] = useState<'freestanding' | 'alcove' | 'corner'>('freestanding');
  const [bathtubPosition, setBathtubPosition] = useState<'left' | 'right' | 'back'>('left');
  const [includeMirror, setIncludeMirror] = useState(true);
  const [mirrorStyle, setMirrorStyle] = useState<'frameless' | 'framed'>('frameless');
  const [includeFaucet, setIncludeFaucet] = useState(true);
  const [faucetStyle, setFaucetStyle] = useState<'modern' | 'traditional' | 'industrial'>('modern');
  const [faucetFinish, setFaucetFinish] = useState<'chrome' | 'brushed-nickel' | 'matte-black' | 'gold'>('chrome');
  const [includeBacksplash, setIncludeBacksplash] = useState(true);
  const [backsplashHeight, setBacksplashHeight] = useState(4);
  const [backsplashMaterial, setBacksplashMaterial] = useState<'tile' | 'stone' | 'glass'>('tile');

  return {
    includeToilet,
    setIncludeToilet,
    toiletStyle,
    setToiletStyle,
    toiletPosition,
    setToiletPosition,
    includeShower,
    setIncludeShower,
    showerStyle,
    setShowerStyle,
    includeBathtub,
    setIncludeBathtub,
    bathtubStyle,
    setBathtubStyle,
    bathtubPosition,
    setBathtubPosition,
    includeMirror,
    setIncludeMirror,
    mirrorStyle,
    setMirrorStyle,
    includeFaucet,
    setIncludeFaucet,
    faucetStyle,
    setFaucetStyle,
    faucetFinish,
    setFaucetFinish,
    includeBacksplash,
    setIncludeBacksplash,
    backsplashHeight,
    setBacksplashHeight,
    backsplashMaterial,
    setBacksplashMaterial,
  };
};
