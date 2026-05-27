import React, { useState, useMemo } from 'react';
import { ShoppingCart, Sparkles, ChevronDown, ChevronUp, UtensilsCrossed, Bath, DoorOpen, ArrowLeftRight, ChevronsUpDown, Check, Ruler } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cabinetCatalog, cabinetLookup } from '@/lib/estimator/catalog-data';
import { FINISH_SIDE_COST, HARDWARE_COST, GLASS_DOOR_COST, PULL_OUT_SHELF_COST, ADD_ON_OPTIONS } from '@/lib/estimator/pricing';
import { suggestCabinets } from '@/lib/estimator/suggest-cabinets';
import type { SelectedCabinet, CustomLineItem, DeliveryConfig, InstallationConfig, Analysis, RoomSuggestion, SuggestionResult, FinishSide, HardwareConfig, AddOnsConfig, Collection } from '@/lib/estimator/types';
import { fmt } from '@/lib/estimator/utils';
import InvoiceComparisonPanel from './InvoiceComparisonPanel';
import CustomLineItemsSection from './CustomLineItemsSection';
import HardwareSection from './HardwareSection';
import AddOnsSection from './AddOnsSection';
import DeliverySection from './DeliverySection';
import InstallationSection from './InstallationSection';
import CabinetCard from './CabinetCard';
import CabinetIcon from './CabinetIcon';
import LinearFootCalculator from './LinearFootCalculator';

interface MaterialsStepProps {
  selectedCabinets: SelectedCabinet[];
  setSelectedCabinets: (c: SelectedCabinet[]) => void;
  customLineItems: CustomLineItem[];
  setCustomLineItems: (items: CustomLineItem[]) => void;
  delivery: DeliveryConfig;
  setDelivery: (d: DeliveryConfig) => void;
  installation: InstallationConfig;
  setInstallation: (i: InstallationConfig) => void;
  hardware: HardwareConfig;
  setHardware: (h: HardwareConfig) => void;
  addOns: AddOnsConfig;
  setAddOns: (a: AddOnsConfig) => void;
  analysis?: Analysis | null;
  collection: Collection;
  setCollection: (c: Collection) => void;
  onBack: () => void;
  onNext: () => void;
}

const roomIcon = (type: RoomSuggestion['roomType']) => {
  switch (type) {
    case 'kitchen': return <UtensilsCrossed size={14} />;
    case 'bathroom': return <Bath size={14} />;
    case 'closet': return <DoorOpen size={14} />;
  }
};

type ActiveTab = 'catalog' | 'linear-foot';

