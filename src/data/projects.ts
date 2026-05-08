/**
 * Projects = real Green Cabinets installs that link a location (neighborhood)
 * to the materials used (MaterialPanel ids) and a small image gallery.
 *
 * This is the spine that powers the "neighborhoods ↔ materials ↔ galleries"
 * integration: from any neighborhood page we can show featured projects from
 * that area, and from any MaterialPanel modal we can show "used in N
 * projects" with a link to each one.
 *
 * Add a new project: drop photos into src/assets/projects/<slug>/, import
 * them at the top, and append to PROJECTS.
 */
import type { MaterialPanel } from "@/types/materials";
import { ALL_PANELS } from "./finishes";

// ── Project image imports (one section per project) ──────────────────────
import ues418DiningView from "@/assets/projects/418-e-75th/dining-view.jpeg";
import ues418IslandFront from "@/assets/projects/418-e-75th/island-front.jpeg";
import ues418IslandMarble from "@/assets/projects/418-e-75th/island-marble-backsplash.jpeg";

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Project {
  id: string;
  /** URL slug, e.g. /projects/418-e-75th-st */
  slug: string;
  title: string;
  /** Full street address — only show first line publicly. */
  address: string;
  /** Display name of the neighborhood (used in copy). */
  neighborhood: string;
  /** Slug that matches a key in NEIGHBORHOODS (data/neighborhoodSeo.ts). */
  neighborhoodSlug: string;
  borough: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";
  /** Year the project was completed (yyyy) or null if unknown. */
  year: number | null;
  /** 1–2 sentence summary used on cards. */
  summary: string;
  /** MaterialPanel.id values (must exist in ALL_PANELS). */
  materialIds: string[];
  images: ProjectImage[];
}

export const PROJECTS: Project[] = [
  {
    id: "418-e-75th-st",
    slug: "418-e-75th-st",
    title: "Two-tone Upper East Side kitchen",
    address: "418 E 75th St, New York, NY 10021",
    neighborhood: "Upper East Side",
    neighborhoodSlug: "upper-east-side",
    borough: "Manhattan",
    year: 2024,
    summary:
      "A bright Upper East Side kitchen pairing warm Shinnoki Ivory Oak veneer on the island and base cabinets with full-height AGT 647 Antique White wall units, set against a book-matched marble backsplash and waterfall island.",
    materialIds: ["shinnoki-s4-ivory-oak", "agt-647-antique-white"],
    images: [
      {
        src: ues418DiningView,
        alt: "Upper East Side kitchen with ivory oak island, white tall cabinets and walnut dining table",
        caption: "Open dining view — ivory oak island anchored by white floor-to-ceiling pantry wall.",
      },
      {
        src: ues418IslandFront,
        alt: "Marble backsplash and waterfall island in an Upper East Side kitchen",
        caption: "Book-matched marble backsplash with floating range hood and waterfall marble island.",
      },
      {
        src: ues418IslandMarble,
        alt: "Marble waterfall island with ivory oak base cabinets, Upper East Side",
        caption: "Detail of the waterfall island and ivory oak base run during punch-list.",
      },
    ],
  },
];

// ── Lookups ──────────────────────────────────────────────────────────────

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getProjectsByNeighborhood(neighborhoodSlug: string): Project[] {
  return PROJECTS.filter((p) => p.neighborhoodSlug === neighborhoodSlug);
}

export function getProjectsByMaterial(materialId: string): Project[] {
  return PROJECTS.filter((p) => p.materialIds.includes(materialId));
}

export function getProjectMaterials(project: Project): MaterialPanel[] {
  return project.materialIds
    .map((id) => ALL_PANELS.find((p) => p.id === id))
    .filter((p): p is MaterialPanel => Boolean(p));
}
