/**
 * Product Catalog feature route constants
 */
export const PRODUCT_CATALOG_ROUTES = {
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PRODUCT_DETAIL: (productId: string) => `/product/${productId}`,
} as const;
