import { TableSchema } from './sqlValidator';

export function createSqlCompletions(schemaInfo: TableSchema[]) {
  return (context: any) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const options: any[] = [];

    // Add table names
    schemaInfo.forEach(table => {
      options.push({
        label: table.tableName,
        type: 'table',
        detail: 'table',
        boost: 99
      });

      // Add columns for each table
      table.columns.forEach(column => {
        options.push({
          label: `${table.tableName}.${column}`,
          type: 'property',
          detail: `column in ${table.tableName}`,
          boost: 90
        });
        options.push({
          label: column,
          type: 'property',
          detail: 'column',
          boost: 85
        });
      });
    });

    // Add SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'GROUP BY', 
      'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 
      'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 
      'IS NULL', 'IS NOT NULL', 'COUNT', 'SUM', 'AVG', 'MAX', 
      'MIN', 'DISTINCT', 'AS'
    ];
    
    keywords.forEach(keyword => {
      options.push({
        label: keyword,
        type: 'keyword',
        boost: 70
      });
    });

    return {
      from: word.from,
      options: options,
      validFor: /^\w*$/
    };
  };
}
