import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ValidationError } from "@/lib/sqlValidator";

interface ValidationErrorsProps {
  errors: ValidationError[];
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-1">
      {errors.map((error, idx) => (
        <Alert
          key={idx}
          variant={error.type === 'error' ? 'destructive' : 'default'}
          className={error.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : ''}
        >
          <AlertTriangle 
            className={`h-4 w-4 ${error.type === 'warning' ? 'text-yellow-600' : ''}`} 
          />
          <AlertDescription className="text-sm">
            {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
