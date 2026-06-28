import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customVanityService } from "@/services/customVanityService";

const FRACTION_OPTIONS = [
  { value: "0", label: '0"' },
  { value: "1", label: '1/16"' },
  { value: "2", label: '1/8"' },
  { value: "3", label: '3/16"' },
  { value: "4", label: '1/4"' },
  { value: "5", label: '5/16"' },
  { value: "6", label: '3/8"' },
  { value: "7", label: '7/16"' },
  { value: "8", label: '1/2"' },
  { value: "9", label: '9/16"' },
  { value: "10", label: '5/8"' },
  { value: "11", label: '11/16"' },
  { value: "12", label: '3/4"' },
  { value: "13", label: '13/16"' },
  { value: "14", label: '7/8"' },
  { value: "15", label: '15/16"' },
];

interface VanityDimensionInputProps {
  label: string;
  value: string;
  fraction: string;
  error: string | null;
  onValueChange: (value: string) => void;
  onFractionChange: (fraction: string) => void;
}

export const VanityDimensionInput = ({
  label,
  value,
  fraction,
  error,
  onValueChange,
  onFractionChange,
}: VanityDimensionInputProps) => {
  const totalSixteenths = parseFloat(value || "0") * 16 + parseInt(fraction || "0");
  const errorId = `${label.toLowerCase()}-error`;

  return (
    <div className="space-y-3">
      <Label className={error ? "text-destructive" : ""}>
        {label} (inches){error && <span className="text-destructive"> *</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Inches"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          min="0"
          max="120"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={error ? "flex-1 border-destructive focus-visible:ring-destructive" : "flex-1"}
        />
        <Select value={fraction} onValueChange={onFractionChange}>
          <SelectTrigger aria-label={`${label} fraction`} className="w-24 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {FRACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Slider
          aria-label={`${label} in sixteenths of an inch`}
          value={[totalSixteenths]}
          onValueChange={(v) => {
            const total = v[0];
            onValueChange(Math.floor(total / 16).toString());
            onFractionChange((total % 16).toString());
          }}
          min={0}
          max={1920}
          step={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground text-center">
          {value || "0"}{fraction !== "0" && ` ${customVanityService.getFractionDisplay(fraction)}`}"
          {value && ` (${(parseFloat(value) + parseInt(fraction) / 16).toFixed(4)}")`}
        </p>
      </div>
    </div>
  );
};
