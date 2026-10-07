import { Capacitor } from "@capacitor/core";

/** True inside the Green Cabinets iPhone app, false on the website. */
export const isApp = () => Capacitor.isNativePlatform();
