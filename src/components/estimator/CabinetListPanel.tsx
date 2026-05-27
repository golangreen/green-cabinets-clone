import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Plus, Minus, Trash2, Package, Upload, FileText, ClipboardPaste, Loader2, X, AlertTriangle, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import type { SelectedCabinet } from '@/lib/estimator/types';
import { cabinetCatalog, cabinetLookup } from '@/lib/estimator/catalog-data';
import { supabase } from '@/integrations/supabase/client';
import { fileToBase64 } from '@/lib/estimator/utils';

interface CabinetListPanelProps {
  selectedCabinets: SelectedCabinet[];
  setSelectedCabinets: React.Dispatch<React.SetStateAction<SelectedCabinet[]>>;
  onAddCustomItem?: (description: string, qty: number) => void;
}

type ImportMode = 'browse' | 'import';

const CabinetListPanel: React.FC<CabinetListPanelProps> = ({ selectedCabinets, setSelectedCabinets, onAddCustomItem }) => {
  const [search, setSearch] = useState(''); // kept for filtered categories
  const [mode, setMode] = useState<ImportMode>('browse');
  const [comboOpen, setComboOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [skippedItems, setSkippedItems] = useState<{ model: string; qty: number }[]>([]);
  const [allExtracted, setAllExtracted] = useState<{ model: string; qty: number; matched: boolean }[]>([]);
  const [addedAsCustom, setAddedAsCustom] = useState<Set<string>>(new Set());
  const importInputRef = useRef<HTMLInputElement>(null);

  const addCabinet = (model: string) => {
    setSelectedCabinets(prev => {
      const existing = prev.find(c => c.model === model);
      if (existing) {
        return prev.map(c => c.model === model ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { model, qty: 1, finishSide: 'none' as const }];
    });
  };

  const updateQty = (model: string, delta: number) => {
    setSelectedCabinets(prev =>
      prev.map(c => c.model === model ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0)
    );
  };

  const removeCabinet = (model: string) => {
    setSelectedCabinets(prev => prev.filter(c => c.model !== model));
  };

  const mergeParsedItems = (items: { model: string; qty: number }[]) => {
    setSelectedCabinets(prev => {
      const merged = [...prev];
      for (const item of items) {
        if (!cabinetLookup[item.model]) continue;
        const idx = merged.findIndex(c => c.model === item.model);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], qty: merged[idx].qty + item.qty };
        } else {
          merged.push({ model: item.model, qty: item.qty, finishSide: 'none' });
        }
      }
      return merged;
    });
  };

  const handleImport = async (source: 'file' | 'text') => {
    setImporting(true);
    try {
      let body: any = {};

      if (source === 'file' && importFiles.length > 0) {
        // Check if any file is an image/PDF (vision-based) vs text
        const imageFiles = importFiles.filter(f =>
          f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp)$/i) || f.type === 'application/pdf' || f.name.match(/\.pdf$/i)
        );
        const textFiles = importFiles.filter(f => !imageFiles.includes(f));

        if (imageFiles.length > 0) {
          // Convert all image/PDF files to base64 and send as array
          const images = await Promise.all(
            imageFiles.map(async (f) => ({
              base64: await fileToBase64(f),
              mimeType: f.type || 'image/png',
            }))
          );
          body = { images };
        }

        // If there are also text files, append their content
        if (textFiles.length > 0) {
          const texts = await Promise.all(textFiles.map(f => f.text()));
          body.textContent = (body.textContent || '') + texts.join('\n');
        }
      } else if (source === 'text') {
        if (!pasteText.trim()) { toast.error('Paste a cabinet list first'); setImporting(false); return; }
        body = { textContent: pasteText.trim() };
      }

      const { data, error } = await supabase.functions.invoke('parse-cabinet-list', { body });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const items = data?.items || [];
      const skipped = data?.skipped || [];

      if (items.length === 0 && skipped.length === 0) {
        toast.warning('No matching cabinets found in the input');
      } else {
        // Build full extraction list (matched + unmatched)
        const extracted: { model: string; qty: number; matched: boolean }[] = [
          ...items.map((i: { model: string; qty: number }) => ({ ...i, matched: true })),
          ...skipped.map((i: { model: string; qty: number }) => ({ ...i, matched: false })),
        ];
        setAllExtracted(extracted);
        setAddedAsCustom(new Set());

        if (items.length > 0) {
          mergeParsedItems(items);
        }
        setSkippedItems(skipped);
        const msg = `Imported ${items.length} cabinet model(s)` + (skipped.length > 0 ? ` · ${skipped.length} unmatched` : '');
        toast.success(msg);
        setPasteText('');
        setImportFiles([]);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      toast.error(err?.message || 'Failed to parse cabinet list');
    } finally {
      setImporting(false);
    }
  };

  const handleImportDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    if (newFiles.length > 0) setImportFiles(prev => [...prev, ...newFiles]);
  };

  const removeImportFile = (index: number) => {
    setImportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const totalItems = selectedCabinets.reduce((sum, c) => sum + c.qty, 0);

  const filteredCategories = Object.entries(cabinetCatalog)
    .map(([key, cat]) => ({
      key,
      name: cat.name,
      items: cat.items.filter(item =>
        !search || item.model.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
        <button
          onClick={() => setMode('browse')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${mode === 'browse' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Browse Catalog
        </button>
        <button
          onClick={() => setMode('import')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${mode === 'import' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Upload size={12} /> Import List
        </button>
      </div>

      {/* Selected cabinets summary */}
      {selectedCabinets.length > 0 && (
        <div className="bg-accent/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Package size={14} />
              Selected ({totalItems} items)
            </h4>
            <button
              onClick={() => setSelectedCabinets([])}
              className="text-xs text-destructive hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {selectedCabinets.map(cab => {
              const info = cabinetLookup[cab.model];
              return (
                <div key={cab.model} className="flex items-center justify-between text-sm bg-background rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-medium text-foreground">{cab.model}</span>
                    {info && <span className="text-muted-foreground ml-1.5 text-xs hidden sm:inline">· ${info.price}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={() => updateQty(cab.model, -1)} className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"><Minus size={12} /></button>
                    <span className="w-6 text-center text-sm font-medium text-foreground">{cab.qty}</span>
                    <button onClick={() => updateQty(cab.model, 1)} className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"><Plus size={12} /></button>
                    <button onClick={() => removeCabinet(cab.model)} className="w-6 h-6 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'import' ? (
        <div className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => importInputRef.current?.click()}
            onDrop={handleImportDrop}
            onDragOver={e => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              importFiles.length > 0 ? 'border-primary bg-accent' : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input
              ref={importInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.txt,.xls,.xlsx"
              multiple
              onChange={e => {
                const newFiles = Array.from(e.target.files || []);
                if (newFiles.length > 0) setImportFiles(prev => [...prev, ...newFiles]);
                if (importInputRef.current) importInputRef.current.value = '';
              }}
              className="hidden"
            />
            {importFiles.length > 0 ? (
              <div className="space-y-2">
                <FileText className="text-primary mx-auto" size={24} />
                <p className="text-sm font-medium text-foreground">
                  {importFiles.length} file{importFiles.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-muted-foreground">Click or drop to add more</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="text-muted-foreground mx-auto" size={24} />
                <p className="text-sm font-medium text-foreground">Drop cabinet list files</p>
                <p className="text-xs text-muted-foreground">PDF, image, CSV, or text — multiple pages supported</p>
              </div>
            )}
          </div>

          {/* File list */}
          {importFiles.length > 0 && (
            <div className="space-y-1.5">
              {importFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText size={12} className="text-primary shrink-0" />
                    <span className="text-foreground truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeImportFile(idx); }}
                    className="text-destructive hover:bg-destructive/10 rounded p-0.5 transition-colors shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {importFiles.length > 0 && (
            <button
              onClick={() => handleImport('file')}
              disabled={importing}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {importing ? <><Loader2 size={14} className="animate-spin" /> Parsing…</> : `Extract Cabinets from ${importFiles.length} File${importFiles.length > 1 ? 's' : ''}`}
            </button>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or paste a list</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Paste area */}
          <div className="space-y-2">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder={"Paste cabinet list here…\ne.g. W3030 x4, B24 x3, SB36 x2"}
              rows={4}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <button
              onClick={() => handleImport('text')}
              disabled={importing || !pasteText.trim()}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {importing ? <><Loader2 size={14} className="animate-spin" /> Parsing…</> : <><ClipboardPaste size={14} /> Extract from Text</>}
            </button>
          </div>

          {/* Full extraction summary */}
          {allExtracted.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between bg-accent/50 px-3 py-2 gap-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Extraction Summary — {allExtracted.filter(i => i.matched).length} matched, {allExtracted.filter(i => !i.matched).length} unmatched
                </h4>
                <div className="flex items-center gap-2">
                  {onAddCustomItem && allExtracted.some(i => !i.matched && !addedAsCustom.has(i.model)) && (
                    <button
                      onClick={() => {
                        const unmatched = allExtracted.filter(i => !i.matched && !addedAsCustom.has(i.model));
                        unmatched.forEach(item => onAddCustomItem(item.model, item.qty));
                        setAddedAsCustom(prev => { const next = new Set(prev); unmatched.forEach(i => next.add(i.model)); return next; });
                        toast.success(`Added ${unmatched.length} unmatched item${unmatched.length > 1 ? 's' : ''} as custom`);
                      }}
                      className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-1 rounded-md hover:bg-primary/20 transition-colors whitespace-nowrap"
                    >
                      + Add all unmatched
                    </button>
                  )}
                  <button
                    onClick={() => { setAllExtracted([]); setSkippedItems([]); setAddedAsCustom(new Set()); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border max-h-52 overflow-y-auto">
                {allExtracted.map((item, idx) => (
                  <div key={`${item.model}-${idx}`} className={`flex items-center gap-2.5 px-3 py-2 text-xs ${!item.matched ? 'border-l-2 border-dashed border-destructive/40 bg-destructive/5 opacity-70' : ''}`}>
                    {item.matched ? (
                      <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                        <X size={12} className="text-destructive" />
                      </span>
                    )}
                    <span className={`font-mono font-medium ${item.matched ? 'text-foreground' : 'text-destructive'}`}>
                      {item.model}
                    </span>
                    <span className="text-muted-foreground">×{item.qty}</span>
                    {!item.matched && (
                      <span className="ml-auto flex items-center gap-2">
                        <span className="text-destructive/70 italic">Not in catalog</span>
                        {onAddCustomItem && (
                          addedAsCustom.has(item.model) ? (
                            <span className="text-[10px] text-muted-foreground italic whitespace-nowrap">Added ✓</span>
                          ) : (
                            <button
                              onClick={() => {
                                onAddCustomItem(item.model, item.qty);
                                setAddedAsCustom(prev => new Set(prev).add(item.model));
                                toast.success(`Added "${item.model}" as custom line item`);
                              }}
                              className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-md hover:bg-primary/20 transition-colors whitespace-nowrap"
                            >
                              + Add as custom
                            </button>
                          )
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {skippedItems.length > 0 && (
                <div className="bg-destructive/5 px-3 py-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Items marked with <X size={10} className="inline text-destructive" /> were not found in the catalog. You can add them as custom line items or contact us for pricing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Combobox dropdown for adding cabinets */}
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
              >
                <span>Add cabinet from catalog…</span>
                <ChevronsUpDown size={14} className="shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search model or description…" />
                <CommandList className="max-h-64">
                  <CommandEmpty>No cabinet found.</CommandEmpty>
                  {filteredCategories.map(cat => (
                    <CommandGroup key={cat.key} heading={cat.name}>
                      {cat.items.map(item => {
                        const isSelected = selectedCabinets.some(c => c.model === item.model);
                        return (
                          <CommandItem
                            key={item.model}
                            value={`${item.model} ${item.description}`}
                            onSelect={() => {
                              addCabinet(item.model);
                              setComboOpen(false);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Check size={14} className={`shrink-0 ${isSelected ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                              <span className="font-mono text-xs">{item.model}</span>
                              <span className="text-muted-foreground text-xs truncate">{item.description}</span>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">${item.price}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
};

export default CabinetListPanel;
