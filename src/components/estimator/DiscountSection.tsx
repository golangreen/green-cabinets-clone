import React from 'react';
import { Percent, DollarSign, Tag } from 'lucide-react';
import type { DiscountConfig, CostBreakdown } from '@/lib/types';
import { fmt } from '@/lib/utils';

interface DiscountSectionProps {
  discount: DiscountConfig;
  setDiscount: React.Dispatch<React.SetStateAction<DiscountConfig>>;
  costs: CostBreakdown;
}

const DiscountSection: React.FC<DiscountSectionProps> = ({ discount, setDiscount, costs }) => (
  <div className="surface-card rounded-2xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Customer Discount</span>
      </div>
      <button
        onClick={() => setDiscount(d => ({ ...d, enabled: !d.enabled }))}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${discount.enabled ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${discount.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>

    {discount.enabled && (
      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex gap-2">
          <button
            onClick={() => setDiscount(d => ({ ...d, type: 'percentage' }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              discount.type === 'percentage'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <Percent size={14} /> Percentage
          </button>
          <button
            onClick={() => setDiscount(d => ({ ...d, type: 'fixed' }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              discount.type === 'fixed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            <DollarSign size={14} /> Fixed Amount
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {discount.type === 'percentage' ? 'Discount %' : 'Amount ($)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={discount.type === 'percentage' ? 100 : undefined}
                value={discount.value || ''}
                onChange={(e) => setDiscount(d => ({ ...d, value: parseFloat(e.target.value) || 0 }))}
                placeholder={discount.type === 'percentage' ? '10' : '500'}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {discount.type === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Label (optional)</label>
            <input
              type="text"
              value={discount.label}
              onChange={(e) => setDiscount(d => ({ ...d, label: e.target.value }))}
              placeholder="e.g. Returning customer"
              maxLength={50}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {costs.discountAmount > 0 && (
          <p className="text-xs text-success font-medium">
            Saving {fmt(costs.discountAmount)} off {fmt(costs.grandTotal + costs.discountAmount)}
          </p>
        )}
      </div>
    )}
  </div>
);

export default DiscountSection;
