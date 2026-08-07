/**
 * ObfuscatedEmail protects email addresses from bot scrapers.
 * The address is base64-encoded, decoded client-side only, and hidden behind a
 * one-time "I'm not a robot" check (session-scoped) unless `alwaysReveal`.
 */
import { useEffect, useState } from 'react';
import { useContactUnlock } from './contactUnlock';
import ContactGateDialog from './ContactGateDialog';

interface ObfuscatedEmailProps {
  encoded: string; // Base64 encoded email address
  className?: string;
  children?: React.ReactNode; // Optional custom display text
  alwaysReveal?: boolean; // Skip the human check (e.g. post-purchase pages)
}

export default function ObfuscatedEmail({
  encoded,
  className = '',
  children,
  alwaysReveal = false,
}: ObfuscatedEmailProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const { unlocked } = useContactUnlock();

  useEffect(() => {
    try {
      setEmail(atob(encoded));
    } catch {
      console.error('Failed to decode email address');
    }
  }, [encoded]);

  if (!email) {
    return <span className={className}>Loading...</span>;
  }

  if (!alwaysReveal && !unlocked) {
    const [user, domain] = email.split('@');
    const masked = `${user.slice(0, 2)}${'•'.repeat(Math.max(user.length - 2, 3))}@${domain}`;
    return (
      <>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className={`${className} underline underline-offset-2`}
          aria-label="Verify you are human to reveal our email address"
        >
          {masked} <span className="whitespace-nowrap">(show)</span>
        </button>
        <ContactGateDialog open={gateOpen} onOpenChange={setGateOpen} />
      </>
    );
  }

  return (
    <a href={`mailto:${email}`} className={className} aria-label={`Email ${email}`}>
      {children || email}
    </a>
  );
}

// Helper function to encode email addresses (use this in your code)
// Example: encodeEmail('orders@greencabinetsny.com') => 'b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20='
export function encodeEmail(email: string): string {
  return btoa(email.trim().toLowerCase());
}
