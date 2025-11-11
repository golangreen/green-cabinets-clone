export interface ValidationError {
  message: string;
  type: 'error' | 'warning';
}

export interface TableSchema {
  tableName: string;
  columns: string[];
}

export function validateQuery(query: string, schemaInfo: TableSchema[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmedQuery = query.trim().toUpperCase();

  // Check if it's a SELECT query
  if (!trimmedQuery.startsWith('SELECT')) {
    errors.push({
      message: 'Only SELECT queries are allowed for safety',
      type: 'error'
    });
  }

  // Check for table name
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (tableMatch) {
    const tableName = tableMatch[1].toLowerCase();
    const tableExists = schemaInfo.some(t => t.tableName.toLowerCase() === tableName);
    
    if (!tableExists) {
      errors.push({
        message: `Table "${tableName}" not found. Available tables: ${schemaInfo.map(t => t.tableName).join(', ')}`,
        type: 'error'
      });
    }
  } else if (trimmedQuery.startsWith('SELECT')) {
    errors.push({
      message: 'No table specified in FROM clause',
      type: 'error'
    });
  }

  // Check for common SQL injection patterns
  if (query.match(/;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)/i)) {
    errors.push({
      message: 'Potentially dangerous SQL keywords detected',
      type: 'error'
    });
  }

  // Warn if no LIMIT clause
  if (!query.match(/LIMIT\s+\d+/i)) {
    errors.push({
      message: 'Consider adding a LIMIT clause to avoid retrieving too many rows',
      type: 'warning'
    });
  }

  return errors;
}

export function extractTableName(query: string): string | null {
  const match = query.match(/FROM\s+(\w+)/i);
  return match ? match[1] : null;
}

export function extractLimit(query: string, defaultLimit: number = 10): number {
  const match = query.match(/LIMIT\s+(\d+)/i);
  return match ? parseInt(match[1]) : defaultLimit;
}
