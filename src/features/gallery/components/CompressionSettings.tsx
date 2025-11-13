/**
 * Compression Settings Component
 * Allows users to select image compression quality
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CompressionQuality } from '../types';

interface CompressionSettingsProps {
  value: CompressionQuality;
  onChange: (quality: CompressionQuality) => void;
  disabled?: boolean;
}

const QUALITY_OPTIONS: Array<{ value: CompressionQuality; label: string; description: string }> = [
  { value: 'none', label: 'None', description: 'Original quality (largest file size)' },
  { value: 'high', label: 'High', description: '90% quality (minimal compression)' },
  { value: 'medium', label: 'Medium', description: '70% quality (balanced)' },
  { value: 'low', label: 'Low', description: '50% quality (maximum compression)' },
];

export function CompressionSettings({ value, onChange, disabled }: CompressionSettingsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="compression">Compression Quality</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as CompressionQuality)}
        disabled={disabled}
      >
        <SelectTrigger id="compression">
          <SelectValue placeholder="Select quality" />
        </SelectTrigger>
        <SelectContent>
          {QUALITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
