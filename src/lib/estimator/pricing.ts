// Location multipliers and cost calculation
import { cabinetLookup, getCategoryGroup, sortCostItems } from '@/lib/estimator/catalog-data';
import type { SelectedCabinet, CustomLineItem, DeliveryConfig, InstallationConfig, DiscountConfig, CostBreakdown, FinishSide, HardwareType, HardwareConfig, AddOnsConfig, AddOnId, Collection } from '@/lib/estimator/types';
import { PANELS_BY_BRAND } from '@/data/finishes';
import type { MaterialBrand } from '@/types/materials';
import { getFinishById, type FinishOption } from '@/lib/estimator/finishes-data';

// Re-export for backward compatibility
export { getCategoryGroup, sortCostItems };

// Finish-side surcharges at retail pricing
export const FINISH_SIDE_COST = {
  none: 0,
  left: 179,
  right: 179,
  both: 275, // slight discount vs 2×$179
} as const satisfies Record<FinishSide, number>;

export const HARDWARE_COST: Record<HardwareType, number> = {
  none: 0,
  knob: 8,
  handle: 10,
  'finger-pull': 20,
} as const;

export const GLASS_DOOR_COST = 80; // per door
export const PULL_OUT_SHELF_COST = 135; // per shelf
export const DRAWER_SURCHARGE_PER_EXTRA = 90; // per drawer above the catalog standard (3 for DB cabinets)
const DB_STANDARD_DRAWERS = 3;

export const ADD_ON_OPTIONS: { id: AddOnId; name: string; description: string; pricePerFoot: number }[] = [
  { id: 'crown-molding', name: 'Crown Molding', description: 'Decorative top trim', pricePerFoot: 12 },
  { id: 'light-rail', name: 'Light Rail', description: 'Under-cabinet trim strip', pricePerFoot: 8 },
  { id: 'toe-kick', name: 'Toe Kick', description: 'Base cabinet kick board', pricePerFoot: 5 },
  { id: 'panels', name: 'Panels', description: 'End/filler panels', pricePerFoot: 18 },
  { id: 'led', name: 'LED Lighting', description: 'Under-cabinet LED strip lighting', pricePerFoot: 10 },
];

// ── Brand → markup multiplier ────────────────────────────────────────
// Markup applied on top of base cabinet pricing when the customer picks
// a finish from a given supplier. Tune per supplier cost & margin.
// Adding a new brand to PANELS_BY_BRAND with an entry here auto-wires it
// into both LocationStep (style picker) and the cost calculator.
export const BRAND_MULTIPLIERS: Record<MaterialBrand, number> = {
  Tafisa: 2.0,
  Shinnoki: 2.5,
  Egger: 2.2,
  Wilsonart: 1.9,
  AGT: 2.1,
  'Raphael Stone': 3.2,
};

const BRAND_DESCRIPTIONS: Record<MaterialBrand, string> = {
  Tafisa: 'TFL laminate panels — Canadian-made, 100+ decors',
  Shinnoki: 'Premium real-wood veneer panels (Belgium)',
  Egger: 'European decorative surfaces — wood & stone looks',
  Wilsonart: 'High-pressure laminate — durable & color-rich',
  AGT: 'High-gloss & matte acrylic panels (Turkey)',
  'Raphael Stone': 'Engineered stone slabs — fronts & countertops',
};

// Auto-build brand entries from the central panel registry, so every
// supplier shows up in LocationStep with the correct markup.
const BRAND_PRICING: Record<string, { multiplier: number; name: string; description: string; brand?: MaterialBrand }> =
  Object.fromEntries(
    (Object.keys(PANELS_BY_BRAND) as MaterialBrand[])
      .filter(b => PANELS_BY_BRAND[b].length > 0)
      .map(b => {
        const m = BRAND_MULTIPLIERS[b] ?? 2.0;
        const pct = Math.round((m - 1) * 100);
        return [
          b.toLowerCase().replace(/\s+/g, '-'),
          {
            multiplier: m,
            name: b,
            description: `${BRAND_DESCRIPTIONS[b]} — +${pct}%`,
            brand: b,
          },
        ];
      })
  );

export const pricingData: Record<string, { multiplier: number; name: string; description: string; brand?: MaterialBrand }> = {
  shaker: { multiplier: 1.5, name: 'Shaker (Painted)', description: 'Classic shaker doors, in-house paint — +50%' },
  'slim-shaker': { multiplier: 2.25, name: 'Slim Shaker', description: 'Narrow-rail shaker doors — +125%' },
  ...BRAND_PRICING,
  custom: { multiplier: 3.0, name: 'Custom', description: 'Fully custom build — +200%' },
};

