/**
 * Role Test Service
 * Business logic for testing role expiration functionality
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface RoleExpirationTestResult {
  success: boolean;
  message: string;
  expiringRoles?: any[];
  expiredRoles?: any[];
  emailsSent?: number;
}

export const roleTestService = {
  /**
   * Manually trigger role expiration check for testing
   */
  async triggerExpirationCheck(): Promise<RoleExpirationTestResult> {
    logger.info('Triggering manual role expiration check');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('test-role-expiration', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        logger.error('Role expiration test failed', error);
        throw new Error(`Test failed: ${error.message}`);
      }

      logger.info('Role expiration test completed', {
        success: data?.success,
        emailsSent: data?.emails_sent,
      });

      return {
        success: data?.success || false,
        message: data?.message || 'Test completed',
        expiringRoles: data?.expiring_roles,
        expiredRoles: data?.expired_roles,
        emailsSent: data?.emails_sent,
      };
    } catch (error) {
      logger.error('Role test service error', error);
      throw error;
    }
  },

  /**
   * Get preview of upcoming expiration notifications
   */
  async previewExpirationNotifications(): Promise<any[]> {
    logger.debug('Fetching expiration notification preview');

    try {
      const { data, error } = await supabase.rpc('get_roles_expiring_within_days', {
        days_ahead: 7,
      });

      if (error) {
        logger.error('Failed to fetch expiring roles', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Preview notification error', error);
      return [];
    }
  },
};
