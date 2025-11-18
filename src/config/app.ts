/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  name: 'Green Cabinets',
  description: 'Custom Kitchen & Bathroom Cabinetry',
  url: import.meta.env.VITE_APP_URL || 'https://greencabinetsny.com',
  contact: {
    email: 'orders@greencabinetsny.com',
    phone: '(555) 123-4567',
    address: 'New York, NY',
  },
} as const;

export const SHOPIFY_CONFIG = {
  apiVersion: '2025-07',
  storeDomain: 'green-cabinets-clone-5eeb3.myshopify.com',
  storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '585dda31c3bbc355eb6f937d3307f76b',
} as const;

export const CACHE_CONFIG = {
  productCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  imageCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const VANITY_CONFIG = {
  dimensions: {
    minWidth: 24,
    maxWidth: 72,
    minDepth: 18,
    maxDepth: 24,
    minHeight: 30,
    maxHeight: 36,
  },
  pricing: {
    basePricePerInch: 15,
    taxRate: 0.08875, // NY tax rate
    shippingRate: 0.05,
  },
} as const;
