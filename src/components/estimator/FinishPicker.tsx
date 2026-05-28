import React, { useState, useMemo, useEffect } from 'react';
import { Check, Search, AlertTriangle, Wand2 } from 'lucide-react';
import {
  DOOR_STYLES,
  FINISHES,
  FINISH_CATEGORIES,
  FINISH_CATEGORY_LABELS,
  getDoorStyleById,
  type FinishCategory,
} from '@/lib/estimator/finishes-data';
import {
  isFinishAllowedForDoor,
  checkCompatibility,
  allowedDoorStylesForFinish,
  getFinishTier,
  getTierLabel,
  getTierIncompatibilityReason,
} from '@/lib/estimator/compatibility';
import { logValidationFailure } from '@/services/validationFailuresService';


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
  const [query, setQuery] = useState('');

  const selectedFinishObj = useMemo(() => FINISHES.find(f => f.id === selectedFinish), [selectedFinish]);

  // Log incompatible combinations the user actually lands on (dedup per session).
  useEffect(() => {
    if (selectedDoorStyle && selectedFinish) {
      void logValidationFailure(selectedDoorStyle, selectedFinish);
    }
  }, [selectedDoorStyle, selectedFinish]);


  const visibleFinishes = useMemo(() => {
    const base = FINISHES.filter(f => f.category === activeCategory);
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.codes?.some(c => c.toLowerCase().includes(q)) ||
      f.finishTexture?.toLowerCase().includes(q)
    );
  }, [activeCategory, query]);

  const isSupplierTab = activeCategory !== 'painted' && activeCategory !== 'wood';

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
        <div className="flex items-center justify-between mb-2 gap-2">
          <p className="text-sm font-semibold text-foreground">Finish & Color *</p>
          {selectedFinishObj && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              {selectedFinishObj.thumb ? (
                <img
                  src={selectedFinishObj.thumb}
                  alt=""
                  className="w-4 h-4 rounded-full border border-border object-cover shrink-0"
                  loading="lazy"
                />
              ) : (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border inline-block shrink-0"
                  style={{ background: selectedFinishObj.hex }}
                />
              )}
              <span className="truncate">
                {selectedFinishObj.brand ? `${selectedFinishObj.brand} — ` : ''}{selectedFinishObj.name}
              </span>
            </span>
          )}
        </div>

        {/* Category tabs (auto-includes every supplier from data/finishes) */}
        <div className="flex border-b border-border mb-3 overflow-x-auto no-scrollbar">
          {FINISH_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); setQuery(''); }}
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

        {/* Search (helpful for big supplier catalogs like Tafisa = 117 panels) */}
        {isSupplierTab && (
          <div className="relative mb-3">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeCategory} (name, code, finish)…`}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
          </div>
        )}

        {/* Swatch grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[420px] overflow-y-auto pr-1">
          {visibleFinishes.map(finish => {
            const isSelected = selectedFinish === finish.id;
            const isLight = isLightColor(finish.hex);
            const allowed = isFinishAllowedForDoor(finish, selectedDoorStyle);

            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => allowed && onFinishChange(finish.id)}
                disabled={!allowed}
                title={
                  allowed
                    ? [finish.brand, finish.name, ...(finish.codes ?? [])].filter(Boolean).join(' — ')
                    : `${getTierLabel(getFinishTier(finish))} — only available as ${allowedDoorStylesForFinish(finish.id).map(d => getDoorStyleById(d)?.name ?? d).join(', ')}. Change door style to enable.`
                }
                className={`group flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all ${
                  !allowed
                    ? 'opacity-40 cursor-not-allowed'
                    : `active:scale-95 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-accent/50'}`
                }`}
              >
                <div
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary' : 'border-border group-hover:border-primary/40'
                  } ${finish.id === 'custom-paint' ? 'border-dashed' : ''}`}
                  style={!finish.thumb ? { background: finish.hex } : undefined}
                >
                  {finish.thumb && (
                    <img
                      src={finish.thumb}
                      alt={finish.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isSelected && (
                    <div className={`absolute inset-0 flex items-center justify-center ${finish.thumb ? 'bg-black/30' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isLight && !finish.thumb ? 'bg-black/20' : 'bg-white/80'}`}>
                        <Check size={11} strokeWidth={3} className={isLight && !finish.thumb ? 'text-black/70' : 'text-primary'} />
                      </div>
                    </div>
                  )}
                  {finish.popular && !isSelected && allowed && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                  )}
                  {!allowed && (
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                      <div className="w-0.5 h-12 bg-destructive/70 rotate-45 rounded-full" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 w-full">
                  {finish.name}
                </span>
              </button>
            );
          })}
          {visibleFinishes.length === 0 && (
            <p className="col-span-full text-xs text-muted-foreground text-center py-6">
              No finishes match “{query}”.
            </p>
          )}
        </div>

        {/* Selected finish detail */}
        {selectedFinishObj && (selectedFinishObj.codes?.length || selectedFinishObj.finishTexture || selectedFinishObj.note) && (
          <div className="text-xs text-muted-foreground mt-2 bg-accent/60 rounded-lg px-3 py-2 space-y-0.5">
            {selectedFinishObj.finishTexture && <p><span className="font-medium text-foreground">Finish:</span> {selectedFinishObj.finishTexture}</p>}
            {selectedFinishObj.codes && selectedFinishObj.codes.length > 0 && (
              <p><span className="font-medium text-foreground">Codes:</span> {selectedFinishObj.codes.join(' · ')}</p>
            )}
            {selectedFinishObj.note && <p>{selectedFinishObj.note}</p>}
          </div>
        )}

        {(() => {
          const compat = checkCompatibility(selectedDoorStyle, selectedFinish);
          if (compat.ok || !compat.reason) return null;
          const allowed = allowedDoorStylesForFinish(selectedFinish);
          const allowedNames = allowed.map(id => getDoorStyleById(id)?.name ?? id);
          const currentDoorName = getDoorStyleById(selectedDoorStyle)?.name ?? selectedDoorStyle;
          const finishObj = FINISHES.find(f => f.id === selectedFinish);
          const tier = finishObj ? getFinishTier(finishObj) : compat.tier;
          const tierLabel = tier ? getTierLabel(tier) : '';
          const whyCopy = tier ? getTierIncompatibilityReason(tier) : compat.reason;
          const finishLabel = finishObj
            ? (finishObj.brand ? `${finishObj.brand} — ${finishObj.name}` : finishObj.name)
            : 'This finish';

          // Suggest a closely-related compatible finish (same category, current door allowed).
          const alt = FINISHES.find(f =>
            f.id !== selectedFinish &&
            f.category === finishObj?.category &&
            isFinishAllowedForDoor(f, selectedDoorStyle),
          ) ?? FINISHES.find(f =>
            f.category === 'painted' && isFinishAllowedForDoor(f, selectedDoorStyle),
          );

          return (
            <div
              role="alert"
              aria-live="polite"
              className="mt-3 flex gap-2.5 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-3 py-2.5"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" aria-hidden />
              <div className="space-y-1.5 min-w-0 flex-1">
                <p className="font-semibold leading-snug">
                  {finishLabel} isn't compatible with {currentDoorName} doors.
                </p>
                <p className="text-destructive/90 leading-snug">
                  <span className="font-medium">Why:</span> {whyCopy}
                  {tierLabel && <span className="opacity-70"> ({tierLabel})</span>}
                </p>
                <p className="text-destructive/90 leading-snug">
                  <span className="font-medium">Fix:</span> switch the door style to{' '}
                  {allowedNames.map((name, i) => (
                    <React.Fragment key={allowed[i]}>
                      {i > 0 && (i === allowedNames.length - 1 ? ' or ' : ', ')}
                      <button
                        type="button"
                        onClick={() => onDoorStyleChange(allowed[i])}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
                      >
                        <Wand2 size={11} aria-hidden /> {name}
                      </button>
                    </React.Fragment>
                  ))}
                  {alt && (
                    <>
                      {' '}— or keep {currentDoorName} and use{' '}
                      <button
                        type="button"
                        onClick={() => onFinishChange(alt.id)}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
                      >
                        <Wand2 size={11} aria-hidden />
                        {alt.brand ? `${alt.brand} — ${alt.name}` : alt.name}
                      </button>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })()}


        {errorFinish && <p className="text-xs text-destructive mt-2">{errorFinish}</p>}

        <p className="text-xs text-muted-foreground mt-2">
          Green dot = popular · Dashed border = custom · Supplier panels show real swatches
        </p>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