const MaterialsStep: React.FC<MaterialsStepProps> = ({
  selectedCabinets, setSelectedCabinets,
  customLineItems, setCustomLineItems,
  delivery, setDelivery,
  installation, setInstallation,
  hardware, setHardware,
  addOns, setAddOns,
  analysis,
  collection, setCollection,
  onBack, onNext,
}) => {
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<SuggestionResult | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<number, boolean>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');

  const hasRooms = analysis && (analysis.kitchens.length > 0 || analysis.bathrooms.length > 0 || analysis.closets.length > 0);

  const handleLoadSuggestions = () => {
    if (!analysis) return;
    const result = suggestCabinets(analysis);
    setSuggestionResult(result);
    setSelectedCabinets(result.combined);
    setSuggestionsApplied(true);
    setExpandedRooms({ 0: true });
  };

  const qtyMap = useMemo(() => {
    const m: Record<string, number> = {};
    selectedCabinets.forEach((sc) => { m[sc.model] = sc.qty; });
    return m;
  }, [selectedCabinets]);

  const setQty = (model: string, qty: number) => {
    const existing = selectedCabinets.find((sc) => sc.model === model);
    const next = selectedCabinets.filter((sc) => sc.model !== model);
    if (qty > 0) next.push({ model, qty, finishSide: existing?.finishSide || 'none' });
    setSelectedCabinets(next);
  };

  const setFinishSide = (model: string, side: FinishSide) => {
    setSelectedCabinets(selectedCabinets.map((sc) => sc.model === model ? { ...sc, finishSide: side } : sc));
  };

  const setGlassDoors = (model: string, enabled: boolean) => {
    setSelectedCabinets(selectedCabinets.map((sc) => sc.model === model ? { ...sc, glassDoors: enabled } : sc));
  };

  const setPullOutShelves = (model: string, count: number) => {
    setSelectedCabinets(selectedCabinets.map((sc) => sc.model === model ? { ...sc, pullOutShelves: Math.max(0, count) } : sc));
  };

  // Use collection-aware price for totals
  const itemPrice = (model: string) => {
    const item = cabinetLookup[model];
    if (!item) return 0;
    return collection === 'zuma' ? (item.priceZ ?? item.price) : item.price;
  };

  const totalItems = selectedCabinets.reduce((s, sc) => s + sc.qty, 0);
  const totalCustomItems = customLineItems.reduce((s, cl) => s + cl.qty, 0);
  const totalBasePrice = selectedCabinets.reduce((s, sc) => s + itemPrice(sc.model) * sc.qty, 0);
  const totalCustomPrice = customLineItems.reduce((s, cl) => s + cl.unitPrice * cl.qty, 0);
  const totalFinishCost = selectedCabinets.reduce((s, sc) => s + FINISH_SIDE_COST[sc.finishSide || 'none'] * sc.qty, 0);
  const totalHardwareCost = selectedCabinets.reduce((s, sc) => {
    const hwType = hardware.applyAll ? hardware.type : (hardware.perCabinet[sc.model] || 'none');
    const item = cabinetLookup[sc.model];
    const doorDrawerCount = item ? (item.doors + item.drawers) * sc.qty : sc.qty;
    return s + HARDWARE_COST[hwType] * doorDrawerCount;
  }, 0);
  const totalGlassDoorCost = selectedCabinets.reduce((s, sc) => {
    if (!sc.glassDoors) return s;
    const item = cabinetLookup[sc.model];
    return s + (item ? GLASS_DOOR_COST * item.doors * sc.qty : 0);
  }, 0);
  const totalPullOutShelfCost = selectedCabinets.reduce((s, sc) => s + PULL_OUT_SHELF_COST * (sc.pullOutShelves || 0) * sc.qty, 0);
  const allItems = totalItems + totalCustomItems;
  const deliveryFee = delivery.option === 'flatrate' ? delivery.flatRate : delivery.option === 'peritem' ? delivery.perItemRate * allItems : 0;
  const installFee = installation.enabled ? Math.round(allItems * installation.ratePerCabinet * installation.complexityMultiplier) : 0;
  const totalAddOnsCost = addOns.reduce((s, a) => { const opt = ADD_ON_OPTIONS.find(o => o.id === a.id); return s + (opt ? Math.round(a.linearFeet * opt.pricePerFoot) : 0); }, 0);
  const totalPrice = totalBasePrice + totalFinishCost + totalHardwareCost + totalGlassDoorCost + totalPullOutShelfCost + totalAddOnsCost + totalCustomPrice + deliveryFee + installFee;

  const allCatalogItems = useMemo(() => Object.entries(cabinetCatalog).map(([key, cat]) => ({ key, name: cat.name, items: cat.items })), []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Select Cabinets</h2>
        <p className="text-muted-foreground mt-1">Green Cabinets catalog — choose a collection, then pick cabinets or estimate by linear foot</p>
      </div>

      {/* Collection selector */}
      <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-1.5">
        <div className="flex-1 flex gap-1">
          {(['luxor', 'zuma'] as Collection[]).map(c => (
            <button
              key={c}
              onClick={() => setCollection(c)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                collection === c
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="capitalize">{c}</span>
              {c === 'luxor' && <span className="text-xs font-normal ml-1 opacity-60">Standard</span>}
              {c === 'zuma' && <span className="text-xs font-normal ml-1 opacity-60">Premium</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
            activeTab === 'catalog'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart size={14} />
          Catalog
          {totalItems > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">{totalItems}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('linear-foot')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
            activeTab === 'linear-foot'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ruler size={14} />
          By Linear Foot
        </button>
      </div>

      {activeTab === 'linear-foot' && (
        <LinearFootCalculator collection={collection} />
      )}

      {activeTab === 'catalog' && (
        <>
          {/* Suggestion banner */}
          {hasRooms && !suggestionsApplied && totalItems === 0 && (
            <button onClick={handleLoadSuggestions} className="w-full flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 hover:bg-primary/15 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0"><Sparkles size={20} className="text-primary" /></div>
              <div>
                <p className="text-sm font-semibold text-foreground">Auto-fill from analysis</p>
                <p className="text-xs text-muted-foreground">
                  Suggest cabinets based on {analysis!.kitchens.length} kitchen{analysis!.kitchens.length !== 1 ? 's' : ''}
                  {analysis!.bathrooms.length > 0 && `, ${analysis!.bathrooms.length} bathroom${analysis!.bathrooms.length !== 1 ? 's' : ''}`}
                  {analysis!.closets.length > 0 && `, ${analysis!.closets.length} closet${analysis!.closets.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </button>
          )}

          {suggestionsApplied && suggestionResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent rounded-xl px-3 py-2">
                <Sparkles size={14} className="text-primary" />
                <span>Suggested cabinets loaded — adjust quantities as needed</span>
              </div>
              <div className="space-y-1.5">
                {suggestionResult.rooms.map((room, idx) => {
                  const isExpanded = expandedRooms[idx] || false;
                  const roomTotal = room.items.reduce((s, sc) => s + itemPrice(sc.model) * sc.qty, 0);
                  const roomQty = room.items.reduce((s, sc) => s + sc.qty, 0);
                  return (
                    <div key={idx} className="border border-border rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedRooms((prev) => ({ ...prev, [idx]: !prev[idx] }))} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 transition-all text-left">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-primary">{roomIcon(room.roomType)}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{room.roomName}</span>
                          <span className="text-xs text-muted-foreground">({roomQty} items)</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{fmt(roomTotal)}</span>
                          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-border">
                          <p className="text-xs text-muted-foreground py-2 italic">{room.reasoning}</p>
                          <div className="space-y-1">
                            {room.items.map((sc) => {
                              const item = cabinetLookup[sc.model];
                              if (!item) return null;
                              const p = collection === 'zuma' ? (item.priceZ ?? item.price) : item.price;
                              return (
                                <div key={sc.model} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CabinetIcon type={item.imageType} size={20} className="text-muted-foreground shrink-0" />
                                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-muted-foreground">{sc.model}</span>
                                    <span className="text-muted-foreground truncate">{item.description}</span>
                                  </div>
                                  <span className="text-foreground font-medium flex-shrink-0 ml-2">×{sc.qty} = {fmt(p * sc.qty)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cart summary */}
          {allItems > 0 && (
            <div className="space-y-2">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShoppingCart size={16} className="text-primary" />
                  {totalItems} cabinet{totalItems !== 1 ? 's' : ''}{totalCustomItems > 0 ? ` + ${totalCustomItems} custom` : ''} selected
                  <span className="text-xs text-muted-foreground capitalize ml-1">· {collection}</span>
                </div>
                <span className="text-lg font-bold text-primary">{fmt(totalPrice)}</span>
              </div>
              {!showComparison && (
                <button onClick={() => setShowComparison(true)} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl py-2 hover:bg-accent/50 transition-all">
                  <ArrowLeftRight size={14} /> Compare with Vendor Invoice
                </button>
              )}
            </div>
          )}

          {showComparison && <InvoiceComparisonPanel selectedCabinets={selectedCabinets} onClose={() => setShowComparison(false)} onApplyInvoice={(items) => setSelectedCabinets(items)} />}

          {/* Add cabinet dropdown */}
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 transition-colors">
                <span>Add cabinet from catalog…</span>
                <ChevronsUpDown size={14} className="shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search model or description…" />
                <CommandList className="max-h-64">
                  <CommandEmpty>No cabinet found.</CommandEmpty>
                  {allCatalogItems.map(cat => (
                    <CommandGroup key={cat.key} heading={cat.name}>
                      {cat.items.map(item => {
                        const isSelected = selectedCabinets.some(c => c.model === item.model);
                        const p = collection === 'zuma' ? (item.priceZ ?? item.price) : item.price;
                        return (
                          <CommandItem
                            key={item.model}
                            value={`${item.model} ${item.description}`}
                            onSelect={() => { setQty(item.model, (qtyMap[item.model] || 0) + 1); setComboOpen(false); }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Check size={14} className={`shrink-0 ${isSelected ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                              <CabinetIcon type={item.imageType} size={22} className="text-muted-foreground shrink-0" />
                              <span className="font-mono text-xs">{item.model}</span>
                              <span className="text-muted-foreground text-xs truncate">{item.description}</span>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">${p}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected cabinet cards */}
          {selectedCabinets.length > 0 && (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {selectedCabinets.map((sc) => (
                <CabinetCard
                  key={sc.model}
                  cabinet={sc}
                  collection={collection}
                  onSetQty={setQty}
                  onSetFinishSide={setFinishSide}
                  onSetGlassDoors={setGlassDoors}
                  onSetPullOutShelves={setPullOutShelves}
                />
              ))}
            </div>
          )}

          <CustomLineItemsSection customLineItems={customLineItems} setCustomLineItems={setCustomLineItems} />
          <HardwareSection hardware={hardware} setHardware={setHardware} selectedCabinets={selectedCabinets} totalHardwareCost={totalHardwareCost} />
          <AddOnsSection addOns={addOns} setAddOns={setAddOns} totalAddOnsCost={totalAddOnsCost} />
          <DeliverySection delivery={delivery} setDelivery={setDelivery} />
          <InstallationSection installation={installation} setInstallation={setInstallation} />
        </>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-secondary text-secondary-foreground py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-80 transition-all min-h-[48px] active:scale-[0.98]">Back</button>
        <button onClick={onNext} disabled={allItems === 0} className="flex-1 bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[48px] active:scale-[0.98]">
          View Quote — {fmt(totalPrice)}
        </button>
      </div>
    </div>
  );
};

export default MaterialsStep;
