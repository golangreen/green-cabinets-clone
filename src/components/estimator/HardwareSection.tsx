import React from 'react';
import { DoorClosed } from 'lucide-react';
import type { SelectedCabinet, HardwareConfig, HardwareType } from '@/lib/estimator/types';
import { HARDWARE_COST } from '@/lib/estimator/pricing';
import { cabinetLookup } from '@/lib/estimator/catalog-data';

interface HardwareSectionProps {
  hardware: HardwareConfig;
  setHardware: (h: HardwareConfig) => void;
  selectedCabinets: SelectedCabinet[];
  totalHardwareCost: number;
}

const HardwareSection: React.FC<HardwareSectionProps> = ({ hardware, setHardware, selectedCabinets, totalHardwareCost }) => {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <DoorClosed size={16} className="text-primary" />
          Door/Drawer Hardware
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHardware({ ...hardware, applyAll: true })}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              hardware.applyAll ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            All cabinets
          </button>
          <button
            onClick={() => setHardware({ ...hardware, applyAll: false })}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
              !hardware.applyAll ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            Individual
          </button>
        </div>
      </div>

      {hardware.applyAll ? (
        <div className="grid grid-cols-4 gap-2">
          {([['none', 'None', '$0'], ['knob', 'Knob', '$8'], ['handle', 'Handle', '$10'], ['finger-pull', 'Finger Pull / Touch Latch', '$20']] as const).map(([key, label, price]) => (
            <button
              key={key}
              onClick={() => setHardware({ ...hardware, type: key })}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                hardware.type === key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
              }`}
            >
              <span className="text-xs font-semibold text-foreground block">{label}</span>
              <span className="text-xs text-muted-foreground">{price}/ea</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {selectedCabinets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Add cabinets first to configure individual hardware</p>
          )}
          {selectedCabinets.map((sc) => {
            const item = cabinetLookup[sc.model];
            if (!item) return null;
            const hwType = hardware.perCabinet[sc.model] || 'none';
            return (
              <div key={sc.model} className="flex items-center justify-between gap-2 p-2 bg-accent rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{sc.model}</span>
                  <span className="text-xs text-muted-foreground truncate">×{sc.qty}</span>
                </div>
                <div className="flex gap-1">
                  {([['none', 'None'], ['knob', 'Knob'], ['handle', 'Handle'], ['finger-pull', 'F.Pull']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setHardware({ ...hardware, perCabinet: { ...hardware.perCabinet, [sc.model]: key } })}
                      className={`text-xs px-2 py-0.5 rounded-md transition-all ${
                        hwType === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalHardwareCost > 0 && (
        <p className="text-xs text-muted-foreground">Hardware total: <span className="font-semibold text-foreground">${totalHardwareCost.toLocaleString()}</span></p>
      )}
    </div>
  );
};

export default HardwareSection;
