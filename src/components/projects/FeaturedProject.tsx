/**
 * FeaturedProject — compact "real install" card used on neighborhood pages
 * and (in slim variant) inside the MaterialsBrowser modal. Shows a hero
 * image, location, summary, the materials used (as small swatch chips),
 * and a thumbnail strip of the rest of the project photos.
 */
import { MapPin, Layers } from "lucide-react";
import type { Project } from "@/data/projects";
import { getProjectMaterials } from "@/data/projects";

interface Props {
  project: Project;
  /** Slim variant for use inside dialogs — single image, no thumbs strip. */
  slim?: boolean;
}

export const FeaturedProject = ({ project, slim = false }: Props) => {
  const materials = getProjectMaterials(project);
  const hero = project.images[0];
  const rest = project.images.slice(1);

  return (
    <article className="rounded-xl border border-border bg-background overflow-hidden">
      <div className={slim ? "aspect-[4/3]" : "aspect-[16/9]"}>
        <img
          src={hero.src}
          alt={hero.alt}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent font-semibold">
            <MapPin className="h-3.5 w-3.5" />
            {project.neighborhood}, {project.borough}
            {project.year && <span className="text-muted-foreground">· {project.year}</span>}
          </p>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mt-1">
            {project.title}
          </h3>
        </div>

        <p className="text-sm text-[#444] leading-relaxed">{project.summary}</p>

        {materials.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              <Layers className="h-3 w-3" /> Materials used
            </p>
            <div className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted/50 pl-1 pr-3 py-1"
                >
                  <span
                    className="h-5 w-5 rounded-full border border-border/50 overflow-hidden flex-shrink-0"
                    style={{ background: m.swatchHex ?? "#ddd" }}
                  >
                    {m.thumb && (
                      <img
                        src={m.thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </span>
                  <span className="text-xs">
                    <span className="font-semibold text-[#1a1a1a]">{m.brand}</span>{" "}
                    <span className="text-muted-foreground">{m.codes[0]}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!slim && rest.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {rest.map((img) => (
              <div key={img.src} className="aspect-square overflow-hidden rounded-md bg-muted">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default FeaturedProject;
