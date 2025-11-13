import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShopifyProduct } from '@/lib/shopify/types';
import { createStorefrontCheckout } from '@/lib/shopify/client';
import { logger } from '@/lib/logger';
import { trackOperation } from '@/lib/performance';
import { cartPersistenceConfig } from '@/lib/cartPersistence';
import {
  queueAddItem,
  queueUpdateQuantity,
  queueRemoveItem,
  queueCheckout,
  shouldQueueOperation,
  setupCartSync,
} from '@/lib/cartSync';
import {
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  findCartItem,
} from '@/services/cartService';

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
        // Queue if offline
        if (shouldQueueOperation()) {
          queueAddItem(item);
          return;
        }
        
        const { items } = get();
        const existingItem = findCartItem(items, item.variantId);
        
        // Track cart add performance
        trackOperation(
          'cart-add-item',
          async () => {
            set({ items: addOrUpdateCartItem(items, item) });
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
        
        // Queue if offline
        if (shouldQueueOperation()) {
          queueUpdateQuantity(variantId, quantity);
          return;
        }
        
        set({
          items: updateCartItemQuantity(get().items, variantId, quantity)
        });
        
        logger.info('Quantity updated', { component: 'CartStore', variantId, quantity });
      },

      removeItem: (variantId) => {
        // Queue if offline
        if (shouldQueueOperation()) {
          queueRemoveItem(variantId);
          return;
        }
        
        set({
          items: removeCartItem(get().items, variantId)
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

        // Queue if offline
        if (shouldQueueOperation()) {
          queueCheckout();
          return null;
        }

        setLoading(true);
        
        try {
          const checkoutUrl = await trackOperation(
            'checkout-create',
            async () => {
              return await createStorefrontCheckout(items);
            },
            { component: 'CartStore', itemCount: items.length }
          );
          
          setCheckoutUrl(checkoutUrl);
          logger.info('Checkout created', { component: 'CartStore', url: checkoutUrl });
          return checkoutUrl;
        } catch (error) {
          logger.error('Failed to create checkout', { component: 'CartStore', error });
          throw error;
        } finally {
          setLoading(false);
        }
      }
    }),
    cartPersistenceConfig
  )
);

// Setup background sync on initialization
if (typeof window !== 'undefined') {
  setupCartSync(() => {
    const store = useCartStore.getState();
    return {
      addItem: store.addItem,
      updateQuantity: store.updateQuantity,
      removeItem: store.removeItem,
      createCheckout: store.createCheckout,
    };
  });
}
