import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { neighborhoodGalleryService } from "@/services/neighborhoodGalleryService";
import type {
  AiSuggestion,
  NeighborhoodGalleryItem,
} from "@/types/neighborhoodGallery";
import { NEIGHBORHOODS } from "@/data/neighborhoodSeo";

const NEIGHBORHOOD_OPTIONS = Object.values(NEIGHBORHOODS).map((n) => ({
  slug: n.slug,
  label: `${n.name} (${n.boroughName})`,
}));

interface DraftItem {
  tempId: string;
  file: File;
  storage_path: string;
  image_url: string;
  caption: string;
  alt_text: string;
  neighborhood_slug: string;
  address_note: string;
  is_published: boolean;
  ai_suggested: boolean;
  status: "uploading" | "thinking" | "ready" | "saving" | "saved" | "error";
  error?: string;
}

const NeighborhoodGalleryAdmin = () => {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [items, setItems] = useState<NeighborhoodGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelected = () => setSelected(new Set());

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await neighborhoodGalleryService.listAllForAdmin();
      setItems(data);
    } catch (err) {
      toast({
        title: "Could not load gallery",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    for (const file of files) {
      const tempId = crypto.randomUUID();
      setDrafts((prev) => [
        {
          tempId,
          file,
          storage_path: "",
          image_url: "",
          caption: "",
          alt_text: "",
          neighborhood_slug: "",
          address_note: "",
          is_published: false,
          ai_suggested: false,
          status: "uploading",
        },
        ...prev,
      ]);

      try {
        const { storage_path, image_url } = await neighborhoodGalleryService.upload(file);
        setDrafts((prev) =>
          prev.map((d) =>
            d.tempId === tempId
              ? { ...d, storage_path, image_url, status: "thinking" }
              : d,
          ),
        );

        let suggestion: AiSuggestion | null = null;
        try {
          suggestion = await neighborhoodGalleryService.suggest(image_url, file.name);
        } catch (err) {
          console.warn("AI suggestion failed", err);
        }

        setDrafts((prev) =>
          prev.map((d) =>
            d.tempId === tempId
              ? {
                  ...d,
                  caption: suggestion?.caption ?? "",
                  alt_text: suggestion?.alt_text ?? "",
                  neighborhood_slug: suggestion?.suggested_neighborhood ?? "",
                  ai_suggested: !!suggestion,
                  status: "ready",
                }
              : d,
          ),
        );
      } catch (err) {
        setDrafts((prev) =>
          prev.map((d) =>
            d.tempId === tempId
              ? {
                  ...d,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : d,
          ),
        );
      }
    }
  };

  const updateDraft = (tempId: string, patch: Partial<DraftItem>) => {
    setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)));
  };

  const publishDraft = async (draft: DraftItem) => {
    if (!draft.neighborhood_slug) {
      toast({ title: "Pick a neighborhood first", variant: "destructive" });
      return;
    }
    if (!draft.caption.trim() || !draft.alt_text.trim()) {
      toast({ title: "Caption and alt text are required", variant: "destructive" });
      return;
    }
    updateDraft(draft.tempId, { status: "saving" });
    try {
      await neighborhoodGalleryService.create({
        neighborhood_slug: draft.neighborhood_slug,
        image_url: draft.image_url,
        storage_path: draft.storage_path,
        caption: draft.caption.trim(),
        alt_text: draft.alt_text.trim(),
        address_note: draft.address_note.trim() || null,
        is_published: draft.is_published,
        ai_suggested: draft.ai_suggested,
        sort_order: 0,
      });
      setDrafts((prev) => prev.filter((d) => d.tempId !== draft.tempId));
      toast({ title: draft.is_published ? "Published" : "Saved as draft" });
      await refresh();
    } catch (err) {
      updateDraft(draft.tempId, {
        status: "ready",
        error: err instanceof Error ? err.message : "Save failed",
      });
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const discardDraft = async (draft: DraftItem) => {
    setDrafts((prev) => prev.filter((d) => d.tempId !== draft.tempId));
    // Best-effort cleanup of orphaned upload
    if (draft.storage_path) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.storage.from("gallery-images").remove([draft.storage_path]);
      } catch {
        /* ignore */
      }
    }
  };

  const filteredItems = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.neighborhood_slug === filter)),
    [items, filter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, NeighborhoodGalleryItem[]>();
    for (const item of filteredItems) {
      const list = map.get(item.neighborhood_slug) ?? [];
      list.push(item);
      map.set(item.neighborhood_slug, list);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  const visibleIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const selectedCount = selected.size;

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const bulkSetPublished = async (is_published: boolean) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      await neighborhoodGalleryService.bulkSetPublished(Array.from(selected), is_published);
      toast({ title: is_published ? `Published ${selected.size} photos` : `Unpublished ${selected.size} photos` });
      clearSelected();
      await refresh();
    } catch (err) {
      toast({
        title: "Bulk update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} photo${selected.size === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const targets = items.filter((i) => selected.has(i.id)).map((i) => ({ id: i.id, storage_path: i.storage_path }));
      await neighborhoodGalleryService.bulkRemove(targets);
      toast({ title: `Deleted ${targets.length} photos` });
      clearSelected();
      await refresh();
    } catch (err) {
      toast({
        title: "Bulk delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Gallery Admin — Green Cabinets NY</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Neighborhood Gallery Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Drop photos → AI drafts the caption & neighborhood → review → publish.
            </p>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">← Back to site</Link>
        </div>

        {/* Upload zone */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/40 transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleFiles(e.dataTransfer.files);
              }}
            >
              <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Drop images here or click to browse</p>
              <p className="text-xs text-muted-foreground">
                JPG / PNG / WEBP. Multiple files OK. Address notes stay private.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
              />
            </label>
          </CardContent>
        </Card>

        {/* Drafts (uploaded, not yet saved) */}
        {drafts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Pending review ({drafts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drafts.map((d) => (
                <Card key={d.tempId} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted relative">
                    {d.image_url ? (
                      <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {d.status === "thinking" && (
                      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI thinking…
                      </div>
                    )}
                    {d.ai_suggested && d.status !== "thinking" && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        <Sparkles className="w-3 h-3 mr-1" /> AI draft
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label htmlFor={`nh-${d.tempId}`} className="text-xs">
                        Neighborhood
                      </Label>
                      <Select
                        value={d.neighborhood_slug}
                        onValueChange={(v) => updateDraft(d.tempId, { neighborhood_slug: v })}
                      >
                        <SelectTrigger id={`nh-${d.tempId}`} className="mt-1">
                          <SelectValue placeholder="Pick a neighborhood" />
                        </SelectTrigger>
                        <SelectContent>
                          {NEIGHBORHOOD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.slug} value={opt.slug}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`cap-${d.tempId}`} className="text-xs">
                        Caption (public)
                      </Label>
                      <Input
                        id={`cap-${d.tempId}`}
                        value={d.caption}
                        onChange={(e) => updateDraft(d.tempId, { caption: e.target.value })}
                        maxLength={200}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`alt-${d.tempId}`} className="text-xs">
                        Alt text (SEO)
                      </Label>
                      <Textarea
                        id={`alt-${d.tempId}`}
                        value={d.alt_text}
                        onChange={(e) => updateDraft(d.tempId, { alt_text: e.target.value })}
                        maxLength={300}
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`addr-${d.tempId}`} className="text-xs">
                        Private address note (admin-only, never shown publicly)
                      </Label>
                      <Input
                        id={`addr-${d.tempId}`}
                        value={d.address_note}
                        onChange={(e) => updateDraft(d.tempId, { address_note: e.target.value })}
                        maxLength={300}
                        placeholder="e.g. 123 Wyckoff Ave, Apt 4 — Smith family"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={d.is_published}
                          onCheckedChange={(v) => updateDraft(d.tempId, { is_published: v })}
                          id={`pub-${d.tempId}`}
                        />
                        <Label htmlFor={`pub-${d.tempId}`} className="text-sm">
                          Publish immediately
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void discardDraft(d)}
                          disabled={d.status === "saving"}
                        >
                          Discard
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void publishDraft(d)}
                          disabled={d.status === "saving" || d.status === "uploading" || d.status === "thinking"}
                        >
                          {d.status === "saving" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : d.is_published ? (
                            "Publish"
                          ) : (
                            "Save draft"
                          )}
                        </Button>
                      </div>
                    </div>
                    {d.error && (
                      <p className="text-xs text-destructive">{d.error}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Existing items */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Published & saved photos</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All neighborhoods</SelectItem>
              {NEIGHBORHOOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.slug} value={opt.slug}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk action bar */}
        {filteredItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-visible"
                checked={allVisibleSelected}
                onCheckedChange={selectAllVisible}
              />
              <Label htmlFor="select-all-visible" className="text-sm cursor-pointer">
                {allVisibleSelected ? "Deselect all" : "Select all visible"}
              </Label>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void bulkSetPublished(true)}
                disabled={selectedCount === 0 || bulkBusy}
              >
                {bulkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Eye className="w-4 h-4 mr-1" /> Publish</>}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void bulkSetPublished(false)}
                disabled={selectedCount === 0 || bulkBusy}
              >
                <EyeOff className="w-4 h-4 mr-1" /> Unpublish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void bulkDelete()}
                disabled={selectedCount === 0 || bulkBusy}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
              {selectedCount > 0 && (
                <Button size="sm" variant="ghost" onClick={clearSelected} disabled={bulkBusy}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">
            No photos yet. Upload above to get started.
          </p>
        ) : (
          <div className="space-y-10">
            {grouped.map(([slug, list]) => {
              const label = NEIGHBORHOOD_OPTIONS.find((o) => o.slug === slug)?.label ?? slug;
              return (
                <section key={slug}>
                  <h3 className="font-semibold text-lg mb-3">
                    {label} <span className="text-muted-foreground text-sm">({list.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((item) => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        selected={selected.has(item.id)}
                        onToggleSelect={() => toggleSelected(item.id)}
                        onChange={refresh}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SavedItemCard = ({
  item,
  onChange,
  selected,
  onToggleSelect,
}: {
  item: NeighborhoodGalleryItem;
  onChange: () => Promise<void> | void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) => {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(item);

  useEffect(() => setDraft(item), [item]);

  const save = async () => {
    setBusy(true);
    try {
      await neighborhoodGalleryService.update(item.id, {
        neighborhood_slug: draft.neighborhood_slug,
        caption: draft.caption,
        alt_text: draft.alt_text,
        address_note: draft.address_note,
        sort_order: draft.sort_order,
        is_published: draft.is_published,
      });
      toast({ title: "Saved" });
      setEditing(false);
      await onChange();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async () => {
    setBusy(true);
    try {
      await neighborhoodGalleryService.update(item.id, { is_published: !item.is_published });
      await onChange();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setBusy(true);
    try {
      await neighborhoodGalleryService.remove(item);
      toast({ title: "Deleted" });
      await onChange();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted relative">
        <img src={item.image_url} alt={item.alt_text} className="w-full h-full object-cover" />
        {!item.is_published && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Draft
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        {editing ? (
          <>
            <Select
              value={draft.neighborhood_slug}
              onValueChange={(v) => setDraft({ ...draft, neighborhood_slug: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEIGHBORHOOD_OPTIONS.map((o) => (
                  <SelectItem key={o.slug} value={o.slug}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              maxLength={200}
              placeholder="Caption"
            />
            <Textarea
              value={draft.alt_text}
              onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })}
              maxLength={300}
              rows={2}
              placeholder="Alt text"
            />
            <Input
              value={draft.address_note ?? ""}
              onChange={(e) => setDraft({ ...draft, address_note: e.target.value })}
              maxLength={300}
              placeholder="Private address note"
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs">Sort</Label>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
                className="w-20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setDraft(item); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="font-medium text-sm">{item.caption || <em className="text-muted-foreground">No caption</em>}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.alt_text}</p>
            {item.address_note && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                📍 {item.address_note}
              </p>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border/60 mt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id={`pub-toggle-${item.id}`}
                  checked={item.is_published}
                  onCheckedChange={togglePublished}
                  disabled={busy}
                  aria-label={item.is_published ? "Unpublish photo" : "Publish photo"}
                />
                <Label htmlFor={`pub-toggle-${item.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                  {item.is_published ? (
                    <><Eye className="w-3 h-3 text-primary" /> <span className="text-primary font-medium">Live on site</span></>
                  ) : (
                    <><EyeOff className="w-3 h-3 text-muted-foreground" /> <span className="text-muted-foreground">Hidden (draft)</span></>
                  )}
                </Label>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NeighborhoodGalleryAdmin;
