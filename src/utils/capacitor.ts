import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardStyle, KeyboardResize } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNativeApp = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isAndroid = () => Capacitor.getPlatform() === 'android';

// Initialize native features
export const initializeNativeFeatures = async () => {
  if (!isNativeApp()) return;

  try {
    // Configure Status Bar for iOS
    if (isIOS()) {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      
      // Configure Keyboard
      await Keyboard.setStyle({ style: KeyboardStyle.Dark });
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    }
  } catch (error) {
    console.error('Error initializing native features:', error);
  }
};

// Haptic feedback helpers
export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!isNativeApp()) return;
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

export const hapticSelection = async () => {
  if (!isNativeApp()) return;
  try {
    await Haptics.selectionStart();
    setTimeout(() => Haptics.selectionEnd(), 100);
  } catch (error) {
    console.error('Haptic selection error:', error);
  }
};

// Safe area helpers for iOS notch
export const getSafeAreaInsets = () => {
  if (!isIOS()) return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const root = document.documentElement;
  return {
    top: parseInt(getComputedStyle(root).getPropertyValue('--sat') || '0'),
    bottom: parseInt(getComputedStyle(root).getPropertyValue('--sab') || '0'),
    left: parseInt(getComputedStyle(root).getPropertyValue('--sal') || '0'),
    right: parseInt(getComputedStyle(root).getPropertyValue('--sar') || '0'),
  };
};
