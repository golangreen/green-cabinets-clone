interface PrintProps {
  src: string;
  alt: string;
  caption?: string;
  tilt?: number;
  delay?: number;
  ratio?: string;
  className?: string;
}

/**
 * A photo as a print: ivory border, a slight tilt it settles into as it
 * enters (outer element), and a straighten-and-lift on hover (inner element),
 * so the two transforms never fight over one transition.
 */
const Print = ({ src, alt, caption, tilt = 0, delay = 0, ratio = "aspect-[4/5]", className = "" }: PrintProps) => (
  <figure
    data-reveal="print"
    style={{ "--tilt": `${tilt}deg`, "--d": `${delay}ms` } as React.CSSProperties}
    className={className}
  >
    <div className="lux-print bg-ivory p-2.5 pb-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
      <div className={`relative overflow-hidden bg-ink-3 ${ratio}`}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {caption && <figcaption className="px-1 pt-3 font-lux text-lg leading-tight text-ink">{caption}</figcaption>}
    </div>
  </figure>
);

export default Print;
