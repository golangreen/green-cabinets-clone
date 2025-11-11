import { create } from 'zustand';

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: { url: string; altText?: string }[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: any[];
}

interface ProductCacheStore {
  products: Map<string, Product>;
  productsList: Product[];
  lastFetch: number | null;
  isLoading: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  getProduct: (id: string) => Product | undefined;
  clearCache: () => void;
  isCacheValid: (maxAge?: number) => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

export const useProductCacheStore = create<ProductCacheStore>((set, get) => ({
  products: new Map(),
  productsList: [],
  lastFetch: null,
  isLoading: false,

  setProducts: (products: Product[]) => {
    const productsMap = new Map<string, Product>();
    products.forEach(product => {
      productsMap.set(product.id, product);
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
