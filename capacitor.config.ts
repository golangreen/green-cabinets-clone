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
};

export default config;
