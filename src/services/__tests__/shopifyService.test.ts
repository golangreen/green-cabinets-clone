import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopifyService } from '../shopifyService';

// Mock fetch globally
global.fetch = vi.fn();

describe('ShopifyService', () => {
  let service: ShopifyService;

  beforeEach(() => {
    service = new ShopifyService();
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = {
        data: {
          products: {
            edges: [
              {
                node: {
                  id: '1',
                  title: 'Test Product',
                  description: 'Test description',
                  handle: 'test-product',
                  priceRange: {
                    minVariantPrice: {
                      amount: '100.00',
                      currencyCode: 'USD',
                    },
                  },
                  images: { edges: [] },
                  variants: { edges: [] },
                  options: [],
                },
              },
            ],
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProducts,
      });

      const products = await service.getProducts(10);

      expect(products).toHaveLength(1);
      expect(products[0].node.title).toBe('Test Product');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(service.getProducts()).rejects.toThrow();
    });
  });

  describe('getProductByHandle', () => {
    it('should return product matching handle', async () => {
      const mockProducts = {
        data: {
          products: {
            edges: [
              {
                node: {
                  id: '1',
                  title: 'Test Product',
                  handle: 'test-product',
                  description: '',
                  priceRange: {
                    minVariantPrice: { amount: '100', currencyCode: 'USD' },
                  },
                  images: { edges: [] },
                  variants: { edges: [] },
                  options: [],
                },
              },
            ],
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const product = await service.getProductByHandle('test-product');

      expect(product).not.toBeNull();
      expect(product?.node.handle).toBe('test-product');
    });

    it('should return null if product not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { products: { edges: [] } } }),
      });

      const product = await service.getProductByHandle('nonexistent');

      expect(product).toBeNull();
    });
  });
});
