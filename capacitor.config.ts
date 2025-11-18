import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.90bce6da512b48f1874c7d0142de1705',
  appName: 'green-cabinets-clone',
  webDir: 'dist',
  server: {
    url: 'https://90bce6da-512b-48f1-874c-7d0142de1705.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      iosPermissions: {
        cameraUsageDescription: 'We need camera access to scan rooms and take measurements for your custom cabinets.',
        photosUsageDescription: 'We need photo library access to save and load room scans.'
      }
    }
  }
};

export default config;
