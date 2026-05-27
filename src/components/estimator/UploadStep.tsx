import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, X, Loader2, Eye, Camera, Image as ImageIcon } from 'lucide-react';
import type { SelectedCabinet, Analysis, FileCategory } from '@/lib/types';
import { renderAnnotatedBlueprintDataUrls } from '@/lib/render-annotated-blueprints';
import ReconciliationPanel from './ReconciliationPanel';
import CabinetListPanel from './CabinetListPanel';
import BlueprintResultsPanel from './BlueprintResultsPanel';
import { useCamera } from '@/hooks/useCamera';

interface UploadStepProps {
  /** The file analyzer instance from useEstimator (single source of truth) */
  fileAnalyzer: {
    files: File[];
    addFiles: (f: File[]) => void;
    removeFile: (i: number) => void;
    clearFiles: () => void;
    clearElevCache: () => number;
    analyzing: boolean;
    progress: { current: number; total: number; label: string };
    reconciliation: any;
    analyzeAll: (
      existingAnalysis: Analysis | null,
      onAnalysis: (a: Analysis) => void,
      onCabinets: (items: SelectedCabinet[]) => void,
    ) => void;
    applyReconciliation: (
      resolvedQtys: Record<string, number>,
      onCabinets: (items: SelectedCabinet[]) => void,
    ) => void;
    classifyFile: (f: File) => FileCategory;
  };
  selectedCabinets: SelectedCabinet[];
  setSelectedCabinets: React.Dispatch<React.SetStateAction<SelectedCabinet[]>>;
  analysis: Analysis | null;
  setAnalysis: (a: Analysis) => void;
  onNext: () => void;
  onAddCustomItem?: (description: string, qty: number, unitPrice?: number) => void;
  onBlueprintPreviewsReady?: (urls: string[]) => void;
}

const CATEGORY_LABELS: Record<FileCategory, string> = {
  blueprint: 'Blueprint',
  elevation: 'Elevation',
  'cabinet-list': 'Cabinet List',
};

const CATEGORY_COLORS: Record<FileCategory, string> = {
  blueprint: 'bg-info/15 text-info',
  elevation: 'bg-primary/15 text-primary',
  'cabinet-list': 'bg-warning/15 text-warning',
};

const UploadStep: React.FC<UploadStepProps> = ({
  fileAnalyzer,
  selectedCabinets,
  setSelectedCabinets,
  analysis,
  setAnalysis,
  onNext,
  onAddCustomItem,
  onBlueprintPreviewsReady,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addedCustomModels, setAddedCustomModels] = useState<Set<string>>(new Set());

  const {
    files, addFiles, removeFile, clearFiles, clearElevCache,
    analyzing, progress, reconciliation,
    analyzeAll, applyReconciliation, classifyFile,
  } = fileAnalyzer;

  const { capturePhoto, pickFromGallery } = useCamera(addFiles);

  useEffect(() => {
    if (!reconciliation || !onBlueprintPreviewsReady) return;

    void renderAnnotatedBlueprintDataUrls(files, reconciliation)
      .then((urls) => {
        if (urls.length > 0) onBlueprintPreviewsReady(urls);
      })
      .catch(() => {});
  }, [files, reconciliation, onBlueprintPreviewsReady]);

  const handleAddCustomFromBlueprint = (description: string, qty: number) => {
    if (onAddCustomItem) {
      onAddCustomItem(description, qty);
      setAddedCustomModels((prev) => new Set(prev).add(description));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) addFiles(newFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    if (newFiles.length > 0) addFiles(newFiles);
  };

  const handleRemoveFile = (index: number) => removeFile(index);
  const handleClearAll = () => clearFiles();

  const handleClearCache = () => {
    const count = clearElevCache();
    clearFiles();
    toast.success(count > 0 ? `Cache cleared (${count} file${count > 1 ? 's' : ''}) — re-upload to get fresh results` : 'Cache already empty');
  };

  const handleAnalyzeAll = () => {
    analyzeAll(
      analysis,
      (a) => setAnalysis(a),
      (items) => setSelectedCabinets(items),
    );
  };

  const handleApplyReconciliation = (resolvedQtys: Record<string, number>) => {
    applyReconciliation(resolvedQtys, (items) => setSelectedCabinets(items));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Upload Files</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Drop blueprints, elevations, and cabinet lists — we auto-detect and cross-check everything
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Camera / upload buttons for mobile */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm active:opacity-80 transition-all"
            >
              <Camera size={18} />
              Take Photo
            </button>
            <button
              type="button"
              onClick={pickFromGallery}
              className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold text-sm active:opacity-80 transition-all"
            >
              <ImageIcon size={18} />
              Browse Files
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
              files.length > 0
                ? 'border-primary bg-accent'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.dwg,.csv,.txt,.xls,.xlsx"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {files.length > 0 ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="text-primary" size={22} />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {files.length} file{files.length > 1 ? 's' : ''} ready
                </p>
                <p className="text-xs text-muted-foreground">Click or drop to add more</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                  <Upload className="text-muted-foreground" size={24} />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground hidden sm:block">Drop all your files here</p>
                  <p className="text-base font-semibold text-foreground sm:hidden">Or tap to browse files</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Blueprints, elevations, cabinet lists — any format
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PDF, JPG, PNG, CSV, TXT, DWG — multiple files supported
                  </p>
                </div>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((file, idx) => {
                const category = classifyFile(file);
                return (
                  <div key={`${file.name}-${idx}`} className="flex items-center justify-between bg-accent/50 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-primary shrink-0" />
                      <span className="text-foreground truncate">{file.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${CATEGORY_COLORS[category]}`}>
                        {CATEGORY_LABELS[category]}
                      </span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-destructive hover:bg-destructive/10 rounded p-1 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleClearAll} className="text-xs text-destructive hover:underline">
                    Remove all
                  </button>
                  <button onClick={handleClearCache} className="text-xs text-muted-foreground hover:underline">
                    Clear cache &amp; re-analyze
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                  {(['blueprint', 'elevation', 'cabinet-list'] as FileCategory[]).map((cat) => {
                    const count = files.filter((f) => classifyFile(f) === cat).length;
                    if (count === 0) return null;
                    return (
                      <span key={cat} className={`px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>
                        {count} {CATEGORY_LABELS[cat]}
                        {count > 1 ? 's' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {files.length > 0 && !analyzing && !reconciliation && (
            <button
              onClick={handleAnalyzeAll}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              Analyze All ({files.length} file{files.length > 1 ? 's' : ''})
            </button>
          )}

          {analyzing && progress.total > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <Loader2 size={16} className="animate-spin text-primary" />
                {progress.label}
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Step {progress.current} of {progress.total}
              </p>
            </div>
          )}

          {reconciliation && reconciliation.sources.length > 1 && (
            <ReconciliationPanel
              data={reconciliation}
              onApply={handleApplyReconciliation}
              onDismiss={() => {}}
            />
          )}

          {reconciliation && (
            <BlueprintResultsPanel
              files={files}
              reconciliation={reconciliation}
              onAddCustomItem={handleAddCustomFromBlueprint}
              addedCustomModels={addedCustomModels}
            />
          )}
        </div>

        <div>
          <CabinetListPanel
            selectedCabinets={selectedCabinets}
            setSelectedCabinets={setSelectedCabinets}
            onAddCustomItem={onAddCustomItem}
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={files.length === 0 && selectedCabinets.length === 0}
        className="w-full bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[48px]"
      >
        Continue
      </button>
    </div>
  );
};

export default UploadStep;
