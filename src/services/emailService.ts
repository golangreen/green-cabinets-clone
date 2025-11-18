/**
 * Email Service
 * Business logic for email operations and Resend integration
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface SendTestEmailParams {
  toEmail: string;
  subject?: string;
  testMessage?: string;
}

export interface EmailHealthCheck {
  configured: boolean;
  domainVerified: boolean;
  lastTestDate?: string;
}

export const emailService = {
  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(params: SendTestEmailParams): Promise<void> {
    logger.info('Sending test email', {
      toEmail: params.toEmail,
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required to send test email');
      }

      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to_email: params.toEmail,
          subject: params.subject,
          test_message: params.testMessage,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logger.error('Failed to send test email', error);
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      logger.info('Test email sent successfully', {
        toEmail: params.toEmail,
      });

      return data;
    } catch (error) {
      logger.error('Email service error', error);
      throw error;
    }
  },

  /**
   * Check Resend health/configuration
   */
  async checkHealth(): Promise<EmailHealthCheck> {
    logger.debug('Checking email service health');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('check-resend-health', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logger.warn('Email health check failed', error);
        return {
          configured: false,
          domainVerified: false,
        };
      }

      return {
        configured: data?.api_key_configured || false,
        domainVerified: data?.domain_verified || false,
        lastTestDate: data?.last_check,
      };
    } catch (error) {
      logger.error('Email health check error', error);
      return {
        configured: false,
        domainVerified: false,
      };
    }
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};
