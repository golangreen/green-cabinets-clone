import React from 'react';
import type { CostBreakdown } from '@/lib/estimator/types';
import { fmt } from '@/lib/estimator/utils';

interface QuoteCostSummaryProps {
  costs: CostBreakdown;
}

const QuoteCostSummary: React.FC<QuoteCostSummaryProps> = ({ costs }) => (
  <div className="surface-card rounded-2xl p-4 space-y-1 text-sm">
    {/* Styled items — multiplier applies */}
    {costs.locationMultiplier !== 1 && (
      <p className="text-xs font-semibold text-primary uppercase tracking-wider pb-1">
        Style-adjusted ({costs.locationName} ×{costs.locationMultiplier})
      </p>
    )}
    <div className="flex justify-between">
      <span className="text-muted-foreground">Cabinet subtotal ({costs.items.length} line items)</span>
      <span className="font-semibold text-foreground">{fmt(costs.subtotal)}</span>
    </div>
    {costs.customSubtotal > 0 && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Custom items ({costs.customItems.length})</span>
        <span className="font-semibold text-foreground">+{fmt(costs.customSubtotal)}</span>
      </div>
    )}
    {costs.finishSideTotal > 0 && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Finish-side surcharges</span>
        <span className="font-semibold text-foreground">+{fmt(costs.finishSideTotal)}</span>
      </div>
    )}
    {costs.glassDoorTotal > 0 && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Glass doors</span>
        <span className="font-semibold text-foreground">+{fmt(costs.glassDoorTotal)}</span>
      </div>
    )}
    {costs.pullOutShelfTotal > 0 && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Pull-out shelves</span>
        <span className="font-semibold text-foreground">+{fmt(costs.pullOutShelfTotal)}</span>
      </div>
    )}
    {costs.addOnsTotal > 0 && (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Trim & panels</span>
        <span className="font-semibold text-foreground">+{fmt(costs.addOnsTotal)}</span>
      </div>
    )}
    {costs.locationMultiplier !== 1 && (
      <div className="flex justify-between border-t border-border pt-1 mt-1">
        <span className="text-muted-foreground font-medium">Styled subtotal</span>
        <span className="font-bold text-foreground">{fmt(costs.styledSubtotal)}</span>
      </div>
    )}

    {/* Flat-rate items — no multiplier */}
    {costs.flatRateTotal > 0 && (
      <>
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-1">
            Flat-rate (no style adjustment)
          </p>
        </div>
        {costs.hardwareTotal > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Door/drawer hardware</span>
            <span className="font-semibold text-foreground">+{fmt(costs.hardwareTotal)}</span>
          </div>
        )}
        {costs.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery / Shipping</span>
            <span className="font-semibold text-foreground">+{fmt(costs.deliveryFee)}</span>
          </div>
        )}
        {costs.installationFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Installation labor</span>
            <span className="font-semibold text-foreground">+{fmt(costs.installationFee)}</span>
          </div>
        )}
      </>
    )}

    {costs.discountAmount > 0 && (
      <div className="flex justify-between text-success border-t border-border pt-1 mt-1">
        <span>{costs.discountLabel || 'Discount'}</span>
        <span className="font-semibold">−{fmt(costs.discountAmount)}</span>
      </div>
    )}
  </div>
);

export default QuoteCostSummary;
