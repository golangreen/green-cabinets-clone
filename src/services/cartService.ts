/**
 * Cart Service
 * Business logic for shopping cart operations
 */

import { CartItem } from '@/features/shopping-cart/stores/cartStore';

/**
 * Calculate cart subtotal
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price.amount);
    return total + (itemPrice * item.quantity);
  }, 0);
}

/**
 * Calculate cart tax (example: 10% tax rate)
 */
export function calculateCartTax(subtotal: number, taxRate: number = 0.10): number {
  return subtotal * taxRate;
}

/**
 * Calculate shipping cost based on cart total
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal === 0) return 0;
  if (subtotal >= 100) return 0; // Free shipping over $100
  return 10; // Flat rate shipping
}

/**
 * Calculate cart total with tax and shipping
 */
export function calculateCartTotal(items: CartItem[], taxRate: number = 0.10): {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
} {
  const subtotal = calculateCartSubtotal(items);
  const tax = calculateCartTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

/**
 * Get cart item count (total quantity of all items)
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Format currency for display
 */
export function formatCartPrice(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Validate cart item quantity
 */
export function validateQuantity(quantity: number): {
  isValid: boolean;
  error?: string;
} {
  if (quantity < 1) {
    return { isValid: false, error: 'Quantity must be at least 1' };
  }
  if (quantity > 99) {
    return { isValid: false, error: 'Maximum quantity is 99' };
  }
  if (!Number.isInteger(quantity)) {
    return { isValid: false, error: 'Quantity must be a whole number' };
  }
  return { isValid: true };
}

/**
 * Check if cart has items
 */
export function isCartEmpty(items: CartItem[]): boolean {
  return items.length === 0;
}

/**
 * Find item in cart by variant ID
 */
export function findCartItem(items: CartItem[], variantId: string): CartItem | undefined {
  return items.find(item => item.variantId === variantId);
}

/**
 * Merge duplicate items in cart (if any exist)
 */
export function mergeCartItems(items: CartItem[]): CartItem[] {
  const itemMap = new Map<string, CartItem>();
  
  items.forEach(item => {
    const existing = itemMap.get(item.variantId);
    if (existing) {
      itemMap.set(item.variantId, {
        ...existing,
        quantity: existing.quantity + item.quantity
      });
    } else {
      itemMap.set(item.variantId, { ...item });
    }
  });
  
  return Array.from(itemMap.values());
}
