/**
 * Keyless spam protection fallback.
 *
 * Used when no reCAPTCHA site key is configured: a hidden honeypot field plus
 * a minimum dwell time. Both are verified server-side in the edge function.
 * When a real reCAPTCHA key is configured, the token takes precedence.
 */
import { useCallback, useRef } from "react";

export const MIN_DWELL_MS = 3000;

export interface SpamGuard {
  hp: string;
  elapsedMs: number;
}

export function useSpamGuard() {
  const mountedAt = useRef<number>(Date.now());
  const hpRef = useRef<HTMLInputElement>(null);

  const getGuard = useCallback(
    (): SpamGuard => ({
      hp: hpRef.current?.value ?? "",
      elapsedMs: Date.now() - mountedAt.current,
    }),
    [],
  );

  const reset = useCallback(() => {
    mountedAt.current = Date.now();
    if (hpRef.current) hpRef.current.value = "";
  }, []);

  // Spread onto a hidden <input>. Off-screen (not display:none) so bots fill it.
  const honeypotProps = {
    ref: hpRef,
    type: "text",
    name: "company_website",
    tabIndex: -1,
    autoComplete: "off",
    "aria-hidden": true as const,
    className:
      "absolute left-[-9999px] top-0 h-px w-px opacity-0 pointer-events-none",
  };

  return { getGuard, reset, honeypotProps };
}
