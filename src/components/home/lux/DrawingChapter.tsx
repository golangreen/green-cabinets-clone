import { useEffect, useRef, useState } from "react";
import ChapterHead from "./ChapterHead";
import drawing from "@/assets/story/galley-kitchen-drawing.jpg";
import built from "@/assets/gallery/design-reality-kitchen-1-completed-view1.webp";

const CAPTIONS = [
  { k: "Drawn", v: "Every wall, window and outlet goes into the drawing before a single panel is ordered." },
  { k: "Approved", v: "You sign off on the layout, materials and hardware. Nothing is cut until you do." },
  { k: "Installed", v: "Same project, finished. White oak, flat panel, a marble waterfall island." },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Chapter 02, a pinned scene: the stage stays put while you scroll; a line
 * drawing of the kitchen dissolves into the same kitchen, installed, at the
 * same angle, and the captions step through.
 * Scroll-linked, so it is driven by scroll position (no timers). Only
 * transform and opacity are written, directly on each element. Reduced motion
 * gets a plain, unpinned layout with both images and all captions.
 */
const DrawingChapter = () => {
  const section = useRef<HTMLElement>(null);
  const builtImg = useRef<HTMLDivElement>(null);
  const renderImg = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLLIElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reduce || !section.current) return;
    const el = section.current;
    let raf = 0;
    let near = false;

    const paint = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      const t = smooth(0.42, 0.66, p);
      // Drawing and photo share one camera: same scale, so lines stay registered
      // while the photo fades up over the drawing (a slow push-in through it).
      const zoom = `scale(${1.06 - 0.06 * p})`;
      if (builtImg.current) {
        builtImg.current.style.opacity = String(t);
        builtImg.current.style.transform = zoom;
      }
      if (renderImg.current) renderImg.current.style.transform = zoom;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      caps.current.forEach((c, i) => {
        if (!c) return;
        const start = i / CAPTIONS.length;
        const end = (i + 1) / CAPTIONS.length;
        const fadeIn = i === 0 ? 1 : smooth(start - 0.06, start + 0.04, p);
        const fadeOut = i === CAPTIONS.length - 1 ? 1 : 1 - smooth(end - 0.04, end + 0.06, p);
        const o = Math.min(fadeIn, fadeOut);
        c.style.opacity = String(o);
        c.style.transform = `translateY(${(1 - o) * (p < start ? 14 : -14)}px)`;
      });
    };
    const onScroll = () => {
      if (near && !raf) raf = requestAnimationFrame(paint);
    };
    // Only do work while the scene is on or near the screen
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near) onScroll();
    }, { rootMargin: "50% 0px" });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const head = (
    <ChapterHead
      n="02"
      when="Weeks 1 to 2"
      id="ch2-title"
      title={
        <>
          On paper <em className="italic text-brass">first.</em>
        </>
      }
    />
  );

  if (reduce) {
    return (
      <section id="drawing" aria-labelledby="ch2-title" data-chapter="On paper" className="scroll-mt-20 bg-ink-2 py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          {head}
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="relative aspect-[3/2] bg-[#EFE8DA]">
              <img src={drawing} alt="Line drawing of the galley kitchen" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="relative aspect-[3/2] bg-ink-3">
              <img src={built} alt="The same kitchen installed: white oak cabinetry and a marble waterfall island" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-x-8 md:grid-cols-3">
            {CAPTIONS.map((c) => (
              <li key={c.k} className="border-t border-white/15 py-5">
                <p className="font-lux text-2xl text-ivory">{c.k}</p>
                <p className="lux-body mt-2 text-ivory/70">{c.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={section}
      id="drawing"
      aria-labelledby="ch2-title"
      data-chapter="On paper"
      className="relative bg-ink-2"
      style={{ height: "300svh" }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pt-20 pb-6 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-10 lg:py-0 xl:pr-36">
          <div className="lg:col-span-5">
            {head}
            <ol className="relative mt-6 h-[7.5rem] lg:mt-12 lg:h-36" aria-label="From drawing to installed">
              {CAPTIONS.map((c, i) => (
                <li
                  key={c.k}
                  ref={(n) => (caps.current[i] = n)}
                  className="absolute inset-x-0 top-0"
                  style={{ opacity: i === 0 ? 1 : 0, willChange: "opacity, transform" }}
                >
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">
                    {String(i + 1).padStart(2, "0")} · {c.k}
                  </p>
                  <p className="lux-body mt-3 max-w-md text-base sm:text-lg text-ivory/85">{c.v}</p>
                </li>
              ))}
            </ol>
            <div className="mt-2 h-px w-full max-w-md bg-white/15">
              <div ref={bar} className="h-px origin-left bg-brass" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative mx-auto aspect-[3/2] max-h-[46svh] w-full overflow-hidden bg-[#EFE8DA] lg:max-h-[70svh]">
              <div ref={renderImg} className="absolute inset-0" style={{ willChange: "transform" }}>
                <img
                  src={drawing}
                  alt="Line drawing of the galley kitchen before it was built"
                  className="h-full w-full object-cover"
                />
              </div>
              <div ref={builtImg} className="absolute inset-0" style={{ opacity: 0, willChange: "opacity, transform" }}>
                <img
                  src={built}
                  alt="The same kitchen installed: white oak cabinetry and a marble waterfall island"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DrawingChapter;
