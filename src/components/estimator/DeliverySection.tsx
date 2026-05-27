import React from 'react';
import { Truck } from 'lucide-react';
import type { DeliveryConfig, DeliveryOptionId } from '@/lib/estimator/types';
import { DELIVERY_OPTIONS } from '@/lib/estimator/pricing';

interface DeliverySectionProps {
  delivery: DeliveryConfig;
  setDelivery: (d: DeliveryConfig) => void;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ delivery, setDelivery }) => {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Truck size={16} className="text-primary" />
        Delivery
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(DELIVERY_OPTIONS) as [DeliveryOptionId, typeof DELIVERY_OPTIONS[DeliveryOptionId]][]).map(([key, opt]) => (
          <button
            key={key}
            onClick={() => setDelivery({ ...delivery, option: key })}
            className={`text-left p-3 rounded-xl border-2 transition-all ${
              delivery.option === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xs font-semibold text-foreground">{opt.name}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
          </button>
        ))}
      </div>
      {delivery.option === 'flatrate' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Flat rate:</span>
          <input type="number" value={delivery.flatRate} onChange={(e) => setDelivery({ ...delivery, flatRate: Number(e.target.value) })} className="w-24 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      )}
      {delivery.option === 'peritem' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Per item rate:</span>
          <input type="number" value={delivery.perItemRate} onChange={(e) => setDelivery({ ...delivery, perItemRate: Number(e.target.value) })} className="w-24 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      )}
    </div>
  );
};

export default DeliverySection;
