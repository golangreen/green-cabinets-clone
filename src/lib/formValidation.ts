import { z } from 'zod';

/**
 * Standardized form validation schemas
 * Use these to ensure consistent validation across all forms
 */

// Common field validators
export const validators = {
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(20, { message: 'Phone number must be less than 20 characters' }),
  
  message: z
    .string()
    .trim()
    .min(1, { message: 'Message is required' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
  
  subject: z
    .string()
    .trim()
    .min(1, { message: 'Subject is required' })
    .max(200, { message: 'Subject must be less than 200 characters' }),
  
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be less than 128 characters' }),
};

// Reusable form schemas
export const contactFormSchema = z.object({
  name: validators.name,
  email: validators.email,
  phone: validators.phone.optional(),
  subject: validators.subject.optional(),
  message: validators.message,
});

export const quoteFormSchema = z.object({
  name: validators.name,
  email: validators.email,
  phone: validators.phone,
  projectType: z.enum(['kitchen', 'bathroom', 'closet', 'other']),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: validators.message,
});

export const authFormSchema = z.object({
  email: validators.email,
  password: validators.password,
});

export const vanityEmailSchema = z.object({
  recipientName: validators.name.optional(),
  recipientEmail: validators.email,
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type AuthFormData = z.infer<typeof authFormSchema>;
export type VanityEmailData = z.infer<typeof vanityEmailSchema>;

/**
 * Format validation errors for display
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}
