/**
 * MaterialsBrowser — browse real laminate/TFL panels from partner brands.
 * Lives inside the /wood-species page. Read-only: clients browse, click a
 * swatch to zoom, see codes, and bring the code(s) to the showroom.
 *
 * POC scope: Tafisa fully populated (117 panels, hot-linked from tafisa.ca).
 * Other brands stubbed — same component renders them once data lands.
 */
import { useMemo, useState } from "react";
import { Search, ExternalLink } from "lucide-react";
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
import { PANELS_BY_BRAND } from "@/data/finishes";
import type { MaterialBrand, MaterialPanel } from "@/types/materials";

const BRANDS: { key: MaterialBrand; label: string }[] = [
  { key: "Tafisa", label: "Tafisa" },
  { key: "Shinnoki", label: "Shinnoki" },
  { key: "Egger", label: "Egger" },
  { key: "Wilsonart", label: "Wilsonart" },
];

function PanelCard({
  panel,
  onClick,
}: {
  panel: MaterialPanel;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-lg overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#5C7650]"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={panel.thumb}
          alt={`${panel.brand} ${panel.name} panel sample`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-2.5 space-y-1">
        <h4 className="text-sm font-semibold text-[#1a1a1a] line-clamp-1">
          {panel.name}
        </h4>
        <p className="text-[11px] font-mono text-[#5C7650] line-clamp-1">
          {panel.codes[0] ?? panel.brand}
        </p>
      </div>
    </button>
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
  if (!panel) return null;
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
            <img
              src={panel.hiRes}
              alt={`${panel.name} hi-res panel`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = panel.thumb;
              }}
            />
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
              <p className="text-xs text-[#555]">
                Bring this code to see the actual sample, or mention it when
                you book a consultation and we will pull it for you.
              </p>
            </div>
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

function BrandPanel({ brand }: { brand: MaterialBrand }) {
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

  return (
    <div className="space-y-4">
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
