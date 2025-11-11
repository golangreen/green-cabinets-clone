/**
 * Configuration Types
 * Type definitions for configuration management and audit logging
 */

export interface ConfigChangeAudit {
  id: string;
  user_id: string;
  user_email: string;
  config_key: string;
  old_value: string | null;
  new_value: string;
  change_type: 'test' | 'preset_applied' | 'import' | 'manual';
  preset_name: string | null;
  created_at: string;
}

export interface LogConfigChangeParams {
  configKey: string;
  oldValue: string | null;
  newValue: string;
  changeType: 'test' | 'preset_applied' | 'import' | 'manual';
  presetName?: string;
}
