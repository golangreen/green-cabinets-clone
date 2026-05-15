/**
 * Central export point for all services.
 */

export { shopifyService, ShopifyService } from './shopifyService';
export { authService, AuthService } from './authService';
export type { AuthResult } from './authService';
export { checkoutService, CheckoutService } from './checkoutService';
export type { CheckoutResult } from './checkoutService';
export { chatService, ChatService } from './chatService';
export type { ChatMessage, ChatStreamOptions } from './chatService';
export { vanityPricingService, VanityPricingService } from './vanityPricingService';
export { cabinetCatalogService, CabinetCatalogService } from './cabinetCatalogService';
export { quoteService, QuoteService } from './quoteService';
export * from './performanceService';
export { roleService } from './roleService';
export { paymentService } from './paymentService';
export type { CustomProductPayload, PaymentSessionResult } from './paymentService';
export { orderEmailService } from './orderEmailService';
export { finishSelectionService } from './finishSelectionService';
export type { FinishSelectionPick, SendFinishSelectionPayload } from './finishSelectionService';
export { vanityRequestService } from './vanityRequestService';
export type { VanityQuotePayload } from './vanityRequestService';
export { seoScanService } from './seoScanService';
export type { SeoScan, GscInspectionResult, DeepTestResponse, DeepTestStatus } from './seoScanService';
