import React from 'react';
import { Layers, Check, AlertCircle } from 'lucide-react';
import { pricingData } from '@/lib/pricing';

interface LocationStepProps {
  location: string;
  setLocation: (loc: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkipToManual: () => void;
  analyzing: boolean;
  error?: string | null;
}

const LocationStep: React.FC<LocationStepProps> = ({ location, setLocation, onBack, onNext, onSkipToManual, analyzing, error }) => {
  if (analyzing) {
    return (
      <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Blueprint…</h2>
        <p className="text-muted-foreground">AI is extracting measurements and identifying cabinetry needs</p>
      </div>
    );
  }

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
          .map(([key, data]) => (
          <button
            key={key}
            onClick={() => setLocation(key)}
            className={`p-5 border-2 rounded-2xl text-left transition-all duration-200 ${
              location === key
                ? 'border-primary bg-accent'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{data.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {data.description}
                </p>
              </div>
              {location === key && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                </div>
              )}
            </div>
          </button>
        ))}
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
