/**
 * Custom hook for cart operations
 * Provides convenient interface to cart store
 */
import { useCartStore } from '@/stores/cartStore';

export function useCart() {
  const items = useCartStore(state => state.items);
  const isLoading = useCartStore(state => state.isLoading);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  const createCheckout = useCartStore(state => state.createCheckout);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => 
    sum + (parseFloat(item.price.amount) * item.quantity), 0
  );

  return {
    items,
    itemCount,
    total,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    createCheckout,
  };
}
