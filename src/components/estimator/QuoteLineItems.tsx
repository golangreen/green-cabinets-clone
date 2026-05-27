import React from 'react';
import type { CostBreakdown } from '@/lib/types';
import { getCategoryGroup } from '@/lib/catalog-data';
import { fmt } from '@/lib/utils';

interface QuoteLineItemsProps {
  costs: CostBreakdown;
}

const QuoteLineItems: React.FC<QuoteLineItemsProps> = ({ costs }) => {
  let lastGroup = '';

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-semibold text-muted-foreground px-3">
        <span>Cabinet</span>
        <span className="text-center w-10">Qty</span>
        <span className="text-right w-16">Unit</span>
        <span className="text-right w-20">Total</span>
      </div>
      {costs.items.map((item) => {
        const group = getCategoryGroup(item.model);
        const showHeader = group !== lastGroup;
        lastGroup = group;
        return (
          <React.Fragment key={item.model}>
            {showHeader && (
              <div className="text-xs font-bold text-primary uppercase tracking-wider px-3 pt-3 pb-1">{group}</div>
            )}
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3 items-center surface-card rounded-xl px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.model}</span>
                  {item.finishSide !== 'none' && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      {item.finishSide === 'left' ? 'Finish L' : item.finishSide === 'right' ? 'Finish R' : 'Finish L+R'}
                    </span>
                  )}
                  {item.hardwareType !== 'none' && (
                    <span className="text-xs bg-accent text-muted-foreground px-1.5 py-0.5 rounded font-medium capitalize">
                      {item.hardwareType === 'finger-pull' ? 'Finger Pull' : item.hardwareType}
                      {(item.doors + item.drawers) > 0 && ` ×${item.doors + item.drawers}`}
                    </span>
                  )}
                  {(item.doors + item.drawers) > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {item.doors > 0 && `${item.doors}D`}{item.doors > 0 && item.drawers > 0 && '+'}{item.drawers > 0 && `${item.drawers}Dr`}
                    </span>
                  )}
                  {item.glassDoors && (
                    <span className="text-xs bg-info-soft text-info px-1.5 py-0.5 rounded font-medium">
                      Glass ×{item.doors}
                    </span>
                  )}
                  {item.pullOutShelves > 0 && (
                    <span className="text-xs bg-warning-soft text-warning px-1.5 py-0.5 rounded font-medium">
                      Shelf ×{item.pullOutShelves}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 sm:contents justify-end">
                <span className="text-sm font-semibold text-foreground text-center w-10">×{item.qty}</span>
                <span className="text-sm text-muted-foreground text-right w-16 hidden sm:block">{fmt(item.unitPrice)}</span>
                <span className="text-sm font-semibold text-foreground text-right w-20">{fmt(item.lineTotal)}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Custom line items */}
      {costs.customItems.length > 0 && (
        <>
          <div className="text-xs font-semibold text-muted-foreground px-3 pt-2">Custom Items</div>
          {costs.customItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3 items-center surface-card rounded-xl px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-accent text-muted-foreground px-1.5 py-0.5 rounded">Custom</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 sm:contents justify-end">
                <span className="text-sm font-semibold text-foreground text-center w-10">×{item.qty}</span>
                <span className="text-sm text-muted-foreground text-right w-16 hidden sm:block">{fmt(item.unitPrice)}</span>
                <span className="text-sm font-semibold text-foreground text-right w-20">{fmt(item.lineTotal)}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default QuoteLineItems;
