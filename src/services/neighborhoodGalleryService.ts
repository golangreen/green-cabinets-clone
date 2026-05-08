import { supabase } from "@/integrations/supabase/client";
import type {
  AiSuggestion,
  NeighborhoodGalleryItem,
  PublicNeighborhoodGalleryItem,
} from "@/types/neighborhoodGallery";

const BUCKET = "gallery-images";
const FOLDER = "neighborhoods";

export const neighborhoodGalleryService = {
  /** Public read — only published items, no address_note. */
  async listPublishedBySlug(slug: string): Promise<PublicNeighborhoodGalleryItem[]> {
    const { data, error } = await supabase
      .from("neighborhood_gallery")
      .select("id, neighborhood_slug, image_url, caption, alt_text, sort_order")
      .eq("neighborhood_slug", slug)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  /** Admin: list everything. */
  async listAllForAdmin(): Promise<NeighborhoodGalleryItem[]> {
    const { data, error } = await supabase
      .from("neighborhood_gallery")
      .select("*")
      .order("neighborhood_slug", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as NeighborhoodGalleryItem[];
  },

  async upload(file: File): Promise<{ storage_path: string; image_url: string }> {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ext || "jpg";
    const id = (crypto as Crypto).randomUUID();
    const storage_path = `${FOLDER}/${id}.${safeExt}`;
    const { error } = await supabase.storage.from(BUCKET).upload(storage_path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storage_path);
    return { storage_path, image_url: data.publicUrl };
  },

  async suggest(image_url: string, filename_hint?: string): Promise<AiSuggestion> {
    const { data, error } = await supabase.functions.invoke("suggest-gallery-caption", {
      body: { image_url, filename_hint },
    });
    if (error) throw error;
    if (!data || typeof data.caption !== "string") {
      throw new Error("AI returned no suggestion");
    }
    return data as AiSuggestion;
  },

  async create(input: {
    neighborhood_slug: string;
    image_url: string;
    storage_path: string;
    caption: string;
    alt_text: string;
    address_note?: string | null;
    sort_order?: number;
    is_published?: boolean;
    ai_suggested?: boolean;
  }): Promise<NeighborhoodGalleryItem> {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("neighborhood_gallery")
      .insert({
        ...input,
        sort_order: input.sort_order ?? 0,
        is_published: input.is_published ?? false,
        ai_suggested: input.ai_suggested ?? false,
        created_by: userData.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as NeighborhoodGalleryItem;
  },

  async update(
    id: string,
    patch: Partial<
      Pick<
        NeighborhoodGalleryItem,
        "neighborhood_slug" | "caption" | "alt_text" | "address_note" | "sort_order" | "is_published"
      >
    >,
  ): Promise<NeighborhoodGalleryItem> {
    const { data, error } = await supabase
      .from("neighborhood_gallery")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as NeighborhoodGalleryItem;
  },

  async remove(item: Pick<NeighborhoodGalleryItem, "id" | "storage_path">): Promise<void> {
    const { error } = await supabase.from("neighborhood_gallery").delete().eq("id", item.id);
    if (error) throw error;
    if (item.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
    }
  },
};
