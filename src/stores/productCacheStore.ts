import { create } from 'zustand';
import { ShopifyProduct } from '@/lib/shopify';

interface ProductCacheStore {
  products: Map<string, ShopifyProduct>;
  productsList: ShopifyProduct[];
  lastFetch: number | null;
  isLoading: boolean;
  
  // Actions
  setProducts: (products: ShopifyProduct[]) => void;
  getProduct: (id: string) => ShopifyProduct | undefined;
  clearCache: () => void;
  isCacheValid: (maxAge?: number) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const useProductCacheStore = create<ProductCacheStore>((set, get) => ({
  products: new Map(),
  productsList: [],
  lastFetch: null,
  isLoading: false,

  setProducts: (products: ShopifyProduct[]) => {
    const productsMap = new Map<string, ShopifyProduct>();
    products.forEach(product => {
      productsMap.set(product.node.id, product);
    });
    
    set({
      products: productsMap,
      productsList: products,
      lastFetch: Date.now(),
      isLoading: false,
    });
  },

  getProduct: (id: string) => {
    return get().products.get(id);
  },

  clearCache: () => {
    set({
      products: new Map(),
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
}));
