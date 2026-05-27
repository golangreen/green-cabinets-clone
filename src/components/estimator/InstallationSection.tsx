import React from 'react';
import { Wrench, BarChart3 } from 'lucide-react';
import type { InstallationConfig } from '@/lib/estimator/types';
import { INSTALLATION_COMPLEXITY } from '@/lib/estimator/pricing';

interface InstallationSectionProps {
  installation: InstallationConfig;
  setInstallation: (i: InstallationConfig) => void;
}

const InstallationSection: React.FC<InstallationSectionProps> = ({ installation, setInstallation }) => {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wrench size={16} className="text-primary" />
          Installation
        </div>
        <button
          onClick={() => setInstallation({ ...installation, enabled: !installation.enabled })}
          className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
            installation.enabled ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {installation.enabled ? 'Included' : 'Not included'}
        </button>
      </div>

      {installation.enabled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rate per cabinet:</span>
            <input type="number" value={installation.ratePerCabinet} onChange={(e) => setInstallation({ ...installation, ratePerCabinet: Number(e.target.value) })} className="w-24 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 size={12} /> Complexity:</span>
            <div className="grid grid-cols-3 gap-2">
              {INSTALLATION_COMPLEXITY.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setInstallation({ ...installation, complexityMultiplier: level.id })}
                  className={`text-left p-2.5 rounded-xl border-2 transition-all ${
                    installation.complexityMultiplier === level.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-xs font-semibold text-foreground">{level.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{level.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationSection;
