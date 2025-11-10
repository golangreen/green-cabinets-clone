import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VanityCountertopConfigProps {
  countertopMaterial: string;
  countertopEdge: string;
  countertopColor: string;
  sinkStyle: string;
  sinkShape: string;
  onCountertopMaterialChange: (value: string) => void;
  onCountertopEdgeChange: (value: string) => void;
  onCountertopColorChange: (value: string) => void;
  onSinkStyleChange: (value: string) => void;
  onSinkShapeChange: (value: string) => void;
}

export const VanityCountertopConfig = ({
  countertopMaterial,
  countertopEdge,
  countertopColor,
  sinkStyle,
  sinkShape,
  onCountertopMaterialChange,
  onCountertopEdgeChange,
  onCountertopColorChange,
  onSinkStyleChange,
  onSinkShapeChange,
}: VanityCountertopConfigProps) => {
  return (
    <div className="space-y-6">
      {/* Countertop */}
      <div className="space-y-4">
        <h3 className="font-semibold">Countertop</h3>
        
        <div>
          <Label htmlFor="countertopMaterial">Material</Label>
          <Select value={countertopMaterial} onValueChange={onCountertopMaterialChange}>
            <SelectTrigger id="countertopMaterial">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marble">Marble</SelectItem>
              <SelectItem value="quartz">Quartz</SelectItem>
              <SelectItem value="granite">Granite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="countertopEdge">Edge Profile</Label>
          <Select value={countertopEdge} onValueChange={onCountertopEdgeChange}>
            <SelectTrigger id="countertopEdge">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="straight">Straight</SelectItem>
              <SelectItem value="beveled">Beveled</SelectItem>
              <SelectItem value="bullnose">Bullnose</SelectItem>
              <SelectItem value="waterfall">Waterfall</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="countertopColor">Color/Pattern</Label>
          <Select value={countertopColor} onValueChange={onCountertopColorChange}>
            <SelectTrigger id="countertopColor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="gray">Gray</SelectItem>
              <SelectItem value="beige">Beige</SelectItem>
              <SelectItem value="veined">White with Veining</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sink */}
      <div className="space-y-4">
        <h3 className="font-semibold">Sink</h3>
        
        <div>
          <Label htmlFor="sinkStyle">Style</Label>
          <Select value={sinkStyle} onValueChange={onSinkStyleChange}>
            <SelectTrigger id="sinkStyle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undermount">Undermount</SelectItem>
              <SelectItem value="vessel">Vessel</SelectItem>
              <SelectItem value="integrated">Integrated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sinkShape">Shape</Label>
          <Select value={sinkShape} onValueChange={onSinkShapeChange}>
            <SelectTrigger id="sinkShape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oval">Oval</SelectItem>
              <SelectItem value="rectangular">Rectangular</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
