/**
 * <picture> with the AVIF/WebP sizes from scripts/optimize-images.mjs.
 * Falls back to a plain <img> for photos that have no optimized copies.
 */
import type { ImgHTMLAttributes } from "react";
import manifest from "@/data/responsiveImages.json";

type Entry = { w: number; h: number; widths: number[] };
const MANIFEST = manifest as Record<string, Entry>;

/** Manifest key for a source URL (dev path, hashed build path or /public path). */
export function responsiveEntry(src: string): (Entry & { name: string }) | undefined {
  const file = src.split("?")[0].split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  for (const name of [file, file.replace(/-[A-Za-z0-9_-]{8}$/, "")]) {
    if (MANIFEST[name]) return { ...MANIFEST[name], name };
  }
  return undefined;
}

const srcSet = (name: string, widths: number[], fmt: string) =>
  widths.map((w) => `/img/opt/${name}-${w}.${fmt} ${w}w`).join(", ");

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes: string;
}

export default function ResponsiveImage({ src, alt, sizes, width, height, ...rest }: Props) {
  const e = responsiveEntry(src);
  if (!e) return <img src={src} alt={alt} width={width} height={height} {...rest} />;
  const largest = e.widths[e.widths.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(e.name, e.widths, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(e.name, e.widths, "webp")} sizes={sizes} />
      <img
        src={`/img/opt/${e.name}-${largest}.webp`}
        alt={alt}
        width={width ?? e.w}
        height={height ?? e.h}
        {...rest}
      />
    </picture>
  );
}
