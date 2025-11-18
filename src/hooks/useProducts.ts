/**
 * Custom hook for fetching and managing products
 */
import { useState, useEffect } from 'react';
import { shopifyService } from '@/services';
import type { ShopifyProduct } from '@/types';

export function useProducts(limit: number = 50) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await shopifyService.getProducts(limit);
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await shopifyService.getProducts(limit);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    refetch,
  };
}
