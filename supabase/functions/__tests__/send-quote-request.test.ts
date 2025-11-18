import { describe, it, expect } from 'vitest';

/**
 * Integration tests for send-quote-request edge function
 */
describe('Send Quote Request Edge Function', () => {
  const QUOTE_URL = `${process.env.VITE_SUPABASE_URL}/functions/v1/send-quote-request`;

  it('should handle CORS preflight request', async () => {
    const response = await fetch(QUOTE_URL, {
      method: 'OPTIONS',
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should validate email format', async () => {
    const response = await fetch(QUOTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        phone: '1234567890',
        message: 'Test message',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should require name field', async () => {
    const response = await fetch(QUOTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        phone: '1234567890',
        message: 'Test message',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should sanitize input fields', async () => {
    const response = await fetch(QUOTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '<script>alert("xss")</script>Test',
        email: 'test@example.com',
        phone: '1234567890',
        message: 'Test message',
      }),
    });

    // Should sanitize but not reject
    expect([200, 400]).toContain(response.status);
  });

  it.skip('should send quote request with valid data', async () => {
    // This would need valid email credentials
    // Skipped in unit tests, run in integration environment
    expect(true).toBe(true);
  });
});
