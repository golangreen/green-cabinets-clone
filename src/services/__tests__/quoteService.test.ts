import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    functions: { invoke: vi.fn() },
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

import { QuoteService } from '../quoteService';

describe('QuoteService', () => {
  let service: QuoteService;

  const validRequest = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    message: 'Need custom cabinets for my kitchen remodel',
    projectType: 'kitchen',
    recaptchaToken: 'token-abc',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QuoteService();
  });

  it('submits quote successfully', async () => {
    mockSupabase.functions.invoke.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await service.submitQuote(validRequest);

    expect(result.success).toBe(true);
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
      'send-contact-form',
      expect.objectContaining({
        body: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          recaptchaToken: 'token-abc',
        }),
      }),
    );
  });

  it('rejects invalid email format', async () => {
    const result = await service.submitQuote({ ...validRequest, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/email/i);
    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();
  });

  it('rejects missing reCAPTCHA token', async () => {
    const { recaptchaToken, ...noToken } = validRequest;
    const result = await service.submitQuote(noToken);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/recaptcha/i);
  });

  it('rejects message that is too short', async () => {
    const result = await service.submitQuote({ ...validRequest, message: 'short' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/message/i);
  });

  it('surfaces edge function errors', async () => {
    mockSupabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Rate limit exceeded' },
    });

    const result = await service.submitQuote(validRequest);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Rate limit exceeded');
  });

  it('formats contact info', () => {
    expect(service.formatContactInfo(validRequest)).toBe('John Doe - john@example.com - 555-1234');
    expect(
      service.formatContactInfo({ ...validRequest, phone: undefined }),
    ).toBe('John Doe - john@example.com');
  });
});
