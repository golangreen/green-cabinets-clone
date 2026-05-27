import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Capacitor stripped — web-only fallback for greencabinetsny.com.
export function useCamera(onFiles: (files: File[]) => void) {
  const webInputRef = useRef<HTMLInputElement | null>(null);

  const capturePhoto = useCallback(async () => {
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
  }, [onFiles]);

  const pickFromGallery = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf,.csv,.txt,.xls,.xlsx';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) onFiles(files);
      };
      input.click();
    } catch {
      toast.error('Could not open file picker');
    }
  }, [onFiles]);

  return { capturePhoto, pickFromGallery };
}
