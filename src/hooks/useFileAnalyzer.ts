import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enhanceImageForOCR } from '@/lib/utils';
import { cabinetLookup } from '@/lib/catalog-data';
import { applyFuzzyMatching, buildReconciliation, classifyFile } from '@/lib/file-analysis';
import { callEdgeFunction } from '@/lib/call-edge-function';
import type { SelectedCabinet, Analysis, FileCategory, CabinetPosition, SourceResult, ReconciliationData, WallCheckRow } from '@/lib/types';

// Re-export types and functions for backward compatibility during migration
export type { FileCategory, CabinetPosition, SourceResult, ReconciliationData };
export { applyFuzzyMatching, classifyFile };

interface ClassifiedFile {
  file: File;
  category: FileCategory;
}

// ── Elevation result cache ────────────────────────────────────────────────────
// Same file → same Claude result every time. Keyed by name+size+lastModified.
const ELEV_CACHE_PREFIX = 'bp2b-elev-v2-';
const ELEV_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function elevFingerprint(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

type ElevData = { items: any[]; skipped: any[]; wall_check?: WallCheckRow[] };

function elevCacheRead(fp: string): ElevData | null {
  try {
    const raw = localStorage.getItem(ELEV_CACHE_PREFIX + fp);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > ELEV_CACHE_TTL) {
      localStorage.removeItem(ELEV_CACHE_PREFIX + fp);
      return null;
    }
    return entry.data;
  } catch { return null; }
}

