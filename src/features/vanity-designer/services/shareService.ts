interface VanityConfigForSharing {
  brand: string;
  finish: string;
  width: string;
  widthFraction: string;
  height: string;
  heightFraction: string;
  depth: string;
  depthFraction: string;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition: string;
  includeRoom: boolean;
  roomLength: string;
  roomWidth: string;
  floorType: string;
  tileColor: string;
  woodFloorFinish: string;
  includeWalls: boolean;
  wallTileColor: string;
  state: string;
}

/**
 * Encode vanity configuration into a shareable URL
 */
export const generateShareableURL = (config: VanityConfigForSharing): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();

  // Add all configuration parameters
  params.set('brand', config.brand);
  params.set('finish', config.finish);
  params.set('w', config.width);
  params.set('wf', config.widthFraction);
  params.set('h', config.height);
  params.set('hf', config.heightFraction);
  params.set('d', config.depth);
  params.set('df', config.depthFraction);
  params.set('door', config.doorStyle);
  params.set('drawers', config.numDrawers.toString());
  params.set('handle', config.handleStyle);
  params.set('pos', config.cabinetPosition);
  
  if (config.includeRoom) {
    params.set('room', '1');
    params.set('rl', config.roomLength);
    params.set('rw', config.roomWidth);
    params.set('floor', config.floorType);
    if (config.floorType === 'tile') {
      params.set('tc', config.tileColor);
    } else {
      params.set('wf', config.woodFloorFinish);
    }
  }

  if (config.includeWalls) {
    params.set('walls', '1');
    params.set('wtc', config.wallTileColor);
  }

  if (config.state) {
    params.set('state', config.state);
  }

  return `${baseUrl}/designer?${params.toString()}`;
};

/**
 * Decode URL parameters into vanity configuration
 */
export const decodeShareableURL = (): Partial<VanityConfigForSharing> | null => {
  const params = new URLSearchParams(window.location.search);
  
  // Check if this is a shared design URL
  if (!params.has('brand') || !params.has('finish')) {
    return null;
  }

  const config: Partial<VanityConfigForSharing> = {
    brand: params.get('brand') || '',
    finish: params.get('finish') || '',
    width: params.get('w') || '48',
    widthFraction: params.get('wf') || '0',
    height: params.get('h') || '34',
    heightFraction: params.get('hf') || '0',
    depth: params.get('d') || '21',
    depthFraction: params.get('df') || '0',
    doorStyle: params.get('door') || 'double',
    numDrawers: parseInt(params.get('drawers') || '3'),
    handleStyle: params.get('handle') || 'bar',
    cabinetPosition: params.get('pos') || 'centered',
    includeRoom: params.get('room') === '1',
    includeWalls: params.get('walls') === '1',
    state: params.get('state') || '',
  };

  if (config.includeRoom) {
    config.roomLength = params.get('rl') || '10';
    config.roomWidth = params.get('rw') || '8';
    config.floorType = params.get('floor') || 'tile';
    
    if (config.floorType === 'tile') {
      config.tileColor = params.get('tc') || 'white-marble';
    } else {
      config.woodFloorFinish = params.get('wf') || 'natural-oak';
    }
  }

  if (config.includeWalls) {
    config.wallTileColor = params.get('wtc') || 'white-subway';
  }

  return config;
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    textArea.remove();
    
    return successful;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
