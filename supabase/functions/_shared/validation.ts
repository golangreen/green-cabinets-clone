/**
 * Input validation utilities for edge functions
 */
import { ValidationError } from './errors.ts';

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  if (email.length > 255) {
    throw new ValidationError('Email too long');
  }
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  min: number = 1,
  max: number = 1000
): void {
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`);
  }
  if (trimmed.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`);
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().slice(0, 1000);
}

/**
 * Validate and sanitize user input object
 */
export function validateUserInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Invalid input format');
  }
  return input as Record<string, unknown>;
}
