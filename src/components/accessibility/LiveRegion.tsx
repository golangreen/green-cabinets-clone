import { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
}

/**
 * Screen reader live region for dynamic announcements
 */
export function LiveRegion({ message, priority = "polite" }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && message) {
      // Clear and set message to trigger screen reader announcement
      ref.current.textContent = "";
      setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
