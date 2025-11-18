import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuoteService } from '../quoteService';
import { createMockSupabaseClient } from '@/test/utils';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('QuoteService', () => {
  let service: QuoteService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
    service = new QuoteService();
  });

  describe('submitQuote', () => {
    const validQuoteRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      message: 'Need custom cabinets',
      projectType: 'kitchen',
      description: 'Need custom cabinets',
    };

    it('should submit quote successfully', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const result = await service.submitQuote(validQuoteRequest);

      expect(result.success).toBe(true);
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-quote-request',
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
          }),
        })
      );
    });

    it('should validate email format', async () => {
      const invalidRequest = {
        ...validQuoteRequest,
        email: 'invalid-email',
      };

      const result = await service.submitQuote(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should sanitize input', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const requestWithScript = {
        ...validQuoteRequest,
        description: '<script>alert("xss")</script>Safe description',
      };

      await service.submitQuote(requestWithScript);

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-quote-request',
        expect.objectContaining({
          body: expect.objectContaining({
            description: expect.not.stringContaining('<script>'),
          }),
        })
      );
    });

    it('should handle edge function errors', async () => {
      mockSupabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Rate limit exceeded' },
      });

      const result = await service.submitQuote(validQuoteRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });
  });
});
