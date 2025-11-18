import { useCallback, useMemo } from 'react';
import { useCartStore, CartItem } from '@/stores/cartStore';
import { toast } from 'sonner';

/**
 * Custom hook for cart operations
 * Provides a clean interface to cart state and operations
 */
export function useCart() {
  const store = useCartStore();
  
  // Computed values
  const totalItems = useMemo(
    () => store.items.reduce((sum, item) => sum + item.quantity, 0),
    [store.items]
  );

  const totalPrice = useMemo(
    () => store.items.reduce(
      (sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 
      0
    ),
    [store.items]
  );

  const isEmpty = store.items.length === 0;
  
  const currencyCode = store.items[0]?.price.currencyCode || 'USD';

  // Helper methods
  const addItem = useCallback((item: CartItem) => {
    store.addItem(item);
    toast.success('Added to cart', {
      description: `${item.product.node.title} added to your cart`,
      position: 'top-center',
    });
  }, [store]);

  const incrementItem = useCallback((variantId: string) => {
    const item = store.items.find(i => i.variantId === variantId);
    if (item) {
      store.updateQuantity(variantId, item.quantity + 1);
    }
  }, [store]);

  const decrementItem = useCallback((variantId: string) => {
    const item = store.items.find(i => i.variantId === variantId);
    if (item && item.quantity > 1) {
      store.updateQuantity(variantId, item.quantity - 1);
    } else if (item) {
      store.removeItem(variantId);
      toast.info('Removed from cart');
    }
  }, [store]);

  const removeItem = useCallback((variantId: string) => {
    const item = store.items.find(i => i.variantId === variantId);
    store.removeItem(variantId);
    if (item) {
      toast.info('Removed from cart', {
        description: `${item.product.node.title} removed from your cart`,
        position: 'top-center',
      });
    }
  }, [store]);

  const clearCart = useCallback(() => {
    store.clearCart();
    toast.info('Cart cleared');
  }, [store]);

  const getItemCount = useCallback((variantId: string) => {
    return store.items.find(i => i.variantId === variantId)?.quantity || 0;
  }, [store.items]);

  const hasItem = useCallback((variantId: string) => {
    return store.items.some(i => i.variantId === variantId);
  }, [store.items]);

  /**
   * Create checkout and handle popup blockers
   * Opens checkout in new tab with popup blocker prevention
   */
  const checkout = useCallback(async () => {
    if (isEmpty) {
      toast.error('Your cart is empty');
      return null;
    }

    // Open window immediately to avoid popup blockers
    const checkoutWindow = window.open('about:blank', '_blank');
    
    try {
      const checkoutUrl = await store.createCheckout();
      
      if (checkoutUrl && checkoutWindow) {
        checkoutWindow.location.href = checkoutUrl;
        return checkoutUrl;
      } else if (!checkoutWindow) {
        toast.error('Please allow popups to proceed to checkout', {
          position: 'top-center',
        });
        return null;
      }
      
      return checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      if (checkoutWindow) checkoutWindow.close();
      toast.error('Failed to create checkout. Please try again.', {
        position: 'top-center',
      });
      return null;
    }
  }, [store, isEmpty]);

  return {
    // State
    items: store.items,
    isLoading: store.isLoading,
    checkoutUrl: store.checkoutUrl,
    
    // Computed values
    totalItems,
    totalPrice,
    isEmpty,
    currencyCode,
    
    // Operations
    addItem,
    updateQuantity: store.updateQuantity,
    removeItem,
    clearCart,
    incrementItem,
    decrementItem,
    
    // Helpers
    getItemCount,
    hasItem,
    checkout,
  };
}
