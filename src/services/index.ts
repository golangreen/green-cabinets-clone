/**
 * Services Index
 * Central export point for all business logic services
 */

// Vanity pricing service exports
export {
  calculateVanityPrice,
  calculateWallPrice,
  calculateFloorPrice,
  calculateTax,
  calculateShipping,
  calculateCompletePricing,
  getTaxRatePercentage,
  getStateFromZipCode,
  inchesWithFractionToDecimal,
  inchesToLinearFeet,
  getPricePerLinearFoot,
  TAX_RATES,
  SHIPPING_RATES,
  BRAND_PRICING,
  WALL_TILE_PRICING,
  FLOOR_TILE_PRICING,
  formatPrice as formatVanityPrice,
  type PricingCalculation
} from './vanityPricingService';

// Cabinet catalog service exports (re-exported from feature module)
export {
  searchCabinets,
  getCabinetByCode,
  getCabinetsByType,
  getCategories,
  getCategoriesForType,
  getCabinetsByCategory,
  getCabinetTypes,
  calculateCabinetPrice,
  calculateCabinetPriceByCode,
  getDoorStyle,
  getMaterialFinish,
  getDoorStylesByFrameType,
  getMaterialFinishesByBrand,
  getBrands,
  calculateHardwareCost,
  getHandleOptions,
  getHingeOptions,
  getRecommendedCabinets,
  calculateProjectTotal,
  validateCabinetConfig,
  formatCabinetPrice,
  getCatalogData
} from '@/features/cabinet-catalog';

// Cart service exports
export {
  calculateCartSubtotal,
  calculateCartTax,
  calculateShipping as calculateCartShipping,
  calculateCartTotal,
  getCartItemCount,
  formatCartPrice,
  validateQuantity,
  isCartEmpty,
  findCartItem,
  mergeCartItems,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
} from './cartService';

// Security service exports
export {
  fetchSecurityEvents,
  fetchBlockedIPs,
  blockIP,
  unblockIP,
  getSecuritySummary,
  getSuspiciousIPs,
  isIPBlocked,
  getSeverityColor,
  formatIPAddress,
  getTimeUntilUnblock,
  groupEventsByType,
  getUniqueIPCount,
  fetchWebhookEvents,
  fetchWebhookRetryData,
  fetchWebhookDeduplicationStats,
  fetchAlertHistory,
  fetchEmailDeliveryStats,
  fetchRecentEmailLogs,
  fetchAlertSettings,
  upsertAlertSettings,
  fetchNotificationSettings,
  upsertNotificationSettings,
  getRecentEventCount,
  getActiveBlocksCount,
  type SecurityEvent,
  type BlockedIP
} from './securityService';

// Role service exports
export {
  fetchUsersWithRoles,
  hasRole,
  assignRole,
  removeRole,
  bulkAssignRole,
  bulkRemoveRole,
  extendRoleExpiration,
  getExpiringRoles as getExpiringRolesFromService,
  bulkExtendRoleExpiration as bulkExtendRoleExpirationFromService,
  getRoleDisplayName,
  getRoleBadgeColor,
  isTemporaryRole,
  getDaysUntilExpiry,
  formatRoleExpiration,
  validateRoleAssignment,
  getHighestRole,
  getCurrentUserEmail,
  sendRoleNotification,
  getExpiringRoles,
  bulkExtendRoleExpiration,
  fetchAuditLogs,
  fetchUserRoles,
  type AppRole,
  type UserWithRoles,
  type RoleAssignment,
  type RoleExtension
} from './roleService';

// Cache service exports
export {
  getStorageStats,
  getCachedEntries,
  clearCache,
  clearAllCaches,
  clearByType,
  testPerformance,
  getSyncQueueStatus,
  clearSyncQueue,
  getSizeBreakdown,
  exportCacheData,
  getCacheValue,
  type CacheEntry,
  type StorageStats,
  type PerformanceTestResult
} from './cacheService';

// Config service exports
export {
  logConfigChange,
  fetchConfigAuditLogs,
  fetchConfigAuditLogsByUser,
  fetchConfigAuditLogsByDateRange
} from './configService';

// Chat service exports
export {
  streamChatResponse,
  type ChatMessage,
  type ChatStreamOptions
} from './chatService';


