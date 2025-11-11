import { supabase } from '@/integrations/supabase/client';
import { extractTableName, extractLimit } from './sqlValidator';

export interface QueryResult {
  data?: any[];
  error?: string;
  hint?: string;
  type: 'success' | 'error';
  rowCount?: number;
}

export async function executeQuery(sqlQuery: string): Promise<QueryResult> {
  try {
    // Basic safety check
    const trimmedQuery = sqlQuery.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      return {
        error: 'Only SELECT queries are allowed for safety. Use the backend dashboard for data modifications.',
        type: 'error'
      };
    }

    // Parse table name
    const tableName = extractTableName(sqlQuery);
    if (!tableName) {
      return {
        error: 'Could not parse table name from query. Use format: SELECT * FROM table_name',
        type: 'error'
      };
    }

    // Parse limit
    const limit = extractLimit(sqlQuery);

    // Execute query
    const { data, error } = await (supabase as any)
      .from(tableName)
      .select('*')
      .limit(limit);

    if (error) {
      return {
        error: error.message,
        hint: error.hint || 'Check your table name and RLS policies',
        type: 'error'
      };
    }

    const rowCount = Array.isArray(data) ? data.length : 0;
    return {
      data: data || [],
      type: 'success',
      rowCount
    };
  } catch (err: any) {
    return {
      error: err.message || 'Failed to execute query',
      type: 'error'
    };
  }
}
