## Goal

Bring the full Blueprint Cost Estimator (the same tool you saw in the other project) onto `greencabinetsny.com` as a new public-facing route `/estimator`, with optional login so customers can save and revisit their quotes.

## What clients will be able to do

1. Visit `/estimator` (linked from the header / hero CTA on the homepage).
2. Upload blueprints, elevations, or a cabinet list (PDF/PNG/JPG).
3. AI auto-detects rooms, walls, and cabinets; client can override manually.
4. Pick collection (Luxor or Zuma), finishes, hardware, add-ons, delivery, installation, and any discount.
5. Get a live itemized quote with grand total and downloadable PDF.
6. Place a self-serve order (no login needed) → emails sales + customer.
7. Optional: sign in to save the quote, view it under `/estimator/quotes`, and load/edit it later.

## Where it lives

- New route `/estimator` → main flow (5 steps: Upload → Location → Materials → Quote → Order).
- New route `/estimator/quotes` → saved-quote list (auth required).
- Header link "Cost Estimator" added between "Designer" and "Shop".
- Hero CTA gets a secondary "Estimate Your Project" button linking here.
- Existing `/designer` (room-layout tool) stays untouched.

## Backend additions

New tables (separate from your existing tables, no conflicts):

- `saved_quotes` — user-scoped, RLS so each user only sees their own.
- `orders` — public insert (guest checkout), authenticated SELECT for future admin.
- `profiles` — auto-created on signup, stores display name.

New storage bucket: `email-assets` (public, holds logo for emailed quotes).

5 new edge functions (no manual deploy needed):

- `analyze-blueprint` — uses Lovable AI (Gemini) to parse uploaded blueprints. Free, already covered by your `LOVABLE_API_KEY`.
- `parse-cabinet-list`, `parse-elevation` — AI parsers for cabinet-list PDFs and elevation drawings.
- `send-quote` — emails the styled quote PDF via Resend (uses your existing `RESEND_API_KEY`).
- `send-order` — emails order confirmation to customer + sales (uses `RESEND_API_KEY`).

No new secrets required.

## Files copied from Blueprint to Budget

- 22 estimator components under `src/components/estimator/`.
- 1 saved-quotes compare view.
- 14 helper libs (pricing, cabinet catalog, finishes, PDF generation, fuzzy matching, render-annotated-blueprints, etc.) under `src/lib/estimator/`.
- 3 hooks: `useEstimator`, `useFileAnalyzer`, `useCamera` under `src/hooks/`.
- 5 edge functions under `supabase/functions/`.
- 1 migration that creates the 3 tables, bucket, and triggers.

Where the source project uses its own `useAuth`, this port will wire to your existing `useAuth` hook so a single login covers the whole site.

## Risk / scope notes

- This is a large port (~45 files). I'll keep all estimator code under its own folders so nothing collides with existing pages.
- AI blueprint analysis uses `LOVABLE_API_KEY` (already present) — no extra cost setup.
- Quote/order emails use your existing Resend setup — sender stays `orders@greencabinetsny.com`.
- One small UI tweak: header gets a new top-level link. If you don't want that, I'll skip it and just hero-link it.

## Approve to proceed

If this matches what you want, approve and I'll execute in this order:
1. Run the database migration.
2. Deploy edge functions.
3. Copy all source files.
4. Add the routes + header link.
5. Verify the flow in the preview.
