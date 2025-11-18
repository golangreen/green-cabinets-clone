import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/cartStore';
import { mockShopifyProduct } from '@/test/mocks/shopify';

describe('useCart', () => {
  beforeEach(() => {
    // Clear cart before each test
    const { clearCart } = useCartStore.getState();
    clearCart();
  });

  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toHaveLength(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'gid://shopify/ProductVariant/1',
        variantTitle: 'Default',
        price: {
          amount: '299.99',
          currencyCode: 'USD',
        },
        quantity: 1,
        selectedOptions: [],
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.node.title).toBe('Test Cabinet');
  });

  it('should increment quantity for existing item', () => {
    const { result } = renderHook(() => useCartStore());

    const cartItem = {
      product: mockShopifyProduct,
      variantId: 'gid://shopify/ProductVariant/1',
      variantTitle: 'Default',
      price: {
        amount: '299.99',
        currencyCode: 'USD',
      },
      quantity: 1,
      selectedOptions: [],
    };

    act(() => {
      result.current.addItem(cartItem);
      result.current.addItem(cartItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-1',
        variantTitle: 'Default',
        price: { amount: '299.99', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: [],
      });
    });

    act(() => {
      result.current.updateQuantity('variant-1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
  });

  it('should remove item when quantity is 0', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-1',
        variantTitle: 'Default',
        price: { amount: '299.99', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: [],
      });
    });

    act(() => {
      result.current.updateQuantity('variant-1', 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-1',
        variantTitle: 'Default',
        price: { amount: '299.99', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: [],
      });
    });

    act(() => {
      result.current.removeItem('variant-1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-1',
        variantTitle: 'Default',
        price: { amount: '299.99', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: [],
      });
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-2',
        variantTitle: 'Large',
        price: { amount: '399.99', currencyCode: 'USD' },
        quantity: 2,
        selectedOptions: [],
      });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        product: mockShopifyProduct,
        variantId: 'variant-1',
        variantTitle: 'Default',
        price: { amount: '299.99', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: [],
      });
    });

    // Verify localStorage contains cart data
    const stored = localStorage.getItem('shopify-cart');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).state.items).toHaveLength(1);
  });
});
