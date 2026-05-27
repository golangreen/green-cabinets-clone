import React from 'react';
import { Ruler } from 'lucide-react';
import type { AddOnsConfig, AddOnId } from '@/lib/estimator/types';
import { ADD_ON_OPTIONS } from '@/lib/estimator/pricing';
import { fmt } from '@/lib/estimator/utils';

interface AddOnsSectionProps {
  addOns: AddOnsConfig;
  setAddOns: (a: AddOnsConfig) => void;
  totalAddOnsCost: number;
}

const AddOnsSection: React.FC<AddOnsSectionProps> = ({ addOns, setAddOns, totalAddOnsCost }) => {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Ruler size={16} className="text-primary" />
        Trim & Panels <span className="text-xs font-normal text-muted-foreground">(per linear foot)</span>
      </div>
      <div className="space-y-2">
        {ADD_ON_OPTIONS.map((opt) => {
          const existing = addOns.find(a => a.id === opt.id);
          const lf = existing?.linearFeet || 0;
          return (
            <div key={opt.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 transition-all ${lf > 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{opt.name}</span>
                  <span className="text-xs text-primary font-medium">${opt.pricePerFoot}/ft</span>
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={lf || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    if (val === 0) {
                      setAddOns(addOns.filter(a => a.id !== opt.id));
                    } else if (existing) {
                      setAddOns(addOns.map(a => a.id === opt.id ? { ...a, linearFeet: val } : a));
                    } else {
                      setAddOns([...addOns, { id: opt.id, linearFeet: val }]);
                    }
                  }}
                  className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-right text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground w-4">ft</span>
                {lf > 0 && (
                  <span className="text-xs font-semibold text-foreground w-14 text-right">{fmt(Math.round(lf * opt.pricePerFoot))}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {totalAddOnsCost > 0 && (
        <p className="text-xs text-muted-foreground">Trim & panels total: <span className="font-semibold text-foreground">{fmt(totalAddOnsCost)}</span></p>
      )}
    </div>
  );
};

export default AddOnsSection;
