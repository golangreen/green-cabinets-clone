/**
 * CompareDialog — side-by-side comparison of up to 4 selected MaterialPanels
 * across all brands (Tafisa, Shinnoki, Egger, Wilsonart). Opened from the
 * SelectionDrawer's Compare button.
 *
 * Shows: swatch (image or hex fallback), brand, name, product code(s),
 * color family, finish, and a link to the manufacturer page. Each column
 * has a remove button so the user can swap picks without leaving the view.
 */
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { useFinishSelection } from "@/hooks/useFinishSelection";
import { ALL_PANELS } from "@/data/finishes";
import type { MaterialPanel } from "@/types/materials";

const MAX_COMPARE = 4;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const CompareDialog = ({ open, onOpenChange }: Props) => {
  const { ids, remove } = useFinishSelection();

  const panels = useMemo<MaterialPanel[]>(
    () =>
      ids
        .map((id) => ALL_PANELS.find((p) => p.id === id))
        .filter((p): p is MaterialPanel => Boolean(p))
        .slice(0, MAX_COMPARE),
    [ids],
  );

  const extraCount = Math.max(0, ids.length - MAX_COMPARE);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Compare finishes ({panels.length}
            {panels.length === MAX_COMPARE && extraCount > 0 ? ` of ${ids.length}` : ""})
          </DialogTitle>
          <DialogDescription>
            {panels.length < 2
              ? "Add at least 2 finishes to your selection to compare them side-by-side."
              : extraCount > 0
                ? `Showing your first ${MAX_COMPARE} picks. Remove one to swap in another from your selection.`
                : "Side-by-side details across brands. Remove any pick to swap it out."}
          </DialogDescription>
        </DialogHeader>

        {panels.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Nothing to compare yet — tap the + on any swatch to add it.
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-4 ${
              panels.length === 1
                ? "grid-cols-1 max-w-xs mx-auto"
                : panels.length === 2
                  ? "grid-cols-2"
                  : panels.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {panels.map((p) => (
              <article
                key={p.id}
                className="relative rounded-lg border border-border bg-background overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 text-[#1a1a1a] shadow flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  aria-label={`Remove ${p.name} from comparison`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="aspect-square bg-muted">
                  {p.thumb ? (
                    <img
                      src={p.hiRes || p.thumb}
                      alt={`${p.brand} ${p.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = p.thumb;
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: p.swatchHex ?? "#ddd" }}
                      aria-label={`${p.name} approximate color`}
                    />
                  )}
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#5C7650] font-semibold">
                      {p.brand}
                    </p>
                    <h3 className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-2">
                      {p.name}
                    </h3>
                  </div>

                  <dl className="text-xs space-y-1.5 flex-1">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Code
                      </dt>
                      <dd className="font-mono text-[11px] text-[#1a1a1a] break-all">
                        {p.codes.join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Color family
                      </dt>
                      <dd>
                        <Badge variant="secondary" className="text-[10px]">
                          {p.category}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Finish
                      </dt>
                      <dd className="text-[11px] text-[#444]">{p.finish}</dd>
                    </div>
                  </dl>

                  {p.detailUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8"
                    >
                      <a href={p.detailUrl} target="_blank" rel="noopener noreferrer">
                        View on {p.brand}
                        <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {panels.length >= 2 && (
          <div className="mt-4 rounded-lg bg-[#5C7650]/10 border border-[#5C7650]/30 p-3 text-xs text-[#1a1a1a]">
            <span className="font-semibold">Pro tip:</span> Bring these codes to
            our Bushwick showroom to see real samples side-by-side, or use the
            "Send to us" tab in your selection to email them over for a quote.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompareDialog;
