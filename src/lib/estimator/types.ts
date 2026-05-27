// ── Shared types for the estimator ──────────────────────────────────────

/** Cabinet collection tier — Luxor (L) is standard, Zuma (Z) is premium */
export type Collection = 'luxor' | 'zuma';

export interface CabinetItem {
  model: string;
  description: string;
  category: string;
  price: number;    // Luxor (L) price per unit
  priceZ?: number;  // Zuma (Z) price per unit — if omitted, falls back to price
  doors: number;
  drawers: number;
  imageType?: CabinetImageType; // visual icon key for the UI
}

export type CabinetImageType =
  | 'wall-1d'
  | 'wall-2d'
  | 'wall-corner'
  | 'base-1d'
  | 'base-2d'
  | 'base-drawers'
  | 'base-sink'
  | 'base-corner'
  | 'base-ls'
  | 'tall'
  | 'vanity'
  | 'specialty'
  | 'accessory';

export type FinishSide = 'none' | 'left' | 'right' | 'both';

export interface SelectedCabinet {
  model: string;
  qty: number;
  finishSide: FinishSide;
  glassDoors?: boolean;
  pullOutShelves?: number; // number of pull-out shelves to add
  /** Explicit drawer count for DB cabinets (e.g. 4 or 5). Catalog default is 3. Each extra drawer adds a surcharge. */
  drawerCount?: number;
  customPricePerUnit?: number;  // set when model is not in catalog (custom dimension)
  customPriceFormula?: string;  // human-readable explanation of how price was estimated
}

export interface Kitchen {
  id: number;
  name: string;
  linearFeet: number;
  upperCabinets: number;
  lowerCabinets: number;
  island: boolean;
  islandSize: string;
}

export interface Bathroom {
  id: number;
  name: string;
  vanitySize: string;
  sinks: number;
  storage: string;
}

export interface Closet {
  id: number;
  name: string;
  linearFeet: number;
  type: string;
  shelving: boolean;
  drawers: number;
}

export interface Analysis {
  kitchens: Kitchen[];
  bathrooms: Bathroom[];
  closets: Closet[];
  totalSquareFootage: number;
  floors: number;
}

export type DeliveryOptionId = 'none' | 'flatrate' | 'peritem';

export interface DeliveryConfig {
  option: DeliveryOptionId;
  flatRate: number;
  perItemRate: number;
}

export interface InstallationConfig {
  enabled: boolean;
  ratePerCabinet: number; // base rate per standard cabinet
  complexityMultiplier: number; // 1.0 = standard, 1.3 = moderate, 1.6 = complex
}

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountConfig {
  enabled: boolean;
  type: DiscountType;
  value: number; // percentage (0-100) or fixed dollar amount
  label: string; // e.g. "Returning customer", "Volume discount"
}

export interface CostBreakdown {
  items: { model: string; description: string; qty: number; unitPrice: number; lineTotal: number; finishSide: FinishSide; finishSideCost: number; hardwareType: HardwareType; hardwareCost: number; doors: number; drawers: number; glassDoors: boolean; glassDoorCost: number; pullOutShelves: number; pullOutShelfCost: number; isCustomPriced?: boolean }[];
  customItems: { description: string; qty: number; unitPrice: number; lineTotal: number }[];
  addOnItems: { name: string; linearFeet: number; pricePerFoot: number; lineTotal: number }[];
  subtotal: number;
  customSubtotal: number;
  finishSideTotal: number;
  hardwareTotal: number;
  glassDoorTotal: number;
  pullOutShelfTotal: number;
  addOnsTotal: number;
  deliveryFee: number;
  installationFee: number;
  styledSubtotal: number;
  flatRateTotal: number;
  discountAmount: number;
  discountLabel: string;
  grandTotal: number;
  locationMultiplier: number;
  locationName: string;
}

export interface RoomSuggestion {
  roomName: string;
  roomType: 'kitchen' | 'bathroom' | 'closet';
  reasoning: string;
  items: SelectedCabinet[];
}

export interface CustomLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  needsPricing?: boolean;
}

export type HardwareType = 'none' | 'knob' | 'handle' | 'finger-pull';

export interface HardwareConfig {
  type: HardwareType;        // global default
  applyAll: boolean;          // true = same hardware on every cabinet
  perCabinet: Record<string, HardwareType>; // model -> override when applyAll=false
}

export type AddOnId = 'crown-molding' | 'light-rail' | 'toe-kick' | 'panels' | 'led';

export interface AddOnItem {
  id: AddOnId;
  linearFeet: number;
}

export type AddOnsConfig = AddOnItem[];

export type LinearFootRoomType = 'kitchen' | 'closet' | 'vanity' | 'laundry';

export interface LinearFootRoom {
  id: string;
  name: string;
  roomType: LinearFootRoomType;
  linearFeet: number;
  wallHeight: number;   // ceiling height in inches (e.g. 96)
  collection: Collection;
  includeUppers: boolean;
  includeLowers: boolean;
}

export interface LinearFootQuote {
  rooms: LinearFootRoom[];
  total: number;
}

export interface SuggestionResult {
  rooms: RoomSuggestion[];
  combined: SelectedCabinet[];
}

// ── Wall tally types ────────────────────────────────────────────────────

export interface WallCheckRow {
  wall: string;
  measured: number;
  cabinet_codes: string[];
  extracted: number;
  gap: number;
  status: 'ok' | 'warning' | 'missing' | 'over';
}

// ── File analysis types ─────────────────────────────────────────────────

export type FileCategory = 'blueprint' | 'elevation' | 'cabinet-list';

export interface CabinetPosition {
  model: string;
  qty: number;
  x?: number;  // normalized 0-1 horizontal position
  y?: number;  // normalized 0-1 vertical position
  note?: string;
  /** Explicit drawer count for DB cabinets (e.g. DB30-4 → drawerCount=4). Overrides catalog default of 3. */
  drawerCount?: number;
  /** When fuzzy-matched, stores the original unrecognized model code */
  fuzzyOriginal?: string;
  /** Reason string from fuzzy matching */
  fuzzyReason?: string;
  /** Calculated price per unit for non-catalog custom-dimension cabinets */
  customPricePerUnit?: number;
  /** Zuma tier price for custom-dimension cabinets */
  customPricePerUnitZ?: number;
  /** Human-readable explanation of how the price was estimated */
  customPriceFormula?: string;
}

export interface SourceResult {
  source: string;            // e.g. "Blueprint pages 1-3", "Elevation: kitchen.png"
  category: FileCategory;
  cabinets: CabinetPosition[];
  skipped: CabinetPosition[];
  /** Cabinets matched via fuzzy logic (priced at next size up) */
  fuzzyMatched: CabinetPosition[];
  /** Non-catalog cabinets with auto-calculated custom pricing (marked ✦) */
  customPriced: CabinetPosition[];
  analysis?: Analysis;       // only from blueprints
  /** Wall-by-wall dimension check from server */
  wallCheck?: WallCheckRow[];
}

export interface ReconciliationData {
  sources: SourceResult[];
  /** All models across all sources, keyed by model */
  allModels: Map<string, { model: string; bySource: Record<string, number>; maxQty: number; drawerCount?: number }>;
  /** Merged result using max-qty logic */
  merged: { model: string; qty: number; drawerCount?: number }[];
  /** Models where sources disagree on qty */
  conflicts: string[];
}
