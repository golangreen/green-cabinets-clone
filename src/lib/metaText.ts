/**
 * Keep <title> and meta descriptions inside what search results show
 * (about 60 and 160 characters) without chopping words mid-way.
 */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** Use the first suffix that still fits (e.g. " | Green Cabinets NY"), else the bare title. */
export function fitTitle(base: string, suffixes: string[] = [" | Green Cabinets NY"], max = TITLE_MAX): string {
  for (const s of suffixes) if ((base + s).length <= max) return base + s;
  return base;
}

/**
 * Whole sentences while they fit; if even the first sentence is too long,
 * cut it at a word boundary and add an ellipsis.
 */
export function fitDescription(text: string | null | undefined, max = DESCRIPTION_MAX): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const sentences = t.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [t];
  let out = "";
  for (const s of sentences) {
    const next = (out + " " + s.trim()).trim();
    if (next.length > max) break;
    out = next;
  }
  if (out) return out;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]\s*$/, "") + "…";
}
