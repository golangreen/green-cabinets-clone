import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VanityZipInputProps {
  zipCode: string;
  state: string;
  error: string | null;
  onChange: (value: string) => void;
}

export const VanityZipInput = ({ zipCode, state, error, onChange }: VanityZipInputProps) => (
  <div className="space-y-2">
    <Label htmlFor="zipCode" className={error ? "text-destructive" : ""}>
      Zip Code (for shipping){error && <span className="text-destructive"> *</span>}
    </Label>
    <Input
      id="zipCode"
      type="text"
      inputMode="numeric"
      placeholder="12345"
      value={zipCode}
      onChange={(e) => onChange(e.target.value)}
      maxLength={5}
      aria-invalid={!!error}
      aria-describedby={error ? "zipCode-error" : undefined}
      className={error ? "border-destructive focus-visible:ring-destructive" : ""}
    />
    {error ? (
      <p id="zipCode-error" role="alert" className="text-xs font-medium text-destructive">
        {error}
      </p>
    ) : (
      state && <p className="text-sm text-muted-foreground">Detected state: {state}</p>
    )}
  </div>
);
