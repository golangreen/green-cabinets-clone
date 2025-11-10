import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greencabinets.designer',
  appName: 'Green Cabinets',
  webDir: 'dist',
  server: {
    url: 'https://90bce6da-512b-48f1-874c-7d0142de1705.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
    backgroundColor: '#000000',
    buildNumber: '1'
  },
  android: {
    allowMixedContent: true,
    adaptiveIcon: {
      foreground: 'public/logo.png',
      background: '#1e7b5f'
    },
    versionCode: 1,
    versionName: '1.0.0'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#10B981'
    },
    Camera: {
      iosPermissions: {
        cameraUsageDescription: 'This app requires camera access to scan your room in 3D and capture accurate measurements for designing custom cabinets.',
        photosUsageDescription: 'This app needs access to your photo library to save room scans and design images.'
      },
      androidPermissions: {
        permissions: ['android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES', 'android.permission.WRITE_EXTERNAL_STORAGE']
      }
    }
  }
};

export default config;
