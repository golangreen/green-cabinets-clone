/** Opens the site-wide quote form (mounted once, in the Header). */
export const QUOTE_EVENT = "gc:open-quote";

export function openQuote() {
  window.dispatchEvent(new Event(QUOTE_EVENT));
}
