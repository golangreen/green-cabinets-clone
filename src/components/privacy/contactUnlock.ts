/**
 * Session-scoped "human verified" gate for contact details.
 * One successful check unlocks every phone/email on the site for the session.
 */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gc_contact_unlocked";
const EVENT = "gc-contact-unlock";

export function isContactUnlocked(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockContacts() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useContactUnlock() {
  const [unlocked, setUnlocked] = useState<boolean>(() => isContactUnlocked());

  useEffect(() => {
    const sync = () => setUnlocked(isContactUnlocked());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  return { unlocked, unlock: useCallback(() => unlockContacts(), []) };
}
