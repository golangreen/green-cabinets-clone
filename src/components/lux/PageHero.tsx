import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: Crumb[];
  aside?: ReactNode;
  children?: ReactNode;
}

/**
 * Opening of an inner page in the homepage's language: quiet breadcrumb,
 * brass eyebrow, large serif headline that rises in, a light lede.
 */
const PageHero = ({ eyebrow, title, lede, crumbs, aside, children }: PageHeroProps) => (
  <header className="mx-auto max-w-[1440px] px-4 pb-14 pt-32 sm:px-6 md:pb-20 md:pt-44 lg:px-10">
    {crumbs && (
      <nav aria-label="Breadcrumb" className="mb-10 font-display text-xs text-stone" data-reveal="up">
        <ol className="flex flex-wrap items-center gap-2">
          {crumbs.map((c, i) => (
            <li key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.to ? (
                <Link to={c.to} className="inline-flex min-h-6 items-center transition-colors hover:text-ivory">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ivory/80">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl">
        <p className="lux-eyebrow mb-6" data-reveal="up">
          {eyebrow}
        </p>
        <h1
          className="lux-display text-[clamp(2.8rem,7vw,6.5rem)] text-ivory"
          data-reveal="up"
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          {title}
        </h1>
        {lede && (
          <div
            className="lux-body mt-7 max-w-2xl text-base text-ivory/70 sm:text-lg"
            data-reveal="up"
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {lede}
          </div>
        )}
      </div>
      {aside && (
        <div className="shrink-0" data-reveal="up" style={{ "--d": "220ms" } as React.CSSProperties}>
          {aside}
        </div>
      )}
    </div>
    {children}
  </header>
);

export default PageHero;
