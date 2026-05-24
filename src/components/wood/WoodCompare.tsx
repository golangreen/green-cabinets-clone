/**
 * Interactive wood species comparison.
 * Pick 2-4 species and see side-by-side specs, swatch, image, pros/cons.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, X, ArrowRight } from "lucide-react";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const WoodCompare = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      setSelected(selected.filter((s) => s !== slug));
    } else if (selected.length < 4) {
      setSelected([...selected, slug]);
    }
  };

  const chosen = WOOD_SPECIES.filter((w) => selected.includes(w.slug));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5 text-[#5C7650]" />
          Compare Wood Species
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick up to 4 species to compare side-by-side
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 border rounded-lg p-3 bg-muted/40">
          {WOOD_SPECIES.map((w) => {
            const isOn = selected.includes(w.slug);
            const disabled = !isOn && selected.length >= 4;
            return (
              <div key={w.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`compare-${w.slug}`}
                  checked={isOn}
                  onCheckedChange={() => toggle(w.slug)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`compare-${w.slug}`}
                  className="text-xs cursor-pointer leading-tight flex items-center gap-1.5"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: w.swatch }}
                    aria-hidden="true"
                  />
                  {w.name}
                </Label>
              </div>
            );
          })}
        </div>

        {chosen.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Check a species above to start comparing.
          </p>
        )}

        {/* Comparison grid */}
        <div
          className={`grid gap-4 ${
            chosen.length === 1
              ? "grid-cols-1"
              : chosen.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {chosen.map((w) => (
            <div key={w.slug} className="relative border rounded-lg overflow-hidden bg-background">
              {chosen.length > 1 && (
                <button
                  onClick={() => toggle(w.slug)}
                  className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center"
                  aria-label={`Remove ${w.name} from comparison`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <img
                src={w.image}
                alt={`${w.name} wood grain sample for cabinet doors`}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-5 h-5 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: w.swatch }}
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-[#1a1a1a]">{w.name}</h3>
                </div>
                <p className="text-xs text-[#555555] italic">{w.tagline}</p>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Hardness</dt>
                    <dd className="font-medium text-[#1a1a1a]">{w.jankaHardness.toLocaleString()} lbf</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Cost</dt>
                    <dd className="font-mono text-[#5C7650]">{w.costTier}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Workability</dt>
                    <dd className="text-[#1a1a1a]">{w.workability}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Stain take</dt>
                    <dd className="text-[#1a1a1a]">{w.stainTake}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Color</dt>
                    <dd className="text-[#1a1a1a]">{w.color}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Grain</dt>
                    <dd className="text-[#1a1a1a]">{w.grain}</dd>
                  </div>
                </dl>

                <div className="pt-2 border-t border-border space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[#5C7650] mb-1">Pros</p>
                    <ul className="text-xs text-[#555555] list-disc list-inside space-y-0.5">
                      {w.pros.slice(0, 3).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">Cons</p>
                    <ul className="text-xs text-[#555555] list-disc list-inside space-y-0.5">
                      {w.cons.slice(0, 2).map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full bg-[#5C7650] hover:bg-[#445339] text-white"
                >
                  <Link to={`/wood-species/${w.slug}`}>
                    Read full guide <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {selected.length >= 4 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum 4 species can be compared at once
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WoodCompare;
