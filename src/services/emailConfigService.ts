import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface EmailSettings {
  id: string;
  sender_email: string;
  sender_name: string;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export const emailConfigService = {
  /**
   * Fetch current email settings
   */
  async fetchEmailSettings(): Promise<EmailSettings | null> {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        logger.error('Failed to fetch email settings', { error });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in fetchEmailSettings', { error });
      return null;
    }
  },

  /**
   * Update email settings (sender email and name)
   */
  async updateEmailSettings(
    senderEmail: string,
    senderName: string
  ): Promise<EmailSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get existing settings
      const existing = await this.fetchEmailSettings();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('email_settings')
          .update({
            sender_email: senderEmail,
            sender_name: senderName,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          logger.error('Failed to update email settings', { error });
          throw error;
        }

        logger.info('Email settings updated', { 
          sender_email: senderEmail,
          sender_name: senderName 
        });

        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('email_settings')
          .insert({
            sender_email: senderEmail,
            sender_name: senderName,
            updated_by: user.id
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to insert email settings', { error });
          throw error;
        }

        logger.info('Email settings created', { 
          sender_email: senderEmail,
          sender_name: senderName 
        });

        return data;
      }
    } catch (error) {
      logger.error('Error in updateEmailSettings', { error });
      throw error;
    }
  }
};