/** Look up the pricing key matching a finish's brand, if any. */
export function pricingKeyForBrand(brand?: string): string | undefined {
  if (!brand) return undefined;
  const key = brand.toLowerCase().replace(/\s+/g, '-');
  return pricingData[key] ? key : undefined;
}

/**
 * Resolve the effective style multiplier. If the user has picked a
 * supplier finish, that brand's markup wins; otherwise fall back to the
 * door-style selection.
 */
export function resolveStyleMultiplier(locationKey: string, selectedFinishId?: string): {
  multiplier: number;
  name: string;
  key: string;
} {
  if (selectedFinishId) {
    const finish: FinishOption | undefined = getFinishById(selectedFinishId);
    const key = pricingKeyForBrand(finish?.brand);
    if (key) {
      const e = pricingData[key];
      return { multiplier: e.multiplier, name: `${e.name} — ${finish!.name}`, key };
    }
  }
  const e = pricingData[locationKey];
  return { multiplier: e?.multiplier ?? 1.0, name: e?.name ?? locationKey, key: locationKey };
}

export const DELIVERY_OPTIONS: Record<DeliveryConfig['option'], { name: string; description: string }> = {
  none: { name: 'No Delivery', description: 'Customer pickup from warehouse' },
  flatrate: { name: 'Flat Rate', description: 'Single delivery fee regardless of order size' },
  peritem: { name: 'Per Item', description: 'Fee calculated per cabinet/accessory' },
};

export const INSTALLATION_COMPLEXITY = [
  { id: 1.0, name: 'Standard', description: 'Basic wall & base installs, no custom work' },
  { id: 1.3, name: 'Moderate', description: 'Islands, corner units, or panel scribing' },
  { id: 1.6, name: 'Complex', description: 'Full custom: radius panels, hood surrounds, built-ins' },
] as const;

