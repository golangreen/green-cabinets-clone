import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct } from '@/lib/shopify';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { CACHE_CONFIG } from '@/config';

interface ProductCacheStore {
  products: Record<string, ShopifyProduct>;
  productsList: ShopifyProduct[];
  lastFetch: number | null;
  isLoading: boolean;
  
  // Actions
  setProducts: (products: ShopifyProduct[]) => void;
  getProduct: (id: string) => ShopifyProduct | undefined;
  clearCache: () => void;
  isCacheValid: (maxAge?: number) => boolean;
  setLoading: (loading: boolean) => void;
}

const CACHE_DURATION = CACHE_CONFIG.PRODUCT_CACHE_DURATION;

export const useProductCacheStore = create<ProductCacheStore>()(
  persist(
    (set, get) => ({
      products: {},
      productsList: [],
      lastFetch: null,
      isLoading: false,

      setProducts: (products: ShopifyProduct[]) => {
        const productsMap: Record<string, ShopifyProduct> = {};
        products.forEach(product => {
          productsMap[product.node.id] = product;
        });
        
        set({
          products: productsMap,
          productsList: products,
          lastFetch: Date.now(),
          isLoading: false,
        });
      },

      getProduct: (id: string) => {
        return get().products[id];
      },

      clearCache: () => {
        set({
          products: {},
          productsList: [],
          lastFetch: null,
          isLoading: false,
        });
      },

      isCacheValid: (maxAge: number = CACHE_DURATION) => {
        const { lastFetch } = get();
        if (!lastFetch) return false;
        return Date.now() - lastFetch < maxAge;
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: CACHE_KEYS.PRODUCTS,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Migration from Map-based structure (v0) to object-based (v1)
        if (version === 0 && persistedState) {
          return {
            products: {},
            productsList: persistedState.productsList || [],
            lastFetch: persistedState.lastFetch || null,
            isLoading: false,
          };
        }
        return persistedState as ProductCacheStore;
      },
    }
  )
);
