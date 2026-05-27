import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, ClipboardPaste, Loader2, X, CheckCircle2, AlertTriangle, ArrowLeftRight, Minus, Plus, Merge, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { SelectedCabinet } from '@/lib/estimator/types';
import { cabinetLookup } from '@/lib/estimator/catalog-data';
import { supabase } from '@/integrations/supabase/client';
import { fileToBase64 } from '@/lib/estimator/utils';

interface InvoiceComparisonPanelProps {
  selectedCabinets: SelectedCabinet[];
  onClose: () => void;
  onApplyInvoice: (items: SelectedCabinet[]) => void;
}

type ComparisonRow = {
  model: string;
  blueprintQty: number;
  invoiceQty: number;
  status: 'match' | 'qty-diff' | 'blueprint-only' | 'invoice-only';
};

type PickedSource = 'blueprint' | 'invoice';

const InvoiceComparisonPanel: React.FC<InvoiceComparisonPanelProps> = ({ selectedCabinets, onClose, onApplyInvoice }) => {
  const [importing, setImporting] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [comparison, setComparison] = useState<ComparisonRow[] | null>(null);
  const [invoiceSkipped, setInvoiceSkipped] = useState<{ model: string; qty: number }[]>([]);
  const [pickedSources, setPickedSources] = useState<Record<string, PickedSource>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const buildComparison = (invoiceItems: { model: string; qty: number }[]) => {
    const blueprintMap = new Map<string, number>();
    selectedCabinets.forEach(c => blueprintMap.set(c.model, c.qty));

    const invoiceMap = new Map<string, number>();
    invoiceItems.forEach(i => invoiceMap.set(i.model, i.qty));

    const allModels = new Set([...blueprintMap.keys(), ...invoiceMap.keys()]);
    const rows: ComparisonRow[] = [];

    allModels.forEach(model => {
      const bQty = blueprintMap.get(model) || 0;
      const iQty = invoiceMap.get(model) || 0;

      let status: ComparisonRow['status'];
      if (bQty === iQty) status = 'match';
      else if (bQty > 0 && iQty === 0) status = 'blueprint-only';
      else if (bQty === 0 && iQty > 0) status = 'invoice-only';
      else status = 'qty-diff';

      rows.push({ model, blueprintQty: bQty, invoiceQty: iQty, status });
    });

    rows.sort((a, b) => {
      const order = { 'qty-diff': 0, 'blueprint-only': 1, 'invoice-only': 2, 'match': 3 };
      return order[a.status] - order[b.status];
    });

    // Auto-set default picks: match→blueprint, blueprint-only→blueprint, invoice-only→invoice, qty-diff→invoice
    const defaults: Record<string, PickedSource> = {};
    rows.forEach(r => {
      if (r.status === 'match' || r.status === 'blueprint-only') defaults[r.model] = 'blueprint';
      else defaults[r.model] = 'invoice';
    });
    setPickedSources(defaults);

    return rows;
  };

  const handleImport = async (source: 'file' | 'text') => {
    setImporting(true);
    try {
      let body: any = {};

      if (source === 'file' && importFiles.length > 0) {
        const imageFiles = importFiles.filter(f =>
          f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)
        );
        const textFiles = importFiles.filter(f => !imageFiles.includes(f));

        if (imageFiles.length > 0) {
          const images = await Promise.all(
            imageFiles.map(async f => ({
              base64: await fileToBase64(f),
              mimeType: f.type || 'image/png',
            }))
          );
          body = { images };
        }

        if (textFiles.length > 0) {
          const texts = await Promise.all(textFiles.map(f => f.text()));
          body.textContent = (body.textContent || '') + texts.join('\n');
        }
      } else if (source === 'text') {
        if (!pasteText.trim()) {
          toast.error('Paste the invoice content first');
          setImporting(false);
          return;
        }
        body = { textContent: pasteText.trim() };
      }

      const { data, error } = await supabase.functions.invoke('parse-cabinet-list', { body });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const items = data?.items || [];
      const skipped = data?.skipped || [];

      if (items.length === 0) {
        toast.warning('No matching cabinets found in the invoice');
        return;
      }

      const rows = buildComparison(items);
      setComparison(rows);
      setInvoiceSkipped(skipped);

      const matches = rows.filter(r => r.status === 'match').length;
      const diffs = rows.filter(r => r.status !== 'match').length;
      toast.success(`${matches} match${matches !== 1 ? 'es' : ''}, ${diffs} difference${diffs !== 1 ? 's' : ''}`);
    } catch (err: any) {
      console.error('Invoice comparison error:', err);
      toast.error(err?.message || 'Failed to parse invoice');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setImportFiles(prev => [...prev, ...files]);
  };

  const toggleSource = (model: string) => {
    setPickedSources(prev => ({
      ...prev,
      [model]: prev[model] === 'blueprint' ? 'invoice' : 'blueprint',
    }));
  };

  const handleApplySelection = () => {
    if (!comparison) return;
    const result: SelectedCabinet[] = comparison
      .map(r => {
        const src = pickedSources[r.model] || 'blueprint';
        const qty = src === 'blueprint' ? r.blueprintQty : r.invoiceQty;
        return { model: r.model, qty, finishSide: 'none' as const };
      })
      .filter(r => r.qty > 0);
    onApplyInvoice(result);
    toast.success('Applied custom selection');
    onClose();
  };

  const handleSelectAll = (source: PickedSource) => {
    if (!comparison) return;
    const updated: Record<string, PickedSource> = {};
    comparison.forEach(r => { updated[r.model] = source; });
    setPickedSources(updated);
  };

  const resolvedTotal = useMemo(() => {
    if (!comparison) return 0;
    return comparison.reduce((sum, r) => {
      const src = pickedSources[r.model] || 'blueprint';
      const qty = src === 'blueprint' ? r.blueprintQty : r.invoiceQty;
      const info = cabinetLookup[r.model];
      return sum + (info ? info.price * qty : 0);
    }, 0);
  }, [comparison, pickedSources]);

  const statusBadge = (status: ComparisonRow['status']) => {
    switch (status) {
      case 'match':
        return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-success/10 text-success"><CheckCircle2 size={10} /> Match</span>;
      case 'qty-diff':
        return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-warning/10 text-warning"><ArrowLeftRight size={10} /> Qty Diff</span>;
      case 'blueprint-only':
        return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-info/10 text-info"><Minus size={10} /> Blueprint</span>;
      case 'invoice-only':
        return <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"><Plus size={10} /> Invoice</span>;
    }
  };

  const matchCount = comparison?.filter(r => r.status === 'match').length || 0;
  const diffCount = comparison ? comparison.length - matchCount : 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ArrowLeftRight size={16} className="text-primary" />
          Compare with Vendor Invoice
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      {!comparison ? (
        <div className="space-y-4">
          {/* File upload */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              importFiles.length > 0 ? 'border-primary bg-accent' : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.txt"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) setImportFiles(prev => [...prev, ...files]);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="hidden"
            />
            {importFiles.length > 0 ? (
              <div className="space-y-1">
                <FileText className="text-primary mx-auto" size={20} />
                <p className="text-sm font-medium text-foreground">{importFiles.length} file{importFiles.length > 1 ? 's' : ''}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="text-muted-foreground mx-auto" size={20} />
                <p className="text-sm font-medium text-foreground">Drop vendor invoice</p>
                <p className="text-xs text-muted-foreground">PDF, image, or text file</p>
              </div>
            )}
          </div>

          {importFiles.length > 0 && (
            <>
              <div className="space-y-1">
                {importFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText size={12} className="text-primary shrink-0" />
                      <span className="text-foreground truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setImportFiles(prev => prev.filter((_, i) => i !== idx)); }}
                      className="text-destructive hover:bg-destructive/10 rounded p-0.5 transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleImport('file')}
                disabled={importing}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {importing ? <><Loader2 size={14} className="animate-spin" /> Comparing…</> : 'Compare with Blueprint'}
              </button>
            </>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or paste invoice text</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste vendor invoice content here…"
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <button
            onClick={() => handleImport('text')}
            disabled={importing || !pasteText.trim()}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {importing ? <><Loader2 size={14} className="animate-spin" /> Comparing…</> : <><ClipboardPaste size={14} /> Compare from Text</>}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex gap-2">
            <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-success">{matchCount}</p>
              <p className="text-xs text-muted-foreground">Match</p>
            </div>
            <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-warning">{diffCount}</p>
              <p className="text-xs text-muted-foreground">Differences</p>
            </div>
          </div>

          {/* Bulk select buttons */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Select all from:</span>
            <button
              onClick={() => handleSelectAll('blueprint')}
              className="px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors font-medium"
            >
              Blueprint
            </button>
            <button
              onClick={() => handleSelectAll('invoice')}
              className="px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors font-medium"
            >
              Invoice
            </button>
          </div>

          {/* Comparison table with per-row toggles */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-xs font-semibold text-muted-foreground bg-secondary/50 px-3 py-2">
              <span>Model</span>
              <span className="w-16 text-center">Blueprint</span>
              <span className="w-16 text-center">Invoice</span>
              <span className="w-20 text-center">Use</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {comparison.map(row => {
                const info = cabinetLookup[row.model];
                const picked = pickedSources[row.model] || 'blueprint';
                const isMatch = row.status === 'match';
                const pickedQty = picked === 'blueprint' ? row.blueprintQty : row.invoiceQty;

                return (
                  <div
                    key={row.model}
                    className={`grid grid-cols-[1fr_auto_auto_auto] gap-0 px-3 py-2 items-center text-sm ${
                      row.status !== 'match' ? 'bg-accent/30' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-medium text-foreground">{row.model}</span>
                      {info && <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">· ${info.price}</span>}
                    </div>

                    {/* Blueprint qty — clickable when there's a difference */}
                    <button
                      onClick={() => !isMatch && row.blueprintQty > 0 && toggleSource(row.model)}
                      disabled={isMatch || row.blueprintQty === 0}
                      className={`w-16 text-center font-medium py-1 rounded-md transition-all ${
                        row.blueprintQty === 0
                          ? 'text-muted-foreground/30 cursor-default'
                          : picked === 'blueprint' && !isMatch
                            ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                            : isMatch
                              ? 'text-foreground cursor-default'
                              : 'text-muted-foreground hover:bg-accent cursor-pointer'
                      }`}
                    >
                      {row.blueprintQty || '—'}
                    </button>

                    {/* Invoice qty — clickable when there's a difference */}
                    <button
                      onClick={() => !isMatch && row.invoiceQty > 0 && toggleSource(row.model)}
                      disabled={isMatch || row.invoiceQty === 0}
                      className={`w-16 text-center font-medium py-1 rounded-md transition-all ${
                        row.invoiceQty === 0
                          ? 'text-muted-foreground/30 cursor-default'
                          : picked === 'invoice' && !isMatch
                            ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                            : isMatch
                              ? 'text-foreground cursor-default'
                              : 'text-muted-foreground hover:bg-accent cursor-pointer'
                      }`}
                    >
                      {row.invoiceQty || '—'}
                    </button>

                    {/* Resolved qty indicator */}
                    <div className="w-20 flex justify-center">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 size={10} /> {pickedQty}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                          <Check size={10} /> {pickedQty}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skipped items from invoice */}
          {invoiceSkipped.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1.5">
              <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle size={12} />
                {invoiceSkipped.length} Unmatched Invoice Item{invoiceSkipped.length > 1 ? 's' : ''}
              </h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {invoiceSkipped.map((item, idx) => (
                  <div key={`${item.model}-${idx}`} className="flex justify-between text-xs bg-background rounded-lg px-2.5 py-1.5">
                    <span className="font-mono font-medium text-foreground">{item.model}</span>
                    <span className="text-muted-foreground">×{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B33 substitution note */}
          {comparison.some(r => r.model === 'B33') && (
            <div className="bg-accent border border-border rounded-xl p-3 flex gap-2 items-start">
              <Info size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">B33 substitution:</span> A single 33″ base cabinet (B33) is sometimes used by vendors as a substitute for an B18 + B21 combination to reduce seam count and simplify installation.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleApplySelection}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Check size={14} /> Apply Selection · ${resolvedTotal.toLocaleString()}
            </button>
            <button
              onClick={() => { setComparison(null); setImportFiles([]); setPasteText(''); setInvoiceSkipped([]); setPickedSources({}); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
            >
              New Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceComparisonPanel;
