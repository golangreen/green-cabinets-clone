/**
 * MaterialsBrowser — browse real laminate/TFL panels from partner brands.
 * Lives inside the /wood-species page. Read-only: clients browse, click a
 * swatch to zoom, see codes, and bring the code(s) to the showroom.
 *
 * POC scope: Tafisa fully populated (117 panels, hot-linked from tafisa.ca).
 * Other brands stubbed — same component renders them once data lands.
 */
import { useMemo, useState } from "react";
import { Search, ExternalLink, Heart, Plus, Check, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getProjectsByMaterial } from "@/data/projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PANELS_BY_BRAND, BRAND_FULL_CATALOG_URL } from "@/data/finishes";
import type { MaterialBrand, MaterialPanel } from "@/types/materials";
import { useFinishSelection } from "@/hooks/useFinishSelection";

const BRANDS: { key: MaterialBrand; label: string }[] = [
  { key: "Tafisa", label: "Tafisa" },
  { key: "Shinnoki", label: "Shinnoki" },
  { key: "Egger", label: "Egger" },
  { key: "Wilsonart", label: "Wilsonart" },
  { key: "AGT", label: "AGT" },
  { key: "Raphael Stone", label: "Raphael Stone" },
];

function PanelCard({
  panel,
  onClick,
}: {
  panel: MaterialPanel;
  onClick: () => void;
}) {
  const { ids, toggle } = useFinishSelection();
  const selected = ids.includes(panel.id);
  return (
    <div className="group relative rounded-lg overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-lg transition-all">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle(panel.id);
        }}
        aria-label={selected ? `Remove ${panel.name} from selection` : `Add ${panel.name} to selection`}
        className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition-all ${
          selected
            ? "bg-[#5C7650] text-white scale-100"
            : "bg-white/90 text-accent-foreground opacity-0 group-hover:opacity-100 hover:scale-110"
        } ${selected ? "opacity-100" : ""}`}
      >
        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-[#5C7650]"
      >
        <div className="aspect-square overflow-hidden bg-muted">
          {panel.thumb ? (
            <img
              src={panel.thumb}
              alt={`${panel.brand} ${panel.name} panel sample`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              style={{ background: panel.swatchHex ?? "#ddd" }}
              aria-label={`${panel.name} approximate color swatch`}
            />
          )}
        </div>
        <div className="p-2.5 space-y-1">
          <h4 className="text-sm font-semibold text-[#1a1a1a] line-clamp-1">
            {panel.name}
          </h4>
          <p className="text-[11px] font-mono text-accent-foreground line-clamp-1">
            {panel.codes[0] ?? panel.brand}
          </p>
        </div>
      </button>
    </div>
  );
}

function PanelModal({
  panel,
  open,
  onOpenChange,
}: {
  panel: MaterialPanel | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { ids, toggle } = useFinishSelection();
  if (!panel) return null;
  const selected = ids.includes(panel.id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {panel.brand} — {panel.name}
          </DialogTitle>
          <DialogDescription>
            {panel.category} · {panel.finish}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {panel.hiRes ? (
              <img
                src={panel.hiRes}
                alt={`${panel.name} hi-res panel`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = panel.thumb;
                }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs text-primary-foreground"
                style={{ background: panel.swatchHex ?? "#ddd" }}
              >
                <span className="bg-foreground/85 px-2 py-1 rounded">
                  Approx. color — see live photo on {panel.brand}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Product codes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {panel.codes.map((c) => (
                  <Badge key={c} variant="secondary" className="font-mono">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-[#5C7650]/10 border border-[#5C7650]/30 p-3 text-[#1a1a1a]">
              <p className="font-semibold mb-1">In our Bushwick showroom</p>
              <p className="text-xs text-muted-foreground">
                Bring this code to see the actual sample, or mention it when
                you book a consultation and we will pull it for you.
              </p>
            </div>

            {(() => {
              const projects = getProjectsByMaterial(panel.id);
              if (projects.length === 0) return null;
              return (
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Used in {projects.length} real install{projects.length > 1 ? "s" : ""}
                  </p>
                  {projects.map((p) => (
                    <Link
                      key={p.id}
                      to={`/custom-kitchen-cabinets-${p.neighborhoodSlug}#featured`}
                      className="flex items-start gap-2 group"
                      onClick={() => onOpenChange(false)}
                    >
                      <img
                        src={p.images[0].src}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1a] group-hover:text-accent-foreground truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {p.neighborhood}, {p.borough}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
            <Button
              type="button"
              onClick={() => toggle(panel.id)}
              className={`w-full ${
                selected
                  ? "bg-[#5C7650] hover:bg-[#445339] text-white"
                  : "bg-white border border-[#5C7650] text-accent-foreground hover:bg-[#5C7650]/10"
              }`}
            >
              {selected ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to selection
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Add to my selection
                </>
              )}
            </Button>
            {panel.detailUrl && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={panel.detailUrl} target="_blank" rel="noopener noreferrer">
                  View on {panel.brand}
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BrandPanel({ brand }: { brand: MaterialBrand }) {
  const allPanels = PANELS_BY_BRAND[brand];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [finish, setFinish] = useState<string>("All");
  const [active, setActive] = useState<MaterialPanel | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allPanels.map((p) => p.category))).sort()],
    [allPanels]
  );
  const finishes = useMemo(
    () => ["All", ...Array.from(new Set(allPanels.map((p) => p.finish))).sort()],
    [allPanels]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPanels.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (finish !== "All" && p.finish !== finish) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.codes.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [allPanels, query, category, finish]);

  if (allPanels.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">
          {brand} catalog coming soon — we&apos;ll add it once the Tafisa POC is approved.
        </p>
      </div>
    );
  }

  const fullCatalogUrl = BRAND_FULL_CATALOG_URL[brand];

  return (
    <div className="space-y-4">
      {fullCatalogUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-[#5C7650]/30 bg-[#5C7650]/5 px-4 py-3">
          <p className="text-sm text-[#1a1a1a]">
            <span className="font-semibold">Curated picks below.</span>{" "}
            <span className="text-muted-foreground">
              These are the {brand} decors we order most for NYC kitchens — the brand offers many more.
            </span>
          </p>
          <Button asChild variant="outline" size="sm" className="shrink-0 border-[#5C7650] text-accent-foreground hover:bg-[#5C7650] hover:text-white">
            <a href={fullCatalogUrl} target="_blank" rel="noopener noreferrer">
              Browse full {brand} catalog
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by color family"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All colors" : c}
            </option>
          ))}
        </select>
        <select
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by finish"
        >
          {finishes.map((f) => (
            <option key={f} value={f}>
              {f === "All" ? "All finishes" : f}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {allPanels.length} {brand} panels.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((p) => (
          <PanelCard key={p.id} panel={p} onClick={() => setActive(p)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No panels match your filters.
        </div>
      )}

      <PanelModal
        panel={active}
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
      />
    </div>
  );
}

const MaterialsBrowser = () => {
  return (
    <Tabs defaultValue="Tafisa" className="w-full">
      <TabsList className="flex flex-wrap h-auto justify-center mb-6">
        {BRANDS.map((b) => {
          const count = PANELS_BY_BRAND[b.key].length;
          return (
            <TabsTrigger key={b.key} value={b.key} className="gap-1.5">
              {b.label}
              {count > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  ({count})
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {BRANDS.map((b) => (
        <TabsContent key={b.key} value={b.key}>
          <BrandPanel brand={b.key} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MaterialsBrowser;
