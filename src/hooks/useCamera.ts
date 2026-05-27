import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

async function isCapacitorAvailable(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function useCamera(onFiles: (files: File[]) => void) {
  const webInputRef = useRef<HTMLInputElement | null>(null);

  const capturePhoto = useCallback(async () => {
    const isNative = await isCapacitorAvailable();

    if (isNative) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          correctOrientation: true,
        });

        if (photo.dataUrl) {
          const res = await fetch(photo.dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onFiles([file]);
        }
      } catch (err: any) {
        if (err?.message !== 'User cancelled photos app') {
          toast.error('Camera error — try uploading a file instead');
        }
      }
    } else {
      // Web fallback: trigger hidden input with camera capture
      if (!webInputRef.current) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || []);
          if (files.length > 0) onFiles(files);
        };
        webInputRef.current = input;
      }
      webInputRef.current.value = '';
      webInputRef.current.click();
    }
  }, [onFiles]);

  const pickFromGallery = useCallback(async () => {
    const isNative = await isCapacitorAvailable();

    if (isNative) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });

        if (photo.dataUrl) {
          const res = await fetch(photo.dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onFiles([file]);
        }
      } catch (err: any) {
        if (err?.message !== 'User cancelled photos app') {
          toast.error('Gallery error — try uploading a file instead');
        }
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf,.csv,.txt,.xls,.xlsx';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) onFiles(files);
      };
      input.click();
    }
  }, [onFiles]);

  return { capturePhoto, pickFromGallery };
}
