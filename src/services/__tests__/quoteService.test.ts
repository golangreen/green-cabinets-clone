import { describe, it, vi, expect, beforeEach } from 'vitest';
import { quoteService } from '../quoteService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
    })),
  },
}));

describe('QuoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a quote by id', async () => {
    const mockQuote = { id: '1', text: 'Hello World' };
    (supabase.from('quotes').select().eq().single as any).mockResolvedValue({
      data: mockQuote,
      error: null,
    });

    const result = await quoteService.getQuoteById('1');
    expect(result).toEqual(mockQuote);
    expect(supabase.from).toHaveBeenCalledWith('quotes');
  });
});
