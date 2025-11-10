import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface VanityCabinetConfigProps {
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition: string;
  onDoorStyleChange: (value: string) => void;
  onNumDrawersChange: (value: number[]) => void;
  onHandleStyleChange: (value: string) => void;
  onCabinetPositionChange: (value: string) => void;
}

export const VanityCabinetConfig = ({
  doorStyle,
  numDrawers,
  handleStyle,
  cabinetPosition,
  onDoorStyleChange,
  onNumDrawersChange,
  onHandleStyleChange,
  onCabinetPositionChange,
}: VanityCabinetConfigProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="doorStyle">Door Style</Label>
        <Select value={doorStyle} onValueChange={onDoorStyleChange}>
          <SelectTrigger id="doorStyle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shaker">Shaker</SelectItem>
            <SelectItem value="flat-panel">Flat Panel</SelectItem>
            <SelectItem value="raised-panel">Raised Panel</SelectItem>
            <SelectItem value="beadboard">Beadboard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="numDrawers">Number of Drawers: {numDrawers}</Label>
        <Slider
          id="numDrawers"
          min={0}
          max={6}
          step={1}
          value={[numDrawers]}
          onValueChange={onNumDrawersChange}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="handleStyle">Handle Style</Label>
        <Select value={handleStyle} onValueChange={onHandleStyleChange}>
          <SelectTrigger id="handleStyle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Handle</SelectItem>
            <SelectItem value="knob">Knob</SelectItem>
            <SelectItem value="cup">Cup Pull</SelectItem>
            <SelectItem value="minimal">Minimal/Integrated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cabinetPosition">Cabinet Position</Label>
        <Select value={cabinetPosition} onValueChange={onCabinetPositionChange}>
          <SelectTrigger id="cabinetPosition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="floor">Floor Mounted</SelectItem>
            <SelectItem value="wall">Wall Mounted (Floating)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
