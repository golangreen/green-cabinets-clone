# Validation Error Display Components

Comprehensive validation error and warning display components with retry functionality.

## Components

### ValidationErrorDisplay

Shows validation errors and warnings for a single file with optional retry action.

```tsx
import { ValidationErrorDisplay } from '@/features/gallery/components';
import { validateImageFile } from '@/features/gallery/services';

function MyComponent() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleValidate = async (file: File) => {
    const result = await validateImageFile(file);
    setValidation(result);
  };

  const handleRetry = () => {
    // Prompt user to fix file and retry
    console.log('Retry validation');
  };

  return (
    <ValidationErrorDisplay
      fileName="example.jpg"
      validation={validation}
      onRetry={handleRetry}
      onDismiss={() => setValidation(null)}
    />
  );
}
```

**Props:**
- `fileName` (string): Name of the file being validated
- `validation` (ValidationResult): Validation result object
- `onRetry?` (function): Optional callback for retry action
- `onDismiss?` (function): Optional callback to dismiss the alert
- `className?` (string): Optional CSS classes

---

### ValidationSummary

Displays a comprehensive summary of multiple file validations with individual file details.

```tsx
import { ValidationSummary } from '@/features/gallery/components';
import { validateImageFiles } from '@/features/gallery/services';

function MyUploadComponent() {
  const [results, setResults] = useState<Map<string, ValidationResult>>(new Map());

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);
    const validationResults = await validateImageFiles(fileArray);
    setResults(validationResults);
  };

  const handleRetryFile = (fileName: string) => {
    console.log('Retry file:', fileName);
    // Implement retry logic
  };

  return (
    <ValidationSummary
      validationResults={results}
      onRetryFile={handleRetryFile}
      onDismiss={() => setResults(new Map())}
    />
  );
}
```

**Props:**
- `validationResults` (Map<string, ValidationResult>): Map of file names to validation results
- `onRetryFile?` (function): Optional callback for retrying a specific file
- `onDismiss?` (function): Optional callback to dismiss all validations
- `className?` (string): Optional CSS classes

---

### ValidationBadge

Inline badge showing validation status (valid, warnings, or errors).

```tsx
import { ValidationBadge } from '@/features/gallery/components';

function FileListItem({ file, validation }: Props) {
  return (
    <div className="flex items-center justify-between">
      <span>{file.name}</span>
      <ValidationBadge validation={validation} />
    </div>
  );
}
```

**Props:**
- `validation` (ValidationResult): Validation result object
- `className?` (string): Optional CSS classes

---

## Using with useValidation Hook

The `useValidation` hook provides state management for validation operations:

```tsx
import { useValidation } from '@/features/gallery/hooks';
import { ValidationSummary } from '@/features/gallery/components';

function MyComponent() {
  const {
    validationResults,
    isValidating,
    validateFile,
    validateFiles,
    hasErrors,
    errorCount,
  } = useValidation();

  const handleFilesSelected = async (files: File[]) => {
    await validateFiles(files);
  };

  return (
    <div>
      {isValidating && <p>Validating...</p>}
      
      {hasErrors() && (
        <p>{errorCount()} file(s) failed validation</p>
      )}

      <ValidationSummary validationResults={validationResults} />
    </div>
  );
}
```

---

## Validation Result Structure

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: 'fileSize' | 'fileType' | 'dimensions' | 'file';
  message: string;
  details?: any;
}

interface ValidationWarning {
  field: 'resolution' | 'aspectRatio' | 'fileSize';
  message: string;
  details?: any;
}
```

---

## Validation Rules

### Errors (will block upload):
- **File size**: Exceeds 10MB maximum
- **File type**: Not a supported image format (JPEG, PNG, WebP, GIF)
- **Dimensions**: Below 800x600px minimum
- **File name**: Invalid characters or format

### Warnings (will allow upload with notification):
- **File size**: Between 8MB and 10MB (close to limit)
- **Resolution**: Below 1280px (lower than recommended)
- **Aspect ratio**: Extremely wide or tall (>3:1 or <1:3)

---

## Styling

Components use semantic design tokens from the theme:

- `bg-destructive` / `text-destructive-foreground` for errors
- `bg-secondary` / `text-secondary-foreground` for warnings
- `bg-green-600` for success states

Customize through Tailwind classes or theme tokens in `index.css`.

---

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels for dismiss buttons
- Semantic HTML structure with heading hierarchy
- Color contrast meets WCAG AA standards
- Keyboard navigation support
- Screen reader friendly descriptions

---

## Example Integration

See `src/features/gallery/examples/ValidationExample.tsx` for a complete working example.
