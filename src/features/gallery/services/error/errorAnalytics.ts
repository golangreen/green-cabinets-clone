/**
 * Error Analytics
 * Track and analyze error patterns
 */

import { getAllErrors, type ErrorType } from './errorLogger';

// ============================================================================
// Analytics Functions
// ============================================================================

/**
 * Get error statistics
 */
export function getErrorStats(): Record<ErrorType, number> {
  const errors = getAllErrors();
  const stats: Record<string, number> = {};
  
  errors.forEach(error => {
    stats[error.type] = (stats[error.type] || 0) + 1;
  });

  return stats as Record<ErrorType, number>;
}

/**
 * Get error rate over time
 */
export function getErrorRate(timeWindowMs: number = 3600000): number {
  const now = Date.now();
  const errors = getAllErrors();
  
  const recentErrors = errors.filter(
    error => now - error.timestamp.getTime() < timeWindowMs
  );
  
  return recentErrors.length;
}

/**
 * Get most common error type
 */
export function getMostCommonError(): ErrorType | null {
  const stats = getErrorStats();
  const entries = Object.entries(stats);
  
  if (entries.length === 0) return null;
  
  const [type] = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  return type as ErrorType;
}

/**
 * Get error frequency by type
 */
export function getErrorFrequency(): Array<{ type: ErrorType; count: number; percentage: number }> {
  const stats = getErrorStats();
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return [];
  
  return Object.entries(stats).map(([type, count]) => ({
    type: type as ErrorType,
    count,
    percentage: (count / total) * 100,
  })).sort((a, b) => b.count - a.count);
}
