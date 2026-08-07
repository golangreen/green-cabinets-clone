/**
 * ObfuscatedPhone protects phone numbers from bot scrapers.
 * Decoded client-side only and hidden behind a one-time "I'm not a robot"
 * check (session-scoped) unless `alwaysReveal`.
 */
import { useEffect, useState } from 'react';
import { useContactUnlock } from './contactUnlock';
import ContactGateDialog from './ContactGateDialog';

interface ObfuscatedPhoneProps {
  encoded: string; // Base64 encoded phone number
  className?: string;
  type?: 'tel' | 'sms';
  alwaysReveal?: boolean; // Skip the human check (e.g. post-purchase pages)
}

export default function ObfuscatedPhone({
  encoded,
  className = '',
  type = 'tel',
  alwaysReveal = false,
}: ObfuscatedPhoneProps) {
  const [phone, setPhone] = useState<{ display: string; link: string } | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const { unlocked } = useContactUnlock();

  useEffect(() => {
    try {
      const decoded = atob(encoded);
      const formatted = decoded.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      setPhone({ display: formatted, link: `${type}:+1${decoded}` });
    } catch {
      console.error('Failed to decode phone number');
    }
  }, [encoded, type]);

  if (!phone) {
    return <span className={className}>Loading...</span>;
  }

  if (!alwaysReveal && !unlocked) {
    const masked = phone.display.replace(/\d(?=\d{0,3}$)/g, '•').replace(/\d(?=.*\)\s)/g, '•');
    return (
      <>
        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className={`${className} underline underline-offset-2`}
          aria-label="Verify you are human to reveal our phone number"
        >
          {masked} <span className="whitespace-nowrap">(show)</span>
        </button>
        <ContactGateDialog open={gateOpen} onOpenChange={setGateOpen} />
      </>
    );
  }

  return (
    <a href={phone.link} className={className} aria-label={`Call ${phone.display}`}>
      {phone.display}
    </a>
  );
}

// Helper function to encode phone numbers (use this in your code)
// Example: encodePhone('7188045488') => 'NzE4ODA0NTQ4OA=='
export function encodePhone(phone: string): string {
  return btoa(phone.replace(/\D/g, ''));
}
