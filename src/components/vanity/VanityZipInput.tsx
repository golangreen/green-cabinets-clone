import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VanityZipInputProps {
  zipCode: string;
  state: string;
  error: boolean;
  onChange: (value: string) => void;
}

export const VanityZipInput = ({ zipCode, state, error, onChange }: VanityZipInputProps) => (
  <div className="space-y-2">
    <Label htmlFor="zipCode" className={error ? "text-destructive" : ""}>
      Zip Code (for shipping) {error && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id="zipCode"
      type="text"
      placeholder="12345"
      value={zipCode}
      onChange={(e) => onChange(e.target.value)}
      maxLength={5}
      className={error ? "border-destructive focus-visible:ring-destructive" : ""}
    />
    {state && <p className="text-sm text-muted-foreground">Detected state: {state}</p>}
  </div>
);
