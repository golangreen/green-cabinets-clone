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
        cameraUsageDescription: 'Take photos of your space to design custom cabinets with accurate measurements.',
        photosUsageDescription: 'Access your photos to load room images for cabinet design and measurements.'
      },
      androidPermissions: {
        permissions: ['camera', 'read_external_storage', 'write_external_storage']
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
