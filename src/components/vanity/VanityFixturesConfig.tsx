import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface VanityFixturesConfigProps {
  includeFaucet: boolean;
  faucetStyle: string;
  faucetFinish: string;
  includeBacksplash: boolean;
  backsplashMaterial: string;
  backsplashHeight: string;
  includeVanityLighting: boolean;
  vanityLightingStyle: string;
  vanityLightBrightness: number;
  vanityLightTemp: number;
  includeMirror: boolean;
  mirrorType: string;
  mirrorSize: string;
  mirrorShape: string;
  mirrorFrame: string;
  includeTowelBar: boolean;
  towelBarPosition: string;
  includeToiletPaperHolder: boolean;
  includeRobeHooks: boolean;
  robeHookCount: number;
  includeShelving: boolean;
  shelvingType: string;
  onIncludeFaucetChange: (checked: boolean) => void;
  onFaucetStyleChange: (value: string) => void;
  onFaucetFinishChange: (value: string) => void;
  onIncludeBacksplashChange: (checked: boolean) => void;
  onBacksplashMaterialChange: (value: string) => void;
  onBacksplashHeightChange: (value: string) => void;
  onIncludeVanityLightingChange: (checked: boolean) => void;
  onVanityLightingStyleChange: (value: string) => void;
  onVanityLightBrightnessChange: (value: number[]) => void;
  onVanityLightTempChange: (value: number[]) => void;
  onIncludeMirrorChange: (checked: boolean) => void;
  onMirrorTypeChange: (value: string) => void;
  onMirrorSizeChange: (value: string) => void;
  onMirrorShapeChange: (value: string) => void;
  onMirrorFrameChange: (value: string) => void;
  onIncludeTowelBarChange: (checked: boolean) => void;
  onTowelBarPositionChange: (value: string) => void;
  onIncludeToiletPaperHolderChange: (checked: boolean) => void;
  onIncludeRobeHooksChange: (checked: boolean) => void;
  onRobeHookCountChange: (value: number[]) => void;
  onIncludeShelvingChange: (checked: boolean) => void;
  onShelvingTypeChange: (value: string) => void;
}

