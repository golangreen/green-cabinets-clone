// ── Pure functions for file analysis (no React dependencies) ────────────
import { cabinetLookup } from '@/lib/catalog-data';
import { fuzzyMatchCabinet } from '@/lib/fuzzy-cabinet-match';
import { calculateCustomCabinetPrice } from '@/lib/custom-price-calculator';
import type { FileCategory, CabinetPosition, SourceResult, ReconciliationData } from '@/lib/types';

/**
 * Classify a file by name/type into blueprint, elevation, or cabinet-list.
 */
export function classifyFile(file: File): FileCategory {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (name.match(/\.(csv|txt|xls|xlsx)$/)) return 'cabinet-list';
  if (name.match(/elev|^el[-_]/i)) return 'elevation';
  if (name.match(/invoice|estimate|est[-_]|cabinet[-_]?list|quote|order/i)) return 'cabinet-list';
  if (name.match(/blueprint|floorplan|floor[-_.]plan|layout|plan/i)) return 'blueprint';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'blueprint';
  if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|webp)$/)) return 'blueprint';
  return 'cabinet-list';
}

/**
 * Process raw items and skipped items through fuzzy matching.
 * Items already in the catalog stay as cabinets (green).
 * Skipped items that fuzzy-match get moved to fuzzyMatched (yellow).
 * Remaining skipped items stay as skipped (red).
 */
export function applyFuzzyMatching(
  rawItems: CabinetPosition[],
  rawSkipped: CabinetPosition[],
): { cabinets: CabinetPosition[]; fuzzyMatched: CabinetPosition[]; customPriced: CabinetPosition[]; skipped: CabinetPosition[] } {
  const rawCabinets: CabinetPosition[] = [];
  const rawFuzzy: CabinetPosition[] = [];
  const rawCustom: CabinetPosition[] = [];
  const skippedList: CabinetPosition[] = [];

  function tryClassify(item: CabinetPosition) {
    if (cabinetLookup[item.model]) {
      rawCabinets.push(item);
      return;
    }
    const fm = fuzzyMatchCabinet(item.model);
    if (fm) {
      rawFuzzy.push({ ...item, model: fm.matchedModel, fuzzyOriginal: item.model, fuzzyReason: fm.reason });
      return;
    }
    const cp = calculateCustomCabinetPrice(item.model);
    if (cp) {
      rawCustom.push({
        ...item,
        note: item.note || cp.description,
        customPricePerUnit: cp.price,
        customPricePerUnitZ: cp.priceZ,
        customPriceFormula: cp.formula,
      });
      return;
    }
    skippedList.push(item);
  }

  for (const item of rawItems) tryClassify(item);
  for (const item of rawSkipped) tryClassify(item);

  // Deduplicate cabinets by model
  const cabinetMap = new Map<string, CabinetPosition>();
  for (const c of rawCabinets) {
    const existing = cabinetMap.get(c.model);
    if (existing) { existing.qty += c.qty; } else { cabinetMap.set(c.model, { ...c }); }
  }
  const cabinets = Array.from(cabinetMap.values());

  // Deduplicate fuzzy: skip if model already in cabinets
  const fuzzyMap = new Map<string, CabinetPosition>();
  for (const fm of rawFuzzy) {
    if (cabinetMap.has(fm.model)) continue;
    const existing = fuzzyMap.get(fm.model);
    if (existing) { existing.qty += fm.qty; } else { fuzzyMap.set(fm.model, { ...fm }); }
  }

  // Deduplicate custom-priced by model
  const customMap = new Map<string, CabinetPosition>();
  for (const cp of rawCustom) {
    const existing = customMap.get(cp.model);
    if (existing) { existing.qty += cp.qty; } else { customMap.set(cp.model, { ...cp }); }
  }

  // Deduplicate skipped by model
  const skippedMap = new Map<string, CabinetPosition>();
  for (const s of skippedList) {
    const existing = skippedMap.get(s.model);
    if (existing) { existing.qty += s.qty; } else { skippedMap.set(s.model, { ...s }); }
  }

  return {
    cabinets,
    fuzzyMatched: Array.from(fuzzyMap.values()),
    customPriced: Array.from(customMap.values()),
    skipped: Array.from(skippedMap.values()),
  };
}

/**
 * Cross-reference multiple sources and build a reconciliation summary.
 */
export function buildReconciliation(sources: SourceResult[]): ReconciliationData {
  const allModels = new Map<string, { model: string; bySource: Record<string, number>; maxQty: number; drawerCount?: number }>();

  for (const src of sources) {
    const sourceTotals = new Map<string, number>();
    const sourceDrawerCounts = new Map<string, number>();
    for (const cab of [...src.cabinets, ...src.fuzzyMatched, ...(src.customPriced ?? [])]) {
      sourceTotals.set(cab.model, (sourceTotals.get(cab.model) || 0) + cab.qty);
      if (cab.drawerCount != null) {
        sourceDrawerCounts.set(cab.model, Math.max(sourceDrawerCounts.get(cab.model) ?? 0, cab.drawerCount));
      }
    }

    for (const [model, totalQty] of sourceTotals) {
      if (!allModels.has(model)) {
        allModels.set(model, { model, bySource: {}, maxQty: 0 });
      }
      const entry = allModels.get(model)!;
      entry.bySource[src.source] = totalQty;
      entry.maxQty = Math.max(entry.maxQty, totalQty);
      const dc = sourceDrawerCounts.get(model);
      if (dc != null) entry.drawerCount = Math.max(entry.drawerCount ?? 0, dc);
    }
  }

  const conflicts: string[] = [];
  for (const [model, entry] of allModels) {
    const qtys = Object.values(entry.bySource);
    if (qtys.length > 1 && new Set(qtys).size > 1) {
      conflicts.push(model);
    }
  }

  const merged = Array.from(allModels.values()).map(e => ({
    model: e.model,
    qty: e.maxQty,
    ...(e.drawerCount != null ? { drawerCount: e.drawerCount } : {}),
  }));

  return { sources, allModels, merged, conflicts };
}
