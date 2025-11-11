export interface RoomScanData {
  id: string;
  user_id?: string;
  room_type: 'kitchen' | 'bathroom' | 'bedroom' | 'office' | 'other';
  measurements: RoomMeasurements;
  photos: RoomPhoto[];
  lidar_data?: LidarData;
  created_at: string;
  updated_at: string;
}

export interface RoomMeasurements {
  length: number;
  width: number;
  height: number;
  floor_area: number;
  wall_measurements: WallMeasurement[];
  ceiling_type?: 'flat' | 'vaulted' | 'coffered' | 'tray';
}

export interface WallMeasurement {
  id: string;
  wall_name: string;
  length: number;
  height: number;
  doors: Opening[];
  windows: Opening[];
  obstacles?: Obstacle[];
}

export interface Opening {
  id: string;
  type: 'door' | 'window';
  x: number;
  y: number;
  width: number;
  height: number;
  from_floor?: number;
}

export interface Obstacle {
  id: string;
  type: 'electrical' | 'plumbing' | 'hvac' | 'structural' | 'other';
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  description?: string;
}

export interface RoomPhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  wall_id?: string;
  metadata?: PhotoMetadata;
  created_at: string;
}

export interface PhotoMetadata {
  camera_position?: { x: number; y: number; z: number };
  orientation?: 'portrait' | 'landscape';
  focal_length?: number;
  exposure?: string;
}

export interface LidarData {
  points: LidarPoint[];
  accuracy: number;
  scan_date: string;
  device_info?: string;
}

export interface LidarPoint {
  x: number;
  y: number;
  z: number;
  intensity?: number;
}

export interface RoomTemplate {
  id: string;
  name: string;
  room_type: 'kitchen' | 'bathroom' | 'bedroom' | 'office';
  description?: string;
  typical_dimensions: RoomMeasurements;
  suggested_products: string[];
  thumbnail?: string;
}
