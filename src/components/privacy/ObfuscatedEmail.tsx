/**
 * ObfuscatedEmail component protects email addresses from bot scrapers
 * Emails are encoded and rendered client-side only
 */
import { useEffect, useState } from 'react';

interface ObfuscatedEmailProps {
  encoded: string; // Base64 encoded email address
  className?: string;
  children?: React.ReactNode; // Optional custom display text
}

export default function ObfuscatedEmail({ encoded, className = '', children }: ObfuscatedEmailProps) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Decode on client-side only (bots typically don't execute JS)
    try {
      const decoded = atob(encoded);
      setEmail(decoded);
    } catch (error) {
      console.error('Failed to decode email address');
    }
  }, [encoded]);

  if (!email) {
    // Show nothing while loading (prevents SSR exposure)
    return <span className={className}>Loading...</span>;
  }

  return (
    <a 
      href={`mailto:${email}`}
      className={className}
      aria-label={`Email ${email}`}
    >
      {children || email}
    </a>
  );
}

// Helper function to encode email addresses (use this in your code)
// Example: encodeEmail('orders@greencabinetsny.com') => 'b3JkZXJzQGdyZWVuY2FiaW5ldHNueS5jb20='
export function encodeEmail(email: string): string {
  return btoa(email.trim().toLowerCase());
}
