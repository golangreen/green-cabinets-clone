/**
 * Renders the business phone number as a plain, clickable tel:/sms: link.
 *
 * The number is still passed base64-encoded (existing call sites), but it is
 * decoded synchronously and shown in full: (718) 804-5488 is the public
 * business line and must be readable by customers, search engines and the
 * build-time pre-render. `alwaysReveal` is kept for compatibility; numbers
 * are always revealed now.
 */
interface ObfuscatedPhoneProps {
  encoded: string; // Base64 encoded phone number
  className?: string;
  type?: 'tel' | 'sms';
  alwaysReveal?: boolean;
}

function decodePhone(encoded: string): string | null {
  try {
    const decoded = atob(encoded); // atob also exists in Node, so this works in the pre-render
    return /^\d{10}$/.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export default function ObfuscatedPhone({ encoded, className = '', type = 'tel' }: ObfuscatedPhoneProps) {
  const digits = decodePhone(encoded);
  if (!digits) return null;
  const display = digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  return (
    <a href={`${type}:+1${digits}`} className={className} aria-label={`Call ${display}`}>
      {display}
    </a>
  );
}

// Helper function to encode phone numbers (use this in your code)
// Example: encodePhone('7188045488') => 'NzE4ODA0NTQ4OA=='
export function encodePhone(phone: string): string {
  return btoa(phone.replace(/\D/g, ''));
}
