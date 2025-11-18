import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface RoomMeasurement {
  width: number;
  height: number;
  depth: number;
  area: number;
  volume: number;
  walls: Wall[];
  windows: Feature[];
  doors: Feature[];
  timestamp: string;
}

export interface Wall {
  id: string;
  start: Point3D;
  end: Point3D;
  length: number;
  height: number;
}

export interface Feature {
  id: string;
  type: 'window' | 'door';
  position: Point3D;
  width: number;
  height: number;
  wallId: string;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ScanSession {
  id: string;
  roomName: string;
  measurements: RoomMeasurement;
  images: string[];
  createdAt: string;
}

class RoomScanner {
  private static instance: RoomScanner;
  
  private constructor() {}

  static getInstance(): RoomScanner {
    if (!RoomScanner.instance) {
      RoomScanner.instance = new RoomScanner();
    }
    return RoomScanner.instance;
  }

  async checkCapabilities(): Promise<{
    hasLiDAR: boolean;
    hasARKit: boolean;
    hasARCore: boolean;
    canScan: boolean;
  }> {
    // Check device capabilities
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    // LiDAR is available on iPhone 12 Pro and later, iPad Pro 2020 and later
    // This is a simplified check - in production, you'd use native code
    const hasLiDAR = isIOS && (
      userAgent.includes('iPhone13') || 
      userAgent.includes('iPhone14') ||
      userAgent.includes('iPhone15') ||
      userAgent.includes('iPhone16') ||
      userAgent.includes('iPad')
    );

    return {
      hasLiDAR,
      hasARKit: isIOS,
      hasARCore: isAndroid,
      canScan: isIOS || isAndroid
    };
  }

  async requestPermissions(): Promise<{ granted: boolean; message?: string }> {
    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return { granted: true };
      }
      
      if (permissions.camera === 'denied' || permissions.photos === 'denied') {
        return { 
          granted: false, 
          message: 'Camera access was denied. Please enable camera permissions in your device settings to use the room scanner.' 
        };
      }
      
      // Request permissions
      const request = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      
      if (request.camera === 'granted' && request.photos === 'granted') {
        return { granted: true };
      }
      
      return { 
        granted: false, 
        message: 'Camera and photo library access is required to scan rooms. Please grant permissions when prompted.' 
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { 
        granted: false, 
        message: 'Failed to request camera permissions. Please check your device settings.' 
      };
    }
  }
  
  async getPermissionStatus(): Promise<{
    camera: string;
    photos: string;
    needsRequest: boolean;
  }> {
    try {
      const permissions = await Camera.checkPermissions();
      return {
        camera: permissions.camera,
        photos: permissions.photos,
        needsRequest: permissions.camera !== 'granted' || permissions.photos !== 'granted'
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: 'prompt',
        photos: 'prompt',
        needsRequest: true
      };
    }
  }

  async captureImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  }

  // Simulated room scanning - In production, this would use native AR frameworks
  async startScan(roomName: string): Promise<ScanSession> {
    console.log('Starting room scan for:', roomName);
    
    // In a real implementation, this would:
    // 1. Initialize ARKit (iOS) or ARCore (Android)
    // 2. Enable plane detection
    // 3. Start LiDAR scanning if available
    // 4. Detect walls, windows, and doors using ML
    
    // For now, we'll create a mock session
    const mockMeasurements: RoomMeasurement = {
      width: 3.5,  // meters
      height: 2.4,
      depth: 4.2,
      area: 14.7,
      volume: 35.28,
      walls: [
        {
          id: 'wall-1',
          start: { x: 0, y: 0, z: 0 },
          end: { x: 3.5, y: 0, z: 0 },
          length: 3.5,
          height: 2.4
        },
        {
          id: 'wall-2',
          start: { x: 3.5, y: 0, z: 0 },
          end: { x: 3.5, y: 0, z: 4.2 },
          length: 4.2,
          height: 2.4
        },
        {
          id: 'wall-3',
          start: { x: 3.5, y: 0, z: 4.2 },
          end: { x: 0, y: 0, z: 4.2 },
          length: 3.5,
          height: 2.4
        },
        {
          id: 'wall-4',
          start: { x: 0, y: 0, z: 4.2 },
          end: { x: 0, y: 0, z: 0 },
          length: 4.2,
          height: 2.4
        }
      ],
      windows: [
        {
          id: 'window-1',
          type: 'window',
          position: { x: 1.75, y: 1.2, z: 0 },
          width: 1.2,
          height: 1.0,
          wallId: 'wall-1'
        }
      ],
      doors: [
        {
          id: 'door-1',
          type: 'door',
          position: { x: 3.5, y: 0, z: 2.0 },
          width: 0.9,
          height: 2.1,
          wallId: 'wall-2'
        }
      ],
      timestamp: new Date().toISOString()
    };

    return {
      id: `scan-${Date.now()}`,
      roomName,
      measurements: mockMeasurements,
      images: [],
      createdAt: new Date().toISOString()
    };
  }

  convertToFeet(meters: number): number {
    return meters * 3.28084;
  }

  convertToInches(meters: number): number {
    return meters * 39.3701;
  }

  formatMeasurement(meters: number, unit: 'metric' | 'imperial' = 'imperial'): string {
    if (unit === 'metric') {
      return `${meters.toFixed(2)}m`;
    } else {
      const feet = Math.floor(this.convertToFeet(meters));
      const inches = Math.round((this.convertToFeet(meters) - feet) * 12);
      return `${feet}'${inches}"`;
    }
  }

  saveScanToStorage(scan: ScanSession): void {
    try {
      const scans = this.getSavedScans();
      scans.push(scan);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('room_scans', JSON.stringify(scans));
      }
    } catch (error) {
      // Silent fail - components using useSavedScans hook will handle this
    }
  }

  getSavedScans(): ScanSession[] {
    try {
      if (typeof window === 'undefined') return [];
      const scans = window.localStorage.getItem('room_scans');
      return scans ? JSON.parse(scans) : [];
    } catch (error) {
      return [];
    }
  }

  deleteScan(scanId: string): void {
    try {
      const scans = this.getSavedScans();
      const filtered = scans.filter(s => s.id !== scanId);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('room_scans', JSON.stringify(filtered));
      }
    } catch (error) {
      // Silent fail - components using useSavedScans hook will handle this
    }
  }
}

export const roomScanner = RoomScanner.getInstance();
