import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  num: number;
  label: string;
}

const steps: Step[] = [
  { num: 1, label: 'Upload' },
  { num: 2, label: 'Style' },
  { num: 3, label: 'Cabinets' },
  { num: 4, label: 'Quote' },
  { num: 5, label: 'Order' },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-10 px-2 sm:px-4">
      {steps.map((s, idx) => (
        <React.Fragment key={s.num}>
          <button
            type="button"
            onClick={() => onStepClick?.(s.num)}
            disabled={!onStepClick}
            className="flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer disabled:cursor-default"
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-500 ${
                currentStep > s.num
                  ? 'bg-primary text-primary-foreground group-hover:opacity-80'
                  : currentStep === s.num
                  ? 'bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--accent))]'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {currentStep > s.num ? <Check size={14} strokeWidth={3} /> : s.num}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium transition-colors ${
              currentStep >= s.num ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {s.label}
            </span>
          </button>
          {idx < steps.length - 1 && (
            <div className={`w-6 sm:w-16 h-0.5 rounded-full mb-5 sm:mb-6 transition-colors duration-500 ${
              currentStep > s.num ? 'bg-primary' : 'bg-border'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;