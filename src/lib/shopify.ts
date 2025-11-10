import { toast } from "sonner";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'green-cabinets-clone-5eeb3.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

if (!SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error('VITE_SHOPIFY_STOREFRONT_TOKEN is required. Please set it in your environment variables.');
}

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

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: any = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active Shopify billing plan. Your store needs to be upgraded to a paid plan. Visit https://admin.shopify.com to upgrade.",
    });
    throw new Error('Shopify payment required - store needs to be on a paid plan');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: any) => e.message).join(', ')}`);
  }

  return data;
}

export async function fetchProducts(first: number = 50, query?: string) {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
  return data?.data?.products?.edges || [];
}

export async function createStorefrontCheckout(items: any[]): Promise<string> {
  try {
    console.log('Creating checkout with items:', items);
    
    const lines = items.map(item => {
      // Combine selectedOptions and customAttributes
      const attributes = [
        ...(item.selectedOptions?.map((opt: any) => ({
          key: opt.name,
          value: opt.value
        })) || []),
        ...(item.customAttributes?.map((attr: any) => ({
          key: attr.key,
          value: attr.value
        })) || [])
      ];
      
      return {
        quantity: item.quantity,
        merchandiseId: item.variantId,
        attributes
      };
    });

    console.log('Cart lines with attributes:', lines);

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines,
      },
    });

    if (!cartData || !cartData.data) {
      throw new Error('No response from Shopify API');
    }

    console.log('Cart data:', cartData);

    if (cartData.data.cartCreate.userErrors.length > 0) {
      const errors = cartData.data.cartCreate.userErrors.map((e: any) => e.message).join(', ');
      toast.error('Cart creation failed', { description: errors });
      throw new Error(`Cart creation failed: ${errors}`);
    }

    const cart = cartData.data.cartCreate.cart;
    
    if (!cart.checkoutUrl) {
      toast.error('No checkout URL returned from Shopify');
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    const finalUrl = url.toString();
    
    console.log('Final checkout URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    toast.error('Checkout failed', { 
      description: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
    throw error;
  }
}
