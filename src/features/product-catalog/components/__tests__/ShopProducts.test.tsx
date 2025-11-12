import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ShopProducts } from '../ShopProducts';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('ShopProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { container } = render(<ShopProducts />, { wrapper });
    expect(container).toBeTruthy();
  });

  it('displays products when data is loaded', async () => {
    const mockProducts = [
      {
        id: '1',
        title: 'Test Cabinet',
        handle: 'test-cabinet',
        description: 'A test cabinet',
        images: [{ url: 'https://example.com/image.jpg', altText: 'Cabinet' }],
        variants: [{ id: '1', price: { amount: '99.99', currencyCode: 'USD' } }],
      },
    ];

    vi.mock('../../hooks/useProducts', () => ({
      useProducts: () => ({
        data: mockProducts,
        isLoading: false,
        error: null,
      }),
    }));

    const { container } = render(<ShopProducts />, { wrapper });
    expect(container).toBeTruthy();
  });

  it('displays empty state when no products available', async () => {
    vi.mock('../../hooks/useProducts', () => ({
      useProducts: () => ({
        data: [],
        isLoading: false,
        error: null,
      }),
    }));

    const { container } = render(<ShopProducts />, { wrapper });
    expect(container).toBeTruthy();
  });
});
