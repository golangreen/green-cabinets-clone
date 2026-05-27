import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  DOOR_STYLES,
  FINISHES,
  FINISH_CATEGORIES,
  FINISH_CATEGORY_LABELS,
  type FinishCategory,
} from '@/lib/estimator/finishes-data';

interface FinishPickerProps {
  selectedDoorStyle: string;
  selectedFinish: string;
  onDoorStyleChange: (id: string) => void;
  onFinishChange: (id: string) => void;
  errorFinish?: string;
  errorDoorStyle?: string;
}

export default function FinishPicker({
  selectedDoorStyle,
  selectedFinish,
  onDoorStyleChange,
  onFinishChange,
  errorFinish,
  errorDoorStyle,
}: FinishPickerProps) {
  const [activeCategory, setActiveCategory] = useState<FinishCategory>('painted');

  const visibleFinishes = FINISHES.filter(f => f.category === activeCategory);
  const selectedFinishObj = FINISHES.find(f => f.id === selectedFinish);

  return (
    <div className="space-y-5">

      {/* Door Style */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">Door Style *</p>
        <div className="grid grid-cols-2 gap-2">
          {DOOR_STYLES.map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => onDoorStyleChange(style.id)}
              className={`text-left p-3 rounded-xl border transition-all active:scale-[0.98] ${
                selectedDoorStyle === style.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/40 hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground leading-tight">{style.name}</span>
                {selectedDoorStyle === style.id && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={3} className="text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{style.description}</p>
            </button>
          ))}
        </div>
        {errorDoorStyle && <p className="text-xs text-destructive mt-1">{errorDoorStyle}</p>}
      </div>

      {/* Finish / Color */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Finish & Color *</p>
          {selectedFinishObj && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="w-3.5 h-3.5 rounded-full border border-border inline-block shrink-0"
                style={{ background: selectedFinishObj.hex }}
              />
              {selectedFinishObj.brand ? `${selectedFinishObj.brand} — ` : ''}{selectedFinishObj.name}
            </span>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-border mb-3 overflow-x-auto no-scrollbar">
          {FINISH_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {FINISH_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Swatch grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {visibleFinishes.map(finish => {
            const isSelected = selectedFinish === finish.id;
            const isLight = isLightColor(finish.hex);

            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => onFinishChange(finish.id)}
                title={finish.brand ? `${finish.brand} — ${finish.name}` : finish.name}
                className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all active:scale-95 ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-accent/50'
                }`}
              >
                {/* Swatch circle */}
                <div
                  className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary' : 'border-border group-hover:border-primary/40'
                  } ${finish.id === 'custom-paint' ? 'border-dashed' : ''}`}
                  style={{ background: finish.hex }}
                >
                  {isSelected && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isLight ? 'bg-black/20' : 'bg-white/30'}`}>
                      <Check size={11} strokeWidth={3} className={isLight ? 'text-black/70' : 'text-white'} />
                    </div>
                  )}
                  {finish.popular && !isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>
                {/* Label */}
                <span className="text-[10px] text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 w-full">
                  {finish.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected finish note */}
        {selectedFinishObj?.note && (
          <p className="text-xs text-muted-foreground mt-2 bg-accent/60 rounded-lg px-3 py-1.5">
            Note: {selectedFinishObj.note}
          </p>
        )}

        {errorFinish && <p className="text-xs text-destructive mt-2">{errorFinish}</p>}

        <p className="text-xs text-muted-foreground mt-2">
          Green dot = popular choice · Dashed border = custom option
        </p>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
