# Finishes auto-importer

Drop a supplier feed → regenerate `src/data/finishes/<brand>.ts`, `index.ts`, and the `MaterialBrand` union. Zero manual edits.

## Usage

```bash
bun scripts/finishes/import-supplier.ts "<Brand>" <feed.csv|feed.json> [--catalog-url=https://...]
```

Examples:

```bash
# CSV from a Tafisa export
bun scripts/finishes/import-supplier.ts "Tafisa" data/feeds/tafisa.csv

# New supplier — auto-adds tab in the estimator, brand union, and BRAND_PRICING entry
bun scripts/finishes/import-supplier.ts "Formica" data/feeds/formica.json \
  --catalog-url=https://www.formica.com/en-us/products/laminate

# Re-scan brand files only (no new feed)
bun scripts/finishes/import-supplier.ts --regen-only
```

## Feed format

CSV (header row required) or JSON array. Recognised column aliases per `MaterialPanel` field:

| Field        | Accepted column names                                                       |
|--------------|-----------------------------------------------------------------------------|
| `name`       | name, decor_name, color, colour, title, product_name                        |
| `codes`      | codes, code, sku, decor_number, product_code, tfl, hpl (pipe/semicolon-sep) |
| `category`   | category, color_family, family, group, collection                           |
| `finish`     | finish, texture, surface                                                    |
| `thumb`      | thumb, thumbnail, image, image_small, swatch                                |
| `hiRes`      | hi_res, image_large, image_high, image_hires, image_full                    |
| `detailUrl`  | detail_url, url, product_url, link                                          |
| `swatchHex`  | swatch_hex, hex, color_hex                                                  |
| `slug`/`id`  | optional — derived from `name` if omitted                                   |

## Overrides

Put per-id patches in `scripts/finishes/overrides/<brand-slug>.json`. They merge on top of imported rows on every re-run — survives feed refreshes.

```json
{
  "tafisa-muse": { "category": "Designer Colors", "swatchHex": "#E5DCC9" }
}
```

## After a NEW brand is imported

1. The estimator picks it up automatically (new tab, swatches, search).
2. Add a pricing markup in `src/lib/estimator/pricing.ts → BRAND_MULTIPLIERS` (defaults to 2.0×).
3. Add a door-compatibility rule in `src/lib/estimator/compatibility.ts → BRAND_DOOR_RULES` (defaults to all doors).
