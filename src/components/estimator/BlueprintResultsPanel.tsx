import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, ImageIcon } from 'lucide-react';
import type { ReconciliationData, CabinetPosition, SourceResult } from '@/lib/estimator/types';
import { cabinetLookup } from '@/lib/estimator/catalog-data';
import { Image as ImageLucide } from 'lucide-react';
import WallTally from './WallTally';

type MarkerStatus = 'matched' | 'fuzzy' | 'custom' | 'unmatched';

interface ListItem {
  model: string;
  qty: number;
  status: MarkerStatus;
  description?: string;
  fuzzyOriginal?: string;
  fuzzyReason?: string;
  customPricePerUnit?: number;
  customPriceFormula?: string;
}

const statusConfig = {
  matched: {
    emoji: '✅',
    row: 'bg-emerald-500/8 border border-emerald-500/15',
  },
  fuzzy: {
    emoji: '⚠️',
    row: 'bg-amber-500/8 border border-amber-500/15',
  },
  custom: {
    emoji: '✦',
    row: 'bg-orange-500/8 border border-orange-500/20',
  },
  unmatched: {
    emoji: '❌',
    row: 'bg-destructive/5 border border-destructive/15 border-dashed',
  },
};

/* ── Simple cabinet list for a source ── */
const CabinetList: React.FC<{
  cabinets: CabinetPosition[];
  fuzzyMatched: CabinetPosition[];
  customPriced: CabinetPosition[];
  skipped: CabinetPosition[];
  onAddCustomItem?: (description: string, qty: number, unitPrice?: number) => void;
  addedCustomModels: Set<string>;
}> = ({ cabinets, fuzzyMatched, customPriced, skipped, onAddCustomItem, addedCustomModels }) => {
  const items: ListItem[] = [
    ...cabinets.map(c => ({
      model: c.model, qty: c.qty, status: 'matched' as MarkerStatus,
      description: cabinetLookup[c.model]?.description || c.note,
    })),
    ...fuzzyMatched.map(c => ({
      model: c.model, qty: c.qty, status: 'fuzzy' as MarkerStatus,
      description: cabinetLookup[c.model]?.description || c.note,
      fuzzyOriginal: c.fuzzyOriginal, fuzzyReason: c.fuzzyReason,
    })),
    ...customPriced.map(c => ({
      model: c.model, qty: c.qty, status: 'custom' as MarkerStatus,
      description: c.note || c.model,
      customPricePerUnit: c.customPricePerUnit,
      customPriceFormula: c.customPriceFormula,
    })),
    ...skipped.map(c => ({
      model: c.model, qty: c.qty, status: 'unmatched' as MarkerStatus,
      description: c.note,
    })),
  ];

  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="p-3 space-y-1.5">
      <p className="text-xs text-muted-foreground mb-2">{items.length} models · {totalQty} total cabinets</p>
      {items.map((item, i) => {
        const cfg = statusConfig[item.status];
        const alreadyAdded = addedCustomModels.has(item.model);
        return (
          <div key={`${item.model}-${i}`} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${cfg.row}`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0">{cfg.emoji}</span>
              <span className="font-semibold text-foreground">{item.model}</span>
              <span className="text-muted-foreground">×{item.qty}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">— {item.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.fuzzyOriginal && (
                <span className="text-[10px] text-amber-600">was {item.fuzzyOriginal}</span>
              )}
              {item.status === 'custom' && item.customPricePerUnit != null && (
                <span className="text-[10px] text-orange-600 font-medium">${item.customPricePerUnit.toLocaleString()} est.*</span>
              )}
              {item.status === 'unmatched' && onAddCustomItem && (
                <button
                  onClick={() => onAddCustomItem(item.model, item.qty)}
                  disabled={alreadyAdded}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:opacity-50 transition-colors"
                >
                  {alreadyAdded ? '✅ Added' : <><Plus size={12} /> Add</>}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Source card ── */
const SourceCard: React.FC<{
  source: SourceResult;
  previewUrl?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAddCustomItem?: (description: string, qty: number, unitPrice?: number) => void;
  addedCustomModels: Set<string>;
}> = ({ source, previewUrl, isExpanded, onToggle, onAddCustomItem, addedCustomModels }) => {
  const matchedCount = source.cabinets.length;
  const fuzzyCount = source.fuzzyMatched.length;
  const customCount = (source.customPriced ?? []).length;
  const skippedCount = source.skipped.length;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left min-h-[48px]"
      >
        {previewUrl ? (
          <img src={previewUrl} alt={`Preview thumbnail for blueprint ${source.source}`} className="w-10 h-10 object-cover rounded-lg border border-border shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg border border-border bg-secondary flex items-center justify-center shrink-0">
            <ImageLucide size={16} className="text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{source.source}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-emerald-600">✅ {matchedCount}</span>
            {fuzzyCount > 0 && <span className="text-xs text-amber-600">⚠️ {fuzzyCount}</span>}
            {customCount > 0 && <span className="text-xs text-orange-600">✦ {customCount} custom</span>}
            {skippedCount > 0 && <span className="text-xs text-destructive">❌ {skippedCount}</span>}
          </div>
        </div>
        {isExpanded ? <ChevronDown size={16} className="text-muted-foreground shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {previewUrl && (
            <div className="bg-secondary/30 p-2">
              <img src={previewUrl} alt={`Full blueprint scan for ${source.source}`} className="w-full max-h-[300px] object-contain rounded-lg" />
            </div>
          )}
          <CabinetList
            cabinets={source.cabinets}
            fuzzyMatched={source.fuzzyMatched}
            customPriced={source.customPriced ?? []}
            skipped={source.skipped}
            onAddCustomItem={onAddCustomItem}
            addedCustomModels={addedCustomModels}
          />
          {source.wallCheck && source.wallCheck.length > 0 && (
            <WallTally rows={source.wallCheck} />
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main panel ── */
interface BlueprintResultsPanelProps {
  files: File[];
  reconciliation: ReconciliationData;
  onAddCustomItem?: (description: string, qty: number, unitPrice?: number) => void;
  addedCustomModels?: Set<string>;
}

const BlueprintResultsPanel: React.FC<BlueprintResultsPanelProps> = ({
  files, reconciliation, onAddCustomItem, addedCustomModels = new Set(),
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0]));
  const [previews, setPreviews] = useState<Record<number, string>>({});

  useEffect(() => {
    const urls: Record<number, string> = {};
    files.forEach((file, idx) => {
      if (file.type.startsWith('image/')) {
        urls[idx] = URL.createObjectURL(file);
      }
    });
    setPreviews(urls);
    return () => Object.values(urls).forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const toggleFile = (idx: number) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (reconciliation.sources.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <ImageLucide size={16} className="text-primary" />
        Extraction Results
      </h3>

      {reconciliation.sources.map((source, idx) => {
        const fileIdx = files.findIndex(f => source.source.includes(f.name));
        const previewUrl = fileIdx >= 0 ? previews[fileIdx] : undefined;
        return (
          <SourceCard
            key={idx}
            source={source}
            previewUrl={previewUrl}
            isExpanded={expandedFiles.has(idx)}
            onToggle={() => toggleFile(idx)}
            onAddCustomItem={onAddCustomItem}
            addedCustomModels={addedCustomModels}
          />
        );
      })}
    </div>
  );
};

export default BlueprintResultsPanel;
