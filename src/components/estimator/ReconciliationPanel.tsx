import React, { useState } from 'react';
import { cabinetLookup } from '@/lib/catalog-data';
import type { ReconciliationData } from '@/lib/types';
import type { SelectedCabinet } from '@/lib/types';
import { Check, AlertTriangle, ArrowRight } from 'lucide-react';

interface ReconciliationPanelProps {
  data: ReconciliationData;
  onApply: (resolvedQtys: Record<string, number>) => void;
  onDismiss: () => void;
}

const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({ data, onApply, onDismiss }) => {
  // Initialize resolved quantities: start with max qty for each model
  const [resolved, setResolved] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const [model, entry] of data.allModels) {
      init[model] = entry.maxQty;
    }
    return init;
  });

  const sourceNames = data.sources.map(s => s.source);
  const hasConflicts = data.conflicts.length > 0;

  const handleApply = () => {
    onApply(resolved);
  };

  // Sort: conflicts first, then alphabetical
  const sortedModels = Array.from(data.allModels.entries()).sort(([aModel], [bModel]) => {
    const aConflict = data.conflicts.includes(aModel);
    const bConflict = data.conflicts.includes(bModel);
    if (aConflict && !bConflict) return -1;
    if (!aConflict && bConflict) return 1;
    return aModel.localeCompare(bModel);
  });

  const totalSkipped = data.sources.reduce((s, src) => s + src.skipped.length, 0);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {hasConflicts ? (
              <AlertTriangle size={18} className="text-warning" />
            ) : (
              <Check size={18} className="text-success" />
            )}
            Cross-Reference Results
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {hasConflicts
              ? `${data.conflicts.length} model(s) have different quantities across sources — review below`
              : `${data.allModels.size} models matched across ${data.sources.length} sources — no conflicts`}
          </p>
        </div>
      </div>

      {/* Summary cards per source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.sources.map((src, idx) => (
          <div key={idx} className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${
                src.category === 'blueprint' ? 'bg-info' : src.category === 'elevation' ? 'bg-primary' : 'bg-warning'
              }`} />
              <span className="text-xs font-semibold text-foreground truncate">{src.source}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {src.cabinets.length} model{src.cabinets.length !== 1 ? 's' : ''} detected
              {src.skipped.length > 0 && ` · ${src.skipped.length} unmatched`}
            </p>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-3 py-2 font-semibold text-foreground">Model</th>
                {sourceNames.map((name, i) => (
                  <th key={i} className="text-center px-3 py-2 font-semibold text-foreground text-xs max-w-[120px] truncate" title={name}>
                    {name.length > 20 ? name.substring(0, 18) + '…' : name}
                  </th>
                ))}
                <th className="text-center px-3 py-2 font-semibold text-foreground">
                  <ArrowRight size={14} className="inline" /> Use
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map(([model, entry]) => {
                const isConflict = data.conflicts.includes(model);
                const info = cabinetLookup[model];
                return (
                  <tr
                    key={model}
                    className={isConflict ? 'bg-warning-soft' : 'hover:bg-muted/50'}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono font-medium text-foreground">{model}</span>
                      {info && <span className="text-muted-foreground text-xs ml-1.5 hidden sm:inline">· ${info.price}</span>}
                      {isConflict && <AlertTriangle size={12} className="text-warning inline ml-1" />}
                    </td>
                    {data.sources.map((src, i) => {
                      const qty = entry.bySource[src.source] || 0;
                      return (
                        <td key={i} className="text-center px-3 py-2">
                          {qty > 0 ? (
                            <span className={`text-sm font-medium ${isConflict ? 'text-warning' : 'text-foreground'}`}>
                              {qty}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center px-3 py-2">
                      {isConflict ? (
                        <input
                          type="number"
                          min={0}
                          value={resolved[model] || 0}
                          onChange={e => setResolved(prev => ({ ...prev, [model]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-14 text-center font-medium text-foreground bg-background border border-warning rounded-lg px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-warning"
                        />
                      ) : (
                        <span className="font-medium text-success">{resolved[model]}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skipped items */}
      {totalSkipped > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
          <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {totalSkipped} Unmatched Item{totalSkipped > 1 ? 's' : ''} (not in catalog)
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.sources.flatMap(src =>
              src.skipped.map((s, i) => (
                <span key={`${src.source}-${s.model}-${i}`} className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full">
                  {s.model} ×{s.qty}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDismiss}
          className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Check size={16} />
          Apply {Object.values(resolved).filter(q => q > 0).length} Models
        </button>
      </div>
    </div>
  );
};

export default ReconciliationPanel;
