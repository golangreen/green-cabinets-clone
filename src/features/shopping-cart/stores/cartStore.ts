import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct } from '@/lib/shopify/types';
import { createStorefrontCheckout } from '@/lib/shopify/client';
import { logger } from '@/lib/logger';
import { backgroundSync } from '@/lib/backgroundSync';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { trackOperation } from '@/lib/performance';

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCartId: (cartId: string) => void;
  setCheckoutUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  createCheckout: () => Promise<string | null>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        // Check if offline
        if (!navigator.onLine) {
          logger.warn('Offline - queueing add item operation', { component: 'CartStore', variantId: item.variantId });
          backgroundSync.enqueue('add', item);
          return;
        }
        
        // Track cart add performance
        trackOperation(
          'cart-add-item',
          async () => {
            if (existingItem) {
              set({
                items: items.map(i =>
                  i.variantId === item.variantId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
              });
            } else {
              set({ items: [...items, item] });
            }
          },
          {
            component: 'CartStore',
            variantId: item.variantId,
            isExisting: !!existingItem
          }
        ).catch(error => {
          logger.error('Failed to track cart add operation', { error });
        });
        
        logger.info('Item added to cart', { component: 'CartStore', variantId: item.variantId });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        // Check if offline
        if (!navigator.onLine) {
          logger.warn('Offline - queueing update quantity operation', { component: 'CartStore', variantId, quantity });
          backgroundSync.enqueue('update', { variantId, quantity });
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
        });
        
        logger.info('Quantity updated', { component: 'CartStore', variantId, quantity });
      },

      removeItem: (variantId) => {
        // Check if offline
        if (!navigator.onLine) {
          logger.warn('Offline - queueing remove item operation', { component: 'CartStore', variantId });
          backgroundSync.enqueue('remove', { variantId });
          return;
        }
        
        set({
          items: get().items.filter(item => item.variantId !== variantId)
        });
        
        logger.info('Item removed from cart', { component: 'CartStore', variantId });
      },

      clearCart: () => {
        set({ items: [], cartId: null, checkoutUrl: null });
      },

      setCartId: (cartId) => set({ cartId }),
      setCheckoutUrl: (checkoutUrl) => set({ checkoutUrl }),
      setLoading: (isLoading) => set({ isLoading }),

      createCheckout: async () => {
        const { items, setLoading, setCheckoutUrl } = get();
        if (items.length === 0) {
          logger.warn('Cannot create checkout - cart is empty', { component: 'CartStore' });
          return null;
        }

        // Check if offline
        if (!navigator.onLine) {
          logger.warn('Offline - queueing checkout operation', { component: 'CartStore' });
          backgroundSync.enqueue('checkout', {});
          throw new Error('You are offline. Checkout will be created when connection is restored.');
        }

        setLoading(true);
        try {
          logger.info('Creating checkout', { component: 'CartStore', itemCount: items.length });
          
          // Track checkout creation performance
          const checkoutUrl = await trackOperation(
            'checkout-create',
            async () => {
              return await createStorefrontCheckout(items);
            },
            {
              component: 'CartStore',
              itemCount: items.length,
              totalValue: items.reduce((sum, item) => 
                sum + (parseFloat(item.price.amount) * item.quantity), 0
              )
            }
          );
          
          setCheckoutUrl(checkoutUrl);
          logger.info('Checkout created successfully', { component: 'CartStore' });
          return checkoutUrl;
        } catch (error) {
          logger.error('Failed to create checkout', { component: 'CartStore', error });
          
          // Queue for retry
          backgroundSync.enqueue('checkout', {});
          throw error;
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: CACHE_KEYS.CART,
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
