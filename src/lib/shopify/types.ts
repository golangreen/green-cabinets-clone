/**
 * Shopify TypeScript Types
 * Type definitions for Shopify API responses and data structures
 */

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export interface CartItem {
  variantId: string;
  quantity: number;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface CartLine {
  quantity: number;
  merchandiseId: string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          product: {
            title: string;
            handle: string;
          };
        };
      };
    }>;
  };
}

export interface ShopifyApiResponse<T = any> {
  data: T | null;
  errors?: Array<{
    message: string;
    field?: string;
  }>;
}