export const VanityFixturesConfig = (props: VanityFixturesConfigProps) => {
  return (
    <div className="space-y-6">
      {/* Faucet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeFaucet">Include Faucet</Label>
          <Switch
            id="includeFaucet"
            checked={props.includeFaucet}
            onCheckedChange={props.onIncludeFaucetChange}
          />
        </div>

        {props.includeFaucet && (
          <>
            <div>
              <Label htmlFor="faucetStyle">Faucet Style</Label>
              <Select value={props.faucetStyle} onValueChange={props.onFaucetStyleChange}>
                <SelectTrigger id="faucetStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="waterfall">Waterfall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="faucetFinish">Faucet Finish</Label>
              <Select value={props.faucetFinish} onValueChange={props.onFaucetFinishChange}>
                <SelectTrigger id="faucetFinish">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="brushed-nickel">Brushed Nickel</SelectItem>
                  <SelectItem value="matte-black">Matte Black</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Backsplash */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeBacksplash">Include Backsplash</Label>
          <Switch
            id="includeBacksplash"
            checked={props.includeBacksplash}
            onCheckedChange={props.onIncludeBacksplashChange}
          />
        </div>

        {props.includeBacksplash && (
          <>
            <div>
              <Label htmlFor="backsplashMaterial">Material</Label>
              <Select value={props.backsplashMaterial} onValueChange={props.onBacksplashMaterialChange}>
                <SelectTrigger id="backsplashMaterial">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subway-tile">Subway Tile</SelectItem>
                  <SelectItem value="marble-slab">Marble Slab</SelectItem>
                  <SelectItem value="glass-tile">Glass Tile</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="backsplashHeight">Height</Label>
              <Select value={props.backsplashHeight} onValueChange={props.onBacksplashHeightChange}>
                <SelectTrigger id="backsplashHeight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-inch">4 Inch</SelectItem>
                  <SelectItem value="full-height">Full Height</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Vanity Lighting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeVanityLighting">Include Vanity Lighting</Label>
          <Switch
            id="includeVanityLighting"
            checked={props.includeVanityLighting}
            onCheckedChange={props.onIncludeVanityLightingChange}
          />
        </div>

        {props.includeVanityLighting && (
          <>
            <div>
              <Label htmlFor="vanityLightingStyle">Lighting Style</Label>
              <Select value={props.vanityLightingStyle} onValueChange={props.onVanityLightingStyleChange}>
                <SelectTrigger id="vanityLightingStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sconce">Wall Sconces</SelectItem>
                  <SelectItem value="led-strip">LED Strip</SelectItem>
                  <SelectItem value="pendant">Pendant Lights</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Brightness: {props.vanityLightBrightness}%</Label>
              <Slider
                min={0}
                max={100}
                step={10}
                value={[props.vanityLightBrightness]}
                onValueChange={props.onVanityLightBrightnessChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Color Temperature: {props.vanityLightTemp}K</Label>
              <Slider
                min={2700}
                max={6500}
                step={100}
                value={[props.vanityLightTemp]}
                onValueChange={props.onVanityLightTempChange}
                className="mt-2"
              />
            </div>
          </>
        )}
      </div>

      {/* Mirror */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeMirror">Include Mirror</Label>
          <Switch
            id="includeMirror"
            checked={props.includeMirror}
            onCheckedChange={props.onIncludeMirrorChange}
          />
        </div>

        {props.includeMirror && (
          <>
            <div>
              <Label htmlFor="mirrorType">Type</Label>
              <Select value={props.mirrorType} onValueChange={props.onMirrorTypeChange}>
                <SelectTrigger id="mirrorType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mirror">Standard Mirror</SelectItem>
                  <SelectItem value="medicine-cabinet">Medicine Cabinet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mirrorSize">Size</Label>
              <Select value={props.mirrorSize} onValueChange={props.onMirrorSizeChange}>
                <SelectTrigger id="mirrorSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mirrorShape">Shape</Label>
              <Select value={props.mirrorShape} onValueChange={props.onMirrorShapeChange}>
                <SelectTrigger id="mirrorShape">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangular">Rectangular</SelectItem>
                  <SelectItem value="round">Round</SelectItem>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="arched">Arched</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mirrorFrame">Frame</Label>
              <Select value={props.mirrorFrame} onValueChange={props.onMirrorFrameChange}>
                <SelectTrigger id="mirrorFrame">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Frame</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="chrome">Chrome</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Accessories */}
      <div className="space-y-4">
        <h3 className="font-semibold">Accessories</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="includeTowelBar">Towel Bar</Label>
          <Switch
            id="includeTowelBar"
            checked={props.includeTowelBar}
            onCheckedChange={props.onIncludeTowelBarChange}
          />
        </div>

        {props.includeTowelBar && (
          <div>
            <Label htmlFor="towelBarPosition">Position</Label>
            <Select value={props.towelBarPosition} onValueChange={props.onTowelBarPositionChange}>
              <SelectTrigger id="towelBarPosition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="includeToiletPaperHolder">Toilet Paper Holder</Label>
          <Switch
            id="includeToiletPaperHolder"
            checked={props.includeToiletPaperHolder}
            onCheckedChange={props.onIncludeToiletPaperHolderChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="includeRobeHooks">Robe Hooks</Label>
          <Switch
            id="includeRobeHooks"
            checked={props.includeRobeHooks}
            onCheckedChange={props.onIncludeRobeHooksChange}
          />
        </div>

        {props.includeRobeHooks && (
          <div>
            <Label>Number of Hooks: {props.robeHookCount}</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              value={[props.robeHookCount]}
              onValueChange={props.onRobeHookCountChange}
              className="mt-2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="includeShelving">Additional Shelving</Label>
          <Switch
            id="includeShelving"
            checked={props.includeShelving}
            onCheckedChange={props.onIncludeShelvingChange}
          />
        </div>

        {props.includeShelving && (
          <div>
            <Label htmlFor="shelvingType">Shelving Type</Label>
            <Select value={props.shelvingType} onValueChange={props.onShelvingTypeChange}>
              <SelectTrigger id="shelvingType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="floating">Floating Shelf</SelectItem>
                <SelectItem value="corner">Corner Shelf</SelectItem>
                <SelectItem value="ladder">Ladder Shelf</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
