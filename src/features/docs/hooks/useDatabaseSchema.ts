import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export interface TableSchema {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

// Helper to convert to sqlValidator format
export const convertToValidatorSchema = (schema: TableSchema[]): Array<{ tableName: string; columns: string[] }> => {
  const tableMap = new Map<string, Set<string>>();
  
  schema.forEach(row => {
    if (!tableMap.has(row.table_name)) {
      tableMap.set(row.table_name, new Set());
    }
    tableMap.get(row.table_name)?.add(row.column_name);
  });

  return Array.from(tableMap.entries()).map(([tableName, columns]) => ({
    tableName,
    columns: Array.from(columns)
  }));
};

export const useDatabaseSchema = () => {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        // Note: Direct information_schema access not available via Supabase client
        // This would need to be implemented via an edge function or RPC
        logger.info('Schema fetch requested - requires edge function implementation', { hook: 'useDatabaseSchema' });
        setSchema([]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch schema';
        logger.error(message, err, { hook: 'useDatabaseSchema' });
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchema();
  }, []);

  return { schema, isLoading, error };
};
