import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PackagePlus, Plus, Minus, Trash2, Copy, DollarSign, X, GripVertical } from 'lucide-react';
import type { CustomLineItem } from '@/lib/types';

const CUSTOM_PRESETS = [
  { label: 'Fridge Panel 24×84', description: 'Fridge Panel FP2484 (24" × 84")', unitPrice: 195 },
  { label: 'Fridge Panel 24×90', description: 'Fridge Panel FP2490 (24" × 90")', unitPrice: 210 },
  { label: 'Fridge Panel 24×96', description: 'Fridge Panel FP2496 (24" × 96")', unitPrice: 225 },
  { label: 'Tall Filler 3×84', description: 'Tall Filler TF384 (3" × 84")', unitPrice: 45 },
  { label: 'Tall Filler 3×90', description: 'Tall Filler TF390 (3" × 90")', unitPrice: 48 },
  { label: 'Tall Filler 3×96', description: 'Tall Filler TF396 (3" × 96")', unitPrice: 52 },
  { label: 'Tall Filler 6×84', description: 'Tall Filler TF684 (6" × 84")', unitPrice: 58 },
  { label: 'Base Filler 3×34.5', description: 'Base Filler BF3 (3" × 34.5")', unitPrice: 22 },
  { label: 'Base Filler 6×34.5', description: 'Base Filler BF6 (6" × 34.5")', unitPrice: 30 },
  { label: 'Wall Filler 3×30', description: 'Wall Filler WF330 (3" × 30")', unitPrice: 18 },
  { label: 'Wall Filler 3×36', description: 'Wall Filler WF336 (3" × 36")', unitPrice: 20 },
  { label: 'Wall Filler 3×42', description: 'Wall Filler WF342 (3" × 42")', unitPrice: 22 },
  { label: 'Hood Box 36×18', description: 'Custom Hood Box 36" × 18"', unitPrice: 520 },
  { label: 'Hood Box 30×18', description: 'Custom Hood Box 30" × 18"', unitPrice: 480 },
  { label: 'Radius End Panel R6', description: 'Radius End Panel R6 (curved)', unitPrice: 185 },
  { label: 'Radius End Panel R3', description: 'Radius End Panel R3 (tight curve)', unitPrice: 165 },
  { label: 'Dishwasher Front 24×30', description: 'Dishwasher Front Panel DP2430', unitPrice: 95 },
  { label: 'Appliance Panel 24×84', description: 'Custom Appliance Panel 24" × 84"', unitPrice: 210 },
  { label: 'Range Hood Surround', description: 'Range Hood Surround (3-piece)', unitPrice: 650 },
  { label: 'Wine Rack Insert', description: 'Wine Rack Insert (holds 12 bottles)', unitPrice: 175 },
  { label: 'Open Shelf Unit', description: 'Floating Open Shelf Unit 36"', unitPrice: 120 },
  { label: 'Toe Kick (8ft)', description: 'Toe Kick Board 4.5" × 96"', unitPrice: 28 },
] as const;

interface CustomLineItemsSectionProps {
  customLineItems: CustomLineItem[];
  setCustomLineItems: (items: CustomLineItem[]) => void;
}

