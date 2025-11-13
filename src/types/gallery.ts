export type GalleryCategory = "kitchens" | "vanities" | "closets" | "design-to-reality" | "all";

export interface GalleryImage {
  id: string;
  path: string;
  alt: string;
  category: GalleryCategory;
  products?: ProductInfo[];
}

export interface ProductInfo {
  supplier: string;
  code: string;
  description?: string;
}

export interface HeroImage {
  id: string;
  path: string;
  alt: string;
}
