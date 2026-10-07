import type { ReactNode } from "react";

interface ChapterHeadProps {
  n: string;
  when?: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
}

/** "Chapter 01 · Week 1" + poster-scale serif title, for the homepage story. */
const ChapterHead = ({ n, when, title, lede, id }: ChapterHeadProps) => (
  <div data-reveal="up" className="max-w-3xl">
    <p className="lux-eyebrow mb-5">
      Chapter {n}
      {when && <span className="text-stone"> · {when}</span>}
    </p>
    <h2 id={id} className="lux-display text-[clamp(2.6rem,5.6vw,5.25rem)] text-ivory">
      {title}
    </h2>
    {lede && <p className="lux-body mt-6 max-w-2xl text-base sm:text-lg text-ivory/70">{lede}</p>}
  </div>
);

export default ChapterHead;
