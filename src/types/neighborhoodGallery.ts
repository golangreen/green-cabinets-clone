export interface NeighborhoodGalleryItem {
  id: string;
  neighborhood_slug: string;
  image_url: string;
  storage_path: string;
  caption: string;
  alt_text: string;
  address_note: string | null;
  sort_order: number;
  is_published: boolean;
  ai_suggested: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicNeighborhoodGalleryItem {
  id: string;
  neighborhood_slug: string;
  image_url: string;
  caption: string;
  alt_text: string;
  sort_order: number;
}

export interface AiSuggestion {
  caption: string;
  alt_text: string;
  suggested_neighborhood: string | null;
}
