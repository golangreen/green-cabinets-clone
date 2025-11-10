import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greencabinets.designer',
  appName: 'Kitchen Designer Pro',
  webDir: 'dist',
  server: {
    url: 'https://90bce6da-512b-48f1-874c-7d0142de1705.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      iosPermissions: {
        cameraUsageDescription: 'This app requires camera access to scan your room in 3D and capture accurate measurements for designing custom cabinets. Your photos are processed locally and never uploaded without your permission.',
        photosUsageDescription: 'This app needs access to your photo library to save room scans and load images for accurate cabinet design and measurements.'
      },
      androidPermissions: {
        permissions: ['android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES', 'android.permission.WRITE_EXTERNAL_STORAGE']
      }
    }
  },
  ios: {
    contentInset: 'automatic',
    icon: 'public/logo.png',
    buildNumber: '1'
  },
  android: {
    allowMixedContent: true,
    icon: 'public/logo.png',
    adaptiveIcon: {
      foreground: 'public/logo.png',
      background: '#1e7b5f'
    },
    versionCode: 1,
    versionName: '1.0.0'
  }
};

export default config;
