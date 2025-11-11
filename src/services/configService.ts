/**
 * Configuration Service
 * Business logic for configuration management and audit logging
 */

import { supabase } from '@/integrations/supabase/client';
import { ConfigChangeAudit, LogConfigChangeParams } from '@/types/config';
import { logger } from '@/lib/logger';

/**
 * Log a configuration change to the audit log
 */
export async function logConfigChange(params: LogConfigChangeParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      logger.error('configService.logConfigChange', 'No authenticated user');
      return;
    }

    const { error } = await supabase.from('config_change_audit').insert({
      user_id: user.id,
      user_email: user.email,
      config_key: params.configKey,
      old_value: params.oldValue,
      new_value: params.newValue,
      change_type: params.changeType,
      preset_name: params.presetName || null,
    });

    if (error) {
      logger.error('configService.logConfigChange', 'Failed to log config change', { error });
      throw error;
    }

    logger.info('configService.logConfigChange', { configKey: params.configKey, changeType: params.changeType });
  } catch (error) {
    logger.error('configService.logConfigChange', 'Error logging config change', { error });
    throw error;
  }
}

/**
 * Fetch configuration change audit logs
 */
export async function fetchConfigAuditLogs(
  limit: number = 100,
  configKey?: string
): Promise<ConfigChangeAudit[]> {
  try {
    let query = supabase
      .from('config_change_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (configKey) {
      query = query.eq('config_key', configKey);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('configService.fetchConfigAuditLogs', 'Failed to fetch audit logs', { error });
      throw error;
    }

    return (data || []) as ConfigChangeAudit[];
  } catch (error) {
    logger.error('configService.fetchConfigAuditLogs', 'Error fetching audit logs', { error });
    throw error;
  }
}

/**
 * Fetch configuration changes by user
 */
export async function fetchConfigAuditLogsByUser(userId: string): Promise<ConfigChangeAudit[]> {
  try {
    const { data, error } = await supabase
      .from('config_change_audit')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('configService.fetchConfigAuditLogsByUser', 'Failed to fetch user audit logs', { error });
      throw error;
    }

    return (data || []) as ConfigChangeAudit[];
  } catch (error) {
    logger.error('configService.fetchConfigAuditLogsByUser', 'Error fetching user audit logs', { error });
    throw error;
  }
}

/**
 * Fetch configuration changes by date range
 */
export async function fetchConfigAuditLogsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ConfigChangeAudit[]> {
  try {
    const { data, error } = await supabase
      .from('config_change_audit')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('configService.fetchConfigAuditLogsByDateRange', 'Failed to fetch audit logs by date', { error });
      throw error;
    }

    return (data || []) as ConfigChangeAudit[];
  } catch (error) {
    logger.error('configService.fetchConfigAuditLogsByDateRange', 'Error fetching audit logs by date', { error });
    throw error;
  }
}
