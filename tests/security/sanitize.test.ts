import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeURL,
  sanitizeSQL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFilePath,
  sanitizeString,
} from '@/lib/security/sanitize';

describe('Security Sanitization', () => {
  describe('sanitizeHTML', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHTML(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should preserve text content', () => {
      const input = 'Hello World';
      const result = sanitizeHTML(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeURL(url)).toBe(url);
    });

    it('should allow https URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeURL(url)).toBe(url);
    });

    it('should block javascript: URLs', () => {
      const url = 'javascript:alert("xss")';
      expect(sanitizeURL(url)).toBe('');
    });

    it('should block data: URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      expect(sanitizeURL(url)).toBe('');
    });

    it('should handle empty input', () => {
      expect(sanitizeURL('')).toBe('');
    });
  });

  describe('sanitizeSQL', () => {
    it('should remove SQL keywords', () => {
      const input = "SELECT * FROM users";
      const result = sanitizeSQL(input);
      expect(result).not.toContain('SELECT');
    });

    it('should remove SQL comments', () => {
      const input = "username' -- comment";
      const result = sanitizeSQL(input);
      expect(result).not.toContain('--');
    });

    it('should preserve safe text', () => {
      const input = 'John Doe';
      const result = sanitizeSQL(input);
      expect(result).toBe('John Doe');
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      const email = 'user@example.com';
      expect(sanitizeEmail(email)).toBe(email);
    });

    it('should normalize email case', () => {
      const email = 'User@Example.COM';
      expect(sanitizeEmail(email)).toBe('user@example.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('notanemail')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
      expect(sanitizeEmail('user@')).toBe('');
    });

    it('should trim whitespace', () => {
      const email = '  user@example.com  ';
      expect(sanitizeEmail(email)).toBe('user@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(sanitizePhone('1234567890')).toBe('1234567890');
      expect(sanitizePhone('+11234567890')).toBe('+11234567890');
    });

    it('should remove formatting', () => {
      const phone = '(123) 456-7890';
      expect(sanitizePhone(phone)).toBe('1234567890');
    });

    it('should reject invalid phones', () => {
      expect(sanitizePhone('123')).toBe(''); // Too short
      expect(sanitizePhone('abc')).toBe(''); // Non-numeric
    });
  });

  describe('sanitizeFilePath', () => {
    it('should remove directory traversal', () => {
      const path = '../../../etc/passwd';
      const result = sanitizeFilePath(path);
      expect(result).not.toContain('..');
      expect(result).not.toContain('/');
    });

    it('should preserve safe paths', () => {
      const path = 'uploads_document.pdf';
      const result = sanitizeFilePath(path);
      expect(result).toBe(path);
    });
  });

  describe('sanitizeString', () => {
    it('should remove special characters', () => {
      const input = 'Hello<script>World';
      const result = sanitizeString(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should allow specified characters', () => {
      const input = 'user-name@example.com';
      const result = sanitizeString(input, '-@.');
      expect(result).toBe(input);
    });

    it('should preserve alphanumeric', () => {
      const input = 'User123';
      const result = sanitizeString(input);
      expect(result).toBe(input);
    });
  });
});
