import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TableSchema } from '@/lib/sqlValidator';

const KNOWN_SCHEMA: TableSchema[] = [
  {
    tableName: 'user_roles',
    columns: ['id', 'user_id', 'role', 'created_at']
  },
  {
    tableName: 'security_events',
    columns: ['id', 'created_at', 'event_type', 'function_name', 'client_ip', 'severity', 'details']
  },
  {
    tableName: 'blocked_ips',
    columns: ['id', 'ip_address', 'reason', 'blocked_at', 'blocked_until', 'auto_blocked', 'violation_count', 'details', 'created_at']
  },
  {
    tableName: 'block_history',
    columns: ['id', 'ip_address', 'action', 'reason', 'blocked_until', 'auto_blocked', 'performed_by', 'created_at']
  },
  {
    tableName: 'alert_history',
    columns: ['id', 'alert_type', 'details', 'sent_at']
  }
];

export function useDatabaseSchema() {
  const [schema, setSchema] = useState<TableSchema[]>(KNOWN_SCHEMA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchema = async () => {
      setLoading(true);
      try {
        // Verify connection by attempting to query a table
        const { error } = await supabase
          .from('user_roles')
          .select('*')
          .limit(0);

        if (error) {
          console.error('Schema fetch error:', error);
        }

        // Use known schema (already set)
        setSchema(KNOWN_SCHEMA);
      } catch (err) {
        console.error('Failed to fetch schema:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  return { schema, loading };
}