export function calculateCosts(
  selectedCabinets: SelectedCabinet[],
  location: string,
  customLineItems: CustomLineItem[] = [],
  delivery: DeliveryConfig = { option: 'none', flatRate: 250, perItemRate: 15 },
  installation: InstallationConfig = { enabled: false, ratePerCabinet: 85, complexityMultiplier: 1.0 },
  discount: DiscountConfig = { enabled: false, type: 'percentage', value: 0, label: '' },
  hardware: HardwareConfig = { type: 'none', applyAll: true, perCabinet: {} },
  addOns: AddOnsConfig = [],
  collection: Collection = 'luxor',
  selectedFinishId?: string,
): CostBreakdown {
  const resolved = resolveStyleMultiplier(location, selectedFinishId);
  const locationMultiplier = resolved.multiplier;


  const items = selectedCabinets
    .filter((sc) => sc.qty > 0)
    .map((sc) => {
      const item = cabinetLookup[sc.model];
      // Use catalog price, or fall back to custom price for non-catalog dimensions
      const baseUnitPrice = item
        ? (collection === 'zuma' ? (item.priceZ ?? item.price) : item.price)
        : sc.customPricePerUnit ?? null;
      if (baseUnitPrice == null) return null;
      const catalogDrawers = item?.drawers ?? 0;
      const actualDrawers  = sc.drawerCount ?? catalogDrawers;
      const extraDrawers   = Math.max(0, actualDrawers - DB_STANDARD_DRAWERS);
      // Only apply drawer surcharge when the item is a drawer-base (catalog marks drawers>0, no doors)
      const drawerSurcharge = (item?.doors === 0 && actualDrawers > DB_STANDARD_DRAWERS) ? extraDrawers * DRAWER_SURCHARGE_PER_EXTRA : 0;
      const unitPrice = baseUnitPrice + drawerSurcharge;
      const doors   = item?.doors   ?? (sc.model.match(/^W\d{2}/) ? (parseInt(sc.model.slice(1, 3)) >= 24 ? 2 : 1) : 2);
      const drawers  = actualDrawers;
      const drawerNote = drawerSurcharge > 0 ? ` (+${actualDrawers - DB_STANDARD_DRAWERS} extra drawer${actualDrawers - DB_STANDARD_DRAWERS > 1 ? 's' : ''})` : '';
      const description = (item?.description ?? `${sc.model}* (custom estimate)`) + drawerNote;
      const lineTotal = unitPrice * sc.qty;
      const finishSideCost = FINISH_SIDE_COST[sc.finishSide || 'none'] * sc.qty;
      const hwType = hardware.applyAll ? hardware.type : (hardware.perCabinet[sc.model] || 'none');
      const doorDrawerCount = (doors + drawers) * sc.qty;
      const hardwareCost = HARDWARE_COST[hwType] * doorDrawerCount;
      const glassDoors = sc.glassDoors && doors > 0;
      const glassDoorCost = glassDoors ? GLASS_DOOR_COST * doors * sc.qty : 0;
      const pullOutShelves = sc.pullOutShelves || 0;
      const pullOutShelfCost = pullOutShelves * PULL_OUT_SHELF_COST * sc.qty;
      return {
        model: sc.model,
        description,
        qty: sc.qty,
        unitPrice,
        lineTotal,
        finishSide: sc.finishSide || 'none' as FinishSide,
        finishSideCost,
        hardwareType: hwType,
        hardwareCost,
        doors,
        drawers,
        glassDoors: !!glassDoors,
        glassDoorCost,
        pullOutShelves,
        pullOutShelfCost,
        isCustomPriced: !item && sc.customPricePerUnit != null,
      };
    })
    .filter(Boolean) as CostBreakdown['items'];

  const customItems = customLineItems
    .filter((cl) => cl.qty > 0 && cl.unitPrice > 0)
    .map((cl) => ({
      description: cl.description,
      qty: cl.qty,
      unitPrice: cl.unitPrice,
      lineTotal: cl.unitPrice * cl.qty,
    }));

  const sortedItems = sortCostItems(items);

  const subtotal = sortedItems.reduce((s, i) => s + i.lineTotal, 0);
  const customSubtotal = customItems.reduce((s, i) => s + i.lineTotal, 0);
  const finishSideTotal = sortedItems.reduce((s, i) => s + i.finishSideCost, 0);
  const hardwareTotal = sortedItems.reduce((s, i) => s + i.hardwareCost, 0);
  const glassDoorTotal = sortedItems.reduce((s, i) => s + i.glassDoorCost, 0);
  const pullOutShelfTotal = sortedItems.reduce((s, i) => s + i.pullOutShelfCost, 0);

  const addOnItems = addOns
    .filter(a => a.linearFeet > 0)
    .map(a => {
      const opt = ADD_ON_OPTIONS.find(o => o.id === a.id);
      if (!opt) return null;
      return { name: opt.name, linearFeet: a.linearFeet, pricePerFoot: opt.pricePerFoot, lineTotal: Math.round(a.linearFeet * opt.pricePerFoot) };
    })
    .filter(Boolean) as CostBreakdown['addOnItems'];
  const addOnsTotal = addOnItems.reduce((s, i) => s + i.lineTotal, 0);

  const totalItemCount = sortedItems.reduce((s, i) => s + i.qty, 0) + customItems.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = delivery.option === 'flatrate'
    ? delivery.flatRate
    : delivery.option === 'peritem'
      ? delivery.perItemRate * totalItemCount
      : 0;

  const installationFee = installation.enabled
    ? Math.round(totalItemCount * installation.ratePerCabinet * installation.complexityMultiplier)
    : 0;

  // Apply style multiplier only to cabinets & extras, NOT hardware/delivery/installation
  const styledRaw = subtotal + finishSideTotal + glassDoorTotal + pullOutShelfTotal + addOnsTotal + customSubtotal;
  const styledSubtotal = Math.round(styledRaw * locationMultiplier);
  const flatRateTotal = hardwareTotal + deliveryFee + installationFee;
  const preDiscountTotal = styledSubtotal + flatRateTotal;

  // Apply discount after style multiplier
  let discountAmount = 0;
  if (discount.enabled && discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = Math.round(preDiscountTotal * (Math.min(discount.value, 100) / 100));
    } else {
      discountAmount = Math.min(Math.round(discount.value), preDiscountTotal);
    }
  }

  return {
    items: sortedItems,
    customItems,
    addOnItems,
    subtotal,
    customSubtotal,
    finishSideTotal,
    hardwareTotal,
    glassDoorTotal,
    pullOutShelfTotal,
    addOnsTotal,
    deliveryFee,
    installationFee,
    styledSubtotal,
    flatRateTotal,
    discountAmount,
    discountLabel: discount.enabled && discount.value > 0 ? discount.label || 'Discount' : '',
    grandTotal: preDiscountTotal - discountAmount,
    locationMultiplier,
    locationName: loc?.name || location,
  };
}
