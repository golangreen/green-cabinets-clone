/**
 * Mock data for Shopify testing
 */
import type { ShopifyProduct } from '@/types';

export const mockShopifyProduct: ShopifyProduct = {
  node: {
    id: 'gid://shopify/Product/1',
    title: 'Test Cabinet',
    description: 'A beautiful test cabinet',
    handle: 'test-cabinet',
    priceRange: {
      minVariantPrice: {
        amount: '299.99',
        currencyCode: 'USD',
      },
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://example.com/image.jpg',
            altText: 'Test cabinet image',
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Default',
            price: {
              amount: '299.99',
              currencyCode: 'USD',
            },
            selectedOptions: [
              {
                name: 'Size',
                value: 'Medium',
              },
            ],
            availableForSale: true,
          },
        },
      ],
    },
    options: [
      {
        name: 'Size',
        values: ['Small', 'Medium', 'Large'],
      },
    ],
  },
};

export const mockShopifyProducts: ShopifyProduct[] = [
  mockShopifyProduct,
  {
    ...mockShopifyProduct,
    node: {
      ...mockShopifyProduct.node,
      id: 'gid://shopify/Product/2',
      title: 'Test Vanity',
      handle: 'test-vanity',
    },
  },
];

export const mockCheckoutResponse = {
  data: {
    cartCreate: {
      cart: {
        id: 'gid://shopify/Cart/test-cart-id',
        checkoutUrl: 'https://test-store.myshopify.com/checkout/test',
        totalQuantity: 1,
        cost: {
          totalAmount: {
            amount: '299.99',
            currencyCode: 'USD',
          },
        },
      },
      userErrors: [],
    },
  },
};
