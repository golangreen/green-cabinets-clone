import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface QueryResultsProps {
  result: {
    type: 'success' | 'error';
    data?: any[];
    error?: string;
    hint?: string;
    rowCount?: number;
  } | null;
}

export function QueryResults({ result }: QueryResultsProps) {
  if (!result) return null;

  if (result.type === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Query Error</AlertTitle>
        <AlertDescription className="space-y-1">
          <p className="font-mono text-sm">{result.error}</p>
          {result.hint && (
            <p className="text-xs mt-2">Hint: {result.hint}</p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Query executed successfully. Retrieved {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}.
        </AlertDescription>
      </Alert>

      {result.data && result.data.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="bg-muted sticky top-0">
                <TableRow>
                  {Object.keys(result.data[0]).map((key) => (
                    <TableHead key={key} className="font-semibold">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((value: any, cellIdx: number) => (
                      <TableCell key={cellIdx} className="font-mono text-xs">
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : value?.toString() || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            Query executed successfully but returned no rows.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
