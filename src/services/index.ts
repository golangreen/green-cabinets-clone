/**
 * Central export point for all services.
 * Import services from here to maintain clean dependencies.
 */

export { shopifyService, ShopifyService } from './shopifyService';
export type { ShopifyProduct } from './shopifyService';

export { authService, AuthService } from './authService';
export type { AuthResult } from './authService';

export { checkoutService, CheckoutService } from './checkoutService';
export type { CheckoutCustomerInfo, CheckoutItem, CheckoutResult } from './checkoutService';

export { chatService, ChatService } from './chatService';
export type { ChatMessage, ChatStreamOptions } from './chatService';