const CustomLineItemsSection: React.FC<CustomLineItemsSectionProps> = ({ customLineItems, setCustomLineItems }) => {
  const [bulkMode, setBulkMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const unpricedItems = customLineItems.filter(cl => cl.needsPricing && cl.unitPrice === 0);

  const handleDragStart = useCallback((idx: number) => setDragIdx(idx), []);
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);
  const handleDragEnd = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const items = [...customLineItems];
      const [moved] = items.splice(dragIdx, 1);
      items.splice(overIdx, 0, moved);
      setCustomLineItems(items);
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx, customLineItems, setCustomLineItems]);

  useEffect(() => {
    if (bulkMode && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [bulkMode]);

  const addCustomItem = () => {
    setCustomLineItems([...customLineItems, { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0 }]);
  };

  const addPresetItem = (preset: { description: string; unitPrice: number }) => {
    setCustomLineItems([...customLineItems, { id: crypto.randomUUID(), description: preset.description, qty: 1, unitPrice: preset.unitPrice }]);
  };

  const updateCustomItem = (id: string, field: keyof CustomLineItem, value: string | number) => {
    setCustomLineItems(customLineItems.map(cl => {
      if (cl.id !== id) return cl;
      const updated = { ...cl, [field]: value };
      if (field === 'unitPrice' && Number(value) > 0) {
        updated.needsPricing = false;
      }
      return updated;
    }));
  };

  const duplicateCustomItem = (item: CustomLineItem) => {
    setCustomLineItems([...customLineItems, { ...item, id: crypto.randomUUID() }]);
  };

  const removeCustomItem = (id: string) => {
    setCustomLineItems(customLineItems.filter(cl => cl.id !== id));
  };

  const needsPricingCount = unpricedItems.length;

  // Auto-close bulk mode when all priced
  useEffect(() => {
    if (bulkMode && needsPricingCount === 0) {
      setBulkMode(false);
    }
  }, [needsPricingCount, bulkMode]);

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PackagePlus size={16} className="text-primary" />
          Custom Line Items
          {needsPricingCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-warning text-warning-foreground text-xs font-bold">
              {needsPricingCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {needsPricingCount > 0 && !bulkMode && (
            <button onClick={() => setBulkMode(true)} className="flex items-center gap-1 text-xs text-warning font-medium hover:underline">
              <DollarSign size={14} /> Price All
            </button>
          )}
          <button onClick={addCustomItem} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Hood boxes, radius panels, dishwasher fronts, or other non-catalog items</p>

      {/* Bulk pricing mode */}
      {bulkMode && unpricedItems.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Bulk Price Entry — {unpricedItems.length} item{unpricedItems.length !== 1 ? 's' : ''}</span>
            <button onClick={() => setBulkMode(false)} className="text-muted-foreground hover:text-foreground rounded p-0.5">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {unpricedItems.map((cl, idx) => (
              <div key={cl.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-foreground truncate" title={cl.description}>
                  {cl.description || '(no description)'}
                </span>
                <span className="text-xs text-muted-foreground">×{cl.qty}</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="number"
                    placeholder="0"
                    value={cl.unitPrice || ''}
                    onChange={(e) => updateCustomItem(cl.id, 'unitPrice', Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Tab') {
                        // Focus will naturally move to next input via tab order
                      }
                    }}
                    className="w-24 bg-background border border-warning/40 rounded-lg pl-5 pr-2 py-1.5 text-sm text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {CUSTOM_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => addPresetItem(preset)}
            className="text-xs bg-accent text-foreground px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-all border border-border"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {customLineItems.length > 0 && (
        <div className="space-y-2">
          {customLineItems.map((cl, idx) => (
            <div
              key={cl.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                dragIdx === idx ? 'opacity-40' : ''
              } ${overIdx === idx && dragIdx !== idx ? 'ring-2 ring-primary/40' : ''} ${
                cl.needsPricing && cl.unitPrice === 0 ? 'bg-warning/10 ring-1 ring-warning/40' : 'bg-accent'
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
                <GripVertical size={16} />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={cl.description}
                onChange={(e) => updateCustomItem(cl.id, 'description', e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
              />
              <div className="flex items-center gap-1">
                <button onClick={() => updateCustomItem(cl.id, 'qty', Math.max(0, cl.qty - 1))} className="w-6 h-6 flex items-center justify-center rounded border border-border">
                  <Minus size={12} className="text-muted-foreground" />
                </button>
                <span className="text-xs w-5 text-center font-semibold text-foreground">{cl.qty}</span>
                <button onClick={() => updateCustomItem(cl.id, 'qty', cl.qty + 1)} className="w-6 h-6 flex items-center justify-center rounded bg-primary text-primary-foreground">
                  <Plus size={12} />
                </button>
              </div>
              <input
                type="number"
                placeholder="$"
                value={cl.unitPrice || ''}
                onChange={(e) => updateCustomItem(cl.id, 'unitPrice', Number(e.target.value))}
                className={`w-20 bg-background border rounded-lg px-2 py-2 text-sm text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${cl.needsPricing && cl.unitPrice === 0 ? 'border-warning ring-1 ring-warning/30 animate-pulse' : 'border-border'}`}
              />
              <button onClick={() => duplicateCustomItem(cl)} className="text-muted-foreground hover:bg-accent rounded p-1" title="Duplicate">
                <Copy size={14} />
              </button>
              <button onClick={() => removeCustomItem(cl.id)} className="text-destructive hover:bg-destructive/10 rounded p-1" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomLineItemsSection;
