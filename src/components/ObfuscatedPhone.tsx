/**
 * ObfuscatedPhone component protects phone numbers from bot scrapers
 * Numbers are encoded and rendered client-side only
 */
import { useEffect, useState } from 'react';

interface ObfuscatedPhoneProps {
  encoded: string; // Base64 encoded phone number
  className?: string;
  type?: 'tel' | 'sms';
}

export default function ObfuscatedPhone({ encoded, className = '', type = 'tel' }: ObfuscatedPhoneProps) {
  const [phone, setPhone] = useState<{ display: string; link: string } | null>(null);

  useEffect(() => {
    // Decode on client-side only (bots typically don't execute JS)
    try {
      const decoded = atob(encoded);
      const formatted = decoded.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      setPhone({
        display: formatted,
        link: `${type}:+1${decoded}`
      });
    } catch (error) {
      console.error('Failed to decode phone number');
    }
  }, [encoded, type]);

  if (!phone) {
    // Show nothing while loading (prevents SSR exposure)
    return <span className={className}>Loading...</span>;
  }

  return (
    <a 
      href={phone.link}
      className={className}
      aria-label={`Call ${phone.display}`}
    >
      {phone.display}
    </a>
  );
}

// Helper function to encode phone numbers (use this in your code)
// Example: encodePhone('7188045488') => 'NzE4ODA0NTQ4OA=='
export function encodePhone(phone: string): string {
  return btoa(phone.replace(/\D/g, ''));
}