function elevCacheWrite(fp: string, data: ElevData): void {
  try {
    localStorage.setItem(ELEV_CACHE_PREFIX + fp, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* localStorage quota exceeded — ignore */ }
}
// ─────────────────────────────────────────────────────────────────────────────

async function parseElevationSource(
  file: File,
  source: string,
  category: FileCategory,
): Promise<SourceResult | null> {
  try {
    const fp = elevFingerprint(file);
    let data = elevCacheRead(fp);

    if (!data) {
      const image = await enhanceImageForOCR(file);
      data = await callEdgeFunction<ElevData>('parse-elevation', { images: [image] });
      elevCacheWrite(fp, data);
    }

    const rawItems = (data?.items || []).filter((item: any) => item?.model && typeof item.qty === 'number' && item.qty > 0);
    const rawSkipped = (data?.skipped || []).filter((item: any) => item?.model && typeof item.qty === 'number' && item.qty > 0);

    if (rawItems.length === 0 && rawSkipped.length === 0) {
      return null;
    }

    const { cabinets, fuzzyMatched, customPriced, skipped } = applyFuzzyMatching(rawItems, rawSkipped);

    return {
      source,
      category,
      cabinets,
      fuzzyMatched,
      customPriced,
      skipped,
      wallCheck: data?.wall_check || [],
    };
  } catch (error: any) {
    console.error(`Cabinet parsing failed for ${file.name}:`, error);
    toast.error(`Extraction failed: ${error?.message || String(error)}`);
    return null;
  }
}

export function useFileAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [reconciliation, setReconciliation] = useState<ReconciliationData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setReconciliation(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setReconciliation(null);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setReconciliation(null);
  }, []);

  const clearElevCache = useCallback(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(ELEV_CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    return keys.length;
  }, []);

  const analyzeAll = useCallback(async (
    _existingAnalysis: Analysis | null,
    onAnalysis: (a: Analysis) => void,
    onCabinets: (items: SelectedCabinet[]) => void,
  ) => {
    if (files.length === 0) return;
    setAnalyzing(true);
    setReconciliation(null);

    try {
      const classified: ClassifiedFile[] = files.map(f => ({
        file: f,
        category: classifyFile(f),
      }));

      const blueprintFiles = classified.filter(c => c.category === 'blueprint');
      const elevationFiles = classified.filter(c => c.category === 'elevation');
      const cabinetListFiles = classified.filter(c => c.category === 'cabinet-list');

      const totalSteps = (blueprintFiles.length > 0 ? 2 : 0) +
        (elevationFiles.length > 0 ? 1 : 0) +
        (cabinetListFiles.length > 0 ? 1 : 0);
      let step = 0;

      const sources: SourceResult[] = [];

      // ── 1. Process blueprints ──
      if (blueprintFiles.length > 0) {
        const bpImages = await Promise.all(
          blueprintFiles.map(c => enhanceImageForOCR(c.file))
        );

        setProgress({ current: ++step, total: totalSteps, label: 'Analyzing blueprints…' });

        try {
          const analysisData = await callEdgeFunction<{ analysis?: Analysis; error?: string }>('analyze-blueprint', { images: bpImages });
          if (analysisData?.analysis) {
            setAnalysisResult(analysisData.analysis);
            onAnalysis(analysisData.analysis);
          } else {
            toast.warning('Blueprint room analysis returned no data — you can add rooms manually');
          }
        } catch (bpErr: any) {
          console.error('Blueprint analysis error:', bpErr);
          toast.warning(`Blueprint room analysis failed (${bpErr.message}) — you can add rooms manually`);
        }

        setProgress({ current: ++step, total: totalSteps, label: 'Extracting cabinets from floor plans…' });

        const blueprintSources = await Promise.all(
          blueprintFiles.map(({ file }) =>
            parseElevationSource(file, `Floor Plan (${file.name})`, 'blueprint')
          )
        );

        sources.push(...blueprintSources.filter((source): source is SourceResult => Boolean(source)));
      }

      // ── 2. Process elevations ──
      if (elevationFiles.length > 0) {
        setProgress({ current: ++step, total: totalSteps, label: 'Parsing elevation drawings…' });

        const elevationSources = await Promise.all(
          elevationFiles.map(({ file }) =>
            parseElevationSource(file, `Elevation (${file.name})`, 'elevation')
          )
        );

        sources.push(...elevationSources.filter((source): source is SourceResult => Boolean(source)));
      }

      // ── 3. Process cabinet lists ──
      if (cabinetListFiles.length > 0) {
        setProgress({ current: ++step, total: totalSteps, label: 'Parsing cabinet lists…' });

        const imageListFiles = cabinetListFiles.filter(f =>
          f.file.type.startsWith('image/') || f.file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)
        );
        const textListFiles = cabinetListFiles.filter(f => !imageListFiles.includes(f));

        const reqBody: any = {};

        if (imageListFiles.length > 0) {
          reqBody.images = await Promise.all(
            imageListFiles.map(f => enhanceImageForOCR(f.file))
          );
        }

        if (textListFiles.length > 0) {
          const texts = await Promise.all(textListFiles.map(f => f.file.text()));
          reqBody.textContent = texts.join('\n');
        }

        try {
          const clData = await callEdgeFunction<{ items: any[]; skipped: any[] }>('parse-cabinet-list', reqBody);
          if (((clData?.items?.length) || 0) > 0 || ((clData?.skipped?.length) || 0) > 0) {
            const aggMap = new Map<string, number>();
            for (const item of (clData.items || [])) {
              aggMap.set(item.model, (aggMap.get(item.model) || 0) + item.qty);
            }
            const aggItems = Array.from(aggMap.entries()).map(([model, qty]) => ({ model, qty }));

            const skippedMap = new Map<string, number>();
            for (const item of (clData.skipped || [])) {
              skippedMap.set(item.model, (skippedMap.get(item.model) || 0) + item.qty);
            }
            const aggSkipped = Array.from(skippedMap.entries()).map(([model, qty]) => ({ model, qty }));

            const { cabinets, fuzzyMatched, customPriced, skipped } = applyFuzzyMatching(aggItems, aggSkipped);

            sources.push({
              source: `Cabinet List (${cabinetListFiles.map(f => f.file.name).join(', ')})`,
              category: 'cabinet-list',
              cabinets,
              fuzzyMatched,
              customPriced,
              skipped,
            });
          }
        } catch (clErr: any) {
          console.error('Cabinet list parse error:', clErr);
          toast.warning(`Cabinet list parsing failed: ${clErr.message}`);
        }
      }

      // ── 4. Cross-reference & reconcile ──
      if (sources.length === 0) {
        toast.warning('No cabinets detected in any uploaded files');
        setAnalyzing(false);
        return;
      }

      const recon = buildReconciliation(sources);
      setReconciliation(recon);

      // Build a map of custom prices from all sources (model → CabinetPosition with price info)
      const customPriceMap = new Map<string, CabinetPosition>();
      for (const src of sources) {
        for (const cp of (src.customPriced ?? [])) {
          if (!customPriceMap.has(cp.model)) customPriceMap.set(cp.model, cp);
        }
      }

      if (sources.length === 1 && recon.conflicts.length === 0) {
        applyMerged(recon.merged, customPriceMap, onCabinets);
        const totalSkipped = sources.reduce((s, src) => s + src.skipped.length, 0);
        const totalFuzzy = sources.reduce((s, src) => s + src.fuzzyMatched.length, 0);
        const totalCustom = sources.reduce((s, src) => s + (src.customPriced?.length ?? 0), 0);
        toast.success(`Extracted ${recon.merged.length} cabinet models`);
        if (totalFuzzy > 0) {
          toast.info(`${totalFuzzy} model(s) auto-matched to nearest catalog size (yellow)`);
        }
        if (totalCustom > 0) {
          toast.info(`${totalCustom} custom-dimension cabinet(s) estimated (✦)`);
        }
        if (totalSkipped > 0) {
          toast.info(`${totalSkipped} unrecognized model(s) skipped`);
        }
      } else {
        toast.info(`Found cabinets from ${sources.length} sources — review the comparison below`);
      }
    } catch (err: any) {
      console.error('Batch analysis error:', err);
      toast.error(err?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
      setProgress({ current: 0, total: 0, label: '' });
    }
  }, [files]);

  const applyMerged = useCallback((
    merged: { model: string; qty: number; drawerCount?: number }[],
    customPriceMap: Map<string, CabinetPosition>,
    onCabinets: (items: SelectedCabinet[]) => void,
  ) => {
    const items: SelectedCabinet[] = merged.map(m => {
      const base: Partial<SelectedCabinet> = {
        model: m.model, qty: m.qty, finishSide: 'none' as const,
        ...(m.drawerCount != null ? { drawerCount: m.drawerCount } : {}),
      };
      if (cabinetLookup[m.model]) {
        return base as SelectedCabinet;
      }
      const cp = customPriceMap.get(m.model);
      if (cp?.customPricePerUnit != null) {
        return {
          ...base,
          customPricePerUnit: cp.customPricePerUnit,
          customPriceFormula: cp.customPriceFormula,
        } as SelectedCabinet;
      }
      return null;
    }).filter(Boolean) as SelectedCabinet[];
    onCabinets(items);
  }, []);

  const applyReconciliation = useCallback((
    resolvedQtys: Record<string, number>,
    onCabinets: (items: SelectedCabinet[]) => void,
  ) => {
    const items: SelectedCabinet[] = Object.entries(resolvedQtys)
      .filter(([model, qty]) => cabinetLookup[model] && qty > 0)
      .map(([model, qty]) => ({ model, qty, finishSide: 'none' as const }));
    onCabinets(items);
    toast.success(`Applied ${items.length} cabinet models`);
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    clearElevCache,
    analyzing,
    progress,
    reconciliation,
    analysisResult,
    analyzeAll,
    applyMerged,
    applyReconciliation,
    classifyFile,
  };
}
