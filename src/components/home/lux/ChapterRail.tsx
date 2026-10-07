import { useEffect, useState } from "react";

interface Stop {
  id: string;
  label: string;
}

/**
 * Where you are in the story. Collects every [data-chapter] section on the
 * page; the one crossing the middle of the screen is current. Desktop: a quiet
 * rail of ticks on the right that names the current chapter and shows all
 * names on hover. Wide screens only: on smaller ones it would sit on content.
 */
const ChapterRail = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    setStops(els.map((el) => ({ id: el.id, label: el.dataset.chapter || "" })));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    // Leave the rail off over the hero and below the last stop
    const hero = document.getElementById("top");
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), { threshold: 0.5 });
    if (hero) heroIo.observe(hero);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, []);

  const go = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const shown = stops.some((s) => s.id === active);

  return (
      <nav
        aria-label="Story chapters"
        className="lux-rail fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
        data-shown={shown || undefined}
      >
        <ol className="flex flex-col items-end gap-1">
          {stops.map((s, i) => {
            const current = s.id === active;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={current ? "step" : undefined}
                  className="lux-rail-stop group flex min-h-[32px] items-center gap-3"
                >
                  <span className="lux-rail-label lux-material rounded-full px-2.5 py-1 font-display text-xs text-ivory">{s.label}</span>
                  <span className="font-display text-[0.7rem] tabular-nums text-stone">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true" className="lux-rail-tick block h-px bg-ivory" />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
  );
};

export default ChapterRail;
