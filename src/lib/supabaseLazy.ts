/**
 * Loads the Supabase client on first use. Services that marketing pages
 * import (quote form, blog, neighborhood gallery) use this so the ~50 KB
 * client is fetched only when a request is actually made, not on first paint.
 */
let pending: Promise<typeof import("@/integrations/supabase/client").supabase> | null = null;

export function getSupabase() {
  pending ??= import("@/integrations/supabase/client").then((m) => m.supabase);
  return pending;
}
