import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VanityDimensionsFormProps {
  width: string;
  widthFraction: string;
  height: string;
  heightFraction: string;
  depth: string;
  depthFraction: string;
  zipCode: string;
  onWidthChange: (value: string) => void;
  onWidthFractionChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onHeightFractionChange: (value: string) => void;
  onDepthChange: (value: string) => void;
  onDepthFractionChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
}

export const VanityDimensionsForm = ({
  width,
  widthFraction,
  height,
  heightFraction,
  depth,
  depthFraction,
  zipCode,
  onWidthChange,
  onWidthFractionChange,
  onHeightChange,
  onHeightFractionChange,
  onDepthChange,
  onDepthFractionChange,
  onZipCodeChange,
}: VanityDimensionsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="width">Width (inches)</Label>
          <div className="flex gap-2">
            <Input
              id="width"
              type="number"
              min="18"
              max="120"
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              className="flex-1"
            />
            <Select value={widthFraction} onValueChange={onWidthFractionChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="0.25">1/4</SelectItem>
                <SelectItem value="0.5">1/2</SelectItem>
                <SelectItem value="0.75">3/4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="height">Height (inches)</Label>
          <div className="flex gap-2">
            <Input
              id="height"
              type="number"
              min="18"
              max="48"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              className="flex-1"
            />
            <Select value={heightFraction} onValueChange={onHeightFractionChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="0.25">1/4</SelectItem>
                <SelectItem value="0.5">1/2</SelectItem>
                <SelectItem value="0.75">3/4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="depth">Depth (inches)</Label>
          <div className="flex gap-2">
            <Input
              id="depth"
              type="number"
              min="12"
              max="30"
              value={depth}
              onChange={(e) => onDepthChange(e.target.value)}
              className="flex-1"
            />
            <Select value={depthFraction} onValueChange={onDepthFractionChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="0.25">1/4</SelectItem>
                <SelectItem value="0.5">1/2</SelectItem>
                <SelectItem value="0.75">3/4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            type="text"
            value={zipCode}
            onChange={(e) => onZipCodeChange(e.target.value)}
            placeholder="e.g., 10001"
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
};
