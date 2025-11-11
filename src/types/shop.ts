export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  options?: ProductOption[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  image?: ProductImage;
  sku?: string;
  weight?: number;
  weightUnit?: string;
  quantityAvailable?: number;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  customization?: Record<string, any>;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface Checkout {
  id: string;
  webUrl: string;
  lineItems: CheckoutLineItem[];
  subtotalPrice: Money;
  totalPrice: Money;
  totalTax: Money;
  shippingLine?: ShippingLine;
  completedAt?: string;
}

export interface CheckoutLineItem {
  id: string;
  title: string;
  variant: ProductVariant;
  quantity: number;
  customAttributes?: Array<{ key: string; value: string }>;
}

export interface ShippingLine {
  title: string;
  price: Money;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: ProductImage;
  products: Product[];
}

export interface ProductCache {
  products: Product[];
  lastFetched: number;
  expiresAt: number;
}
