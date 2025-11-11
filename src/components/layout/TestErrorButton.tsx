import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

/**
 * Test Error Button - Development only
 * Triggers an intentional error to test the Error Boundary
 * 
 * Usage: Add to any component during development
 * <TestErrorButton />
 */
export default function TestErrorButton() {
  const [shouldError, setShouldError] = useState(false);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  // Trigger error on next render
  if (shouldError) {
    throw new Error('Test error from Error Boundary - This is intentional for testing!');
  }

  return (
    <Button
      onClick={() => setShouldError(true)}
      variant="destructive"
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg"
      title="Test Error Boundary (Dev only)"
    >
      <Bug className="mr-2 h-4 w-4" />
      Test Error
    </Button>
  );
}
