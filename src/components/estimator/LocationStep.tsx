import React from 'react';
import { Layers, Check, AlertCircle } from 'lucide-react';
import { pricingData } from '@/lib/estimator/pricing';
import { PANELS_BY_BRAND } from '@/data/finishes';
import type { MaterialBrand } from '@/types/materials';

interface LocationStepProps {
  location: string;
  setLocation: (loc: string) => void;
  selectedFinish?: string;
  setSelectedFinish: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkipToManual: () => void;
  analyzing: boolean;
  error?: string | null;
}

const LocationStep: React.FC<LocationStepProps> = ({
  location, setLocation, selectedFinish, setSelectedFinish,
  onBack, onNext, onSkipToManual, analyzing, error,
}) => {
  if (analyzing) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Blueprint…</h2>
        <p className="text-muted-foreground">AI is extracting measurements and identifying cabinetry needs</p>
      </div>
    );
  }

  const selectedBrand = location ? pricingData[location]?.brand : undefined;
  const brandPanels = selectedBrand ? PANELS_BY_BRAND[selectedBrand as MaterialBrand] ?? [] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Analysis failed</p>
            <p className="opacity-80">{error}</p>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers size={24} className="text-primary" />
          Cabinet Style
        </h2>
        <p className="text-muted-foreground mt-1">Select the door style to calculate pricing</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(pricingData)
          .sort(([, a], [, b]) => a.multiplier - b.multiplier)
          .map(([key, data]) => {
          const isSelected = location === key;
          const panels = data.brand ? PANELS_BY_BRAND[data.brand as MaterialBrand] ?? [] : [];
          const showColorPicker = isSelected && panels.length > 0;
          return (
            <div key={key} className="space-y-2">
              <button
                onClick={() => {
                  setLocation(key);
                  // Reset finish when switching to a different brand/style
                  if (selectedFinish) {
                    const f = panels.find(p => p.id === selectedFinish);
                    if (!f) setSelectedFinish('');
                  }
                }}
                className={`w-full p-5 border-2 rounded-2xl text-left transition-all duration-200 ${
                  isSelected ? 'border-primary bg-accent' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{data.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{data.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>

              {showColorPicker && (
                <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {data.brand} color
                  </label>
                  <select
                    value={selectedFinish ?? ''}
                    onChange={(e) => setSelectedFinish(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a color…</option>
                    {panels.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.codes?.length ? ` (${p.codes[0]})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedFinish && (() => {
                    const f = panels.find(p => p.id === selectedFinish);
                    if (!f) return null;
                    return (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {f.thumb ? (
                          <img src={f.thumb} alt="" className="w-6 h-6 rounded-full border border-border object-cover" loading="lazy" />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-border" style={{ background: f.swatchHex ?? '#ccc' }} />
                        )}
                        <span className="truncate">{f.name}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-secondary text-secondary-foreground py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-80 transition-all min-h-[48px] active:scale-[0.98]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!location}
          className="flex-1 bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[48px] active:scale-[0.98]"
        >
          Analyze Blueprint
        </button>
      </div>

      <button
        onClick={onSkipToManual}
        disabled={!location}
        className="w-full text-sm text-muted-foreground hover:text-foreground font-medium py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
      >
        Skip AI — enter room details manually
      </button>
    </div>
  );
};

export default LocationStep;
