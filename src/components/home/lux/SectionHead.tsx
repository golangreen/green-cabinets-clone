import type { ReactNode } from "react";

interface SectionHeadProps {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  id?: string;
}

/** Eyebrow + serif headline (+ optional lede and a right-aligned link). */
const SectionHead = ({ eyebrow, title, lede, aside, id }: SectionHeadProps) => (
  <div className="mb-12 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
    <div className="max-w-3xl" data-reveal="up">
      <p className="lux-eyebrow mb-5">{eyebrow}</p>
      <h2 id={id} className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
        {title}
      </h2>
      {lede && <p className="lux-body mt-5 max-w-2xl text-base sm:text-lg text-ivory/70">{lede}</p>}
    </div>
    {aside && (
      <div className="shrink-0" data-reveal="up" style={{ "--d": "120ms" } as React.CSSProperties}>
        {aside}
      </div>
    )}
  </div>
);

export default SectionHead;
