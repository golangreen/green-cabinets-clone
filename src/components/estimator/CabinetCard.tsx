import React from 'react';
import { Plus, Minus, Trash2, PanelLeft, GlassWater, Layers } from 'lucide-react';
import { cabinetLookup } from '@/lib/estimator/catalog-data';
import { FINISH_SIDE_COST, GLASS_DOOR_COST, PULL_OUT_SHELF_COST } from '@/lib/estimator/pricing';
import type { SelectedCabinet, FinishSide, Collection } from '@/lib/estimator/types';
import { fmt } from '@/lib/estimator/utils';
import CabinetIcon from './CabinetIcon';

interface CabinetCardProps {
  cabinet: SelectedCabinet;
  collection?: Collection;
  onSetQty: (model: string, qty: number) => void;
  onSetFinishSide: (model: string, side: FinishSide) => void;
  onSetGlassDoors: (model: string, enabled: boolean) => void;
  onSetPullOutShelves: (model: string, count: number) => void;
}

const CabinetCard: React.FC<CabinetCardProps> = ({ cabinet: sc, collection = 'luxor', onSetQty, onSetFinishSide, onSetGlassDoors, onSetPullOutShelves }) => {
  const item = cabinetLookup[sc.model];
  if (!item) return null;

  const unitPrice = collection === 'zuma' ? (item.priceZ ?? item.price) : item.price;
  const qty = sc.qty;
  const finish = sc.finishSide || 'none';
  const finishCost = FINISH_SIDE_COST[finish] * qty;
  const hasGlass = sc.glassDoors || false;
  const shelfCount = sc.pullOutShelves || 0;

  return (
    <div className="p-3 border border-primary bg-accent rounded-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-3">
          <div className="flex items-center gap-2">
            <CabinetIcon type={item.imageType} size={28} className="text-primary/70 shrink-0" />
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{sc.model}</span>
            <span className="text-sm font-semibold text-primary">{fmt(unitPrice)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onSetQty(sc.model, qty - 1)} className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-all active:scale-95">
            <Minus size={14} className="text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold w-6 text-center text-foreground">{qty}</span>
          <button onClick={() => onSetQty(sc.model, qty + 1)} className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95">
            <Plus size={14} />
          </button>
          <button onClick={() => onSetQty(sc.model, 0)} className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-all ml-1 active:scale-95">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground flex items-center gap-1"><PanelLeft size={12} /> Finish Side:</span>
        {(['none', 'left', 'right', 'both'] as const).map((side) => (
          <button
            key={side}
            onClick={() => onSetFinishSide(sc.model, side)}
            className={`px-2.5 py-1.5 sm:px-2 sm:py-0.5 rounded-md transition-all capitalize min-h-[32px] sm:min-h-0 ${
              finish === side
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {side === 'none' ? 'None' : side === 'both' ? 'L+R' : side === 'left' ? 'Left' : 'Right'}
          </button>
        ))}
        {finish !== 'none' && (
          <span className="text-muted-foreground ml-1">+{fmt(finishCost)}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        {item.doors > 0 && (
          <button
            onClick={() => onSetGlassDoors(sc.model, !hasGlass)}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-lg transition-all min-h-[36px] sm:min-h-0 ${
              hasGlass ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <GlassWater size={12} />
            Glass Doors
            {hasGlass && <span className="font-semibold">+{fmt(GLASS_DOOR_COST * item.doors * qty)}</span>}

          </button>
        )}
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-muted-foreground" />
          <span className="text-muted-foreground">Pull-Out Shelves:</span>
          {shelfCount > 0 && (
            <button onClick={() => onSetPullOutShelves(sc.model, shelfCount - 1)} className="w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded border border-border hover:bg-accent active:scale-95">
              <Minus size={12} className="text-muted-foreground" />
            </button>
          )}
          <span className={`w-4 text-center font-semibold ${shelfCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{shelfCount}</span>
          <button onClick={() => onSetPullOutShelves(sc.model, shelfCount + 1)} className="w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95">
            <Plus size={12} />
          </button>
          {shelfCount > 0 && <span className="text-muted-foreground ml-1">+{fmt(PULL_OUT_SHELF_COST * shelfCount * qty)}</span>}
        </div>
      </div>
    </div>
  );
};

export default CabinetCard;
