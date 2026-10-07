import type { CapacitorConfig } from "@capacitor/cli";

// The Green Cabinets iPhone app: the website, bundled, plus the native LiDAR
// room scan (ios/App/App/RoomScanPlugin.swift).
const config: CapacitorConfig = {
  appId: "com.greencabinetsny.app",
  appName: "Green Cabinets",
  webDir: "dist",
  ios: {
    backgroundColor: "#0E0D0C",
    contentInset: "never",
    scheme: "Green Cabinets",
  },
  plugins: {
    // Keep the branded launch screen until the page has drawn, so a cold start
    // never shows an empty dark screen. main.tsx hides it as soon as content
    // is on screen; the 6 s auto-hide is the safety net if the page never loads.
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 6000,
      backgroundColor: "#0E0D0C",
      showSpinner: false,
    },
  },
};

export default config;
