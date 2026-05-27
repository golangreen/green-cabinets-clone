import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Analysis, SelectedCabinet, CustomLineItem, DeliveryConfig, InstallationConfig, DiscountConfig, HardwareConfig, AddOnsConfig, Collection } from '@/lib/estimator/types';
import { calculateCosts } from '@/lib/estimator/pricing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFileAnalyzer } from '@/hooks/useFileAnalyzer';
import { fileToBase64 } from '@/lib/estimator/utils';

export function useEstimator() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [blueprintDataUrls, setBlueprintDataUrls] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedCabinets, setSelectedCabinets] = useState<SelectedCabinet[]>([]);
  const [customLineItems, setCustomLineItems] = useState<CustomLineItem[]>([]);
  const [delivery, setDelivery] = useState<DeliveryConfig>({ option: 'none', flatRate: 250, perItemRate: 15 });
  const [installation, setInstallation] = useState<InstallationConfig>({ enabled: false, ratePerCabinet: 85, complexityMultiplier: 1.0 });
  const [discount, setDiscount] = useState<DiscountConfig>({ enabled: false, type: 'percentage', value: 0, label: '' });
  const [hardware, setHardware] = useState<HardwareConfig>({ type: 'none', applyAll: true, perCabinet: {} });
  const [addOns, setAddOns] = useState<AddOnsConfig>([]);
  const [collection, setCollection] = useState<Collection>('luxor');
  const [selectedFinish, setSelectedFinish] = useState<string>('');

  const [loadedQuoteId, setLoadedQuoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [quoteName, setQuoteName] = useState('');

  // Single source of truth for uploaded files
  const fileAnalyzer = useFileAnalyzer();

  // Generate fallback data URLs from uploaded image files.
  useEffect(() => {
    const imageFiles = fileAnalyzer.files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setBlueprintDataUrls([]);
      return;
    }

    let cancelled = false;
    Promise.all(
      imageFiles.map(file => new Promise<string | null>((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, 600 / img.naturalWidth);
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
          URL.revokeObjectURL(url);
        };
        img.onerror = () => {
          resolve(null);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }))
    ).then(results => {
      if (!cancelled) {
        setBlueprintDataUrls(prev => prev.length > 0 ? prev : results.filter((u): u is string => u !== null));
      }
    });

    return () => { cancelled = true; };
  }, [fileAnalyzer.files]);

  // Load quote from URL param
  useEffect(() => {
    const loadId = searchParams.get('load');
    if (loadId && user) {
      loadQuote(loadId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, user]);

  const loadQuote = async (id: string) => {
    const { data, error } = await supabase
      .from('saved_quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Failed to load quote');
      return;
    }

    setLocation(data.location || '');
    setAnalysis(data.analysis as unknown as Analysis | null);
    setSelectedCabinets((data.selected_cabinets as any) || []);
    setCustomLineItems((data.custom_line_items as any) || []);
    setDelivery((data.delivery as any) || { option: 'none', flatRate: 250, perItemRate: 15 });
    setInstallation((data.installation as any) || { enabled: false, ratePerCabinet: 85, complexityMultiplier: 1.0 });
    setDiscount((data as any).discount || { enabled: false, type: 'percentage', value: 0, label: '' });
    setHardware((data as any).hardware || { type: 'none', applyAll: true, perCabinet: {} });
    setAddOns((data as any).add_ons || []);
    setQuoteName(data.name || '');
    setLoadedQuoteId(id);

    if ((data.selected_cabinets as any[])?.length > 0) {
      setStep(3);
    } else {
      setStep(1);
    }

    toast.success(`Loaded: ${data.name}`);
  };

  const handleSaveQuote = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setSaving(true);
    const costs = selectedCabinets.length > 0 || customLineItems.length > 0
      ? calculateCosts(selectedCabinets, location, customLineItems, delivery, installation, discount, hardware, addOns, collection, selectedFinish)

      : null;

    const payload = {
      user_id: user.id,
      name: quoteName.trim() || `Quote ${new Date().toLocaleDateString()}`,
      location,
      file_name: fileAnalyzer.files.map(f => f.name).join(', ') || 'Untitled',
      analysis: analysis as any,
      selected_cabinets: selectedCabinets as any,
      material_tier: location,
      custom_line_items: customLineItems as any,
      delivery: delivery as any,
      installation: installation as any,
      discount: discount as any,
      hardware: hardware as any,
      add_ons: addOns as any,
      grand_total: costs?.grandTotal ?? null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (loadedQuoteId) {
        const { error } = await supabase.from('saved_quotes').update(payload).eq('id', loadedQuoteId);
        if (error) throw error;
        toast.success('Quote updated!');
      } else {
        const { data, error } = await supabase.from('saved_quotes').insert(payload).select('id').single();
        if (error) throw error;
        setLoadedQuoteId(data.id);
        toast.success('Quote saved!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const analyzeBlueprint = async () => {
    if (fileAnalyzer.files.length === 0) return;
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const images = await Promise.all(
        fileAnalyzer.files.map(async (file) => ({
          base64: await fileToBase64(file),
          mimeType: file.type || 'image/png',
        }))
      );

      const analysisResult = await supabase.functions.invoke('analyze-blueprint', { body: { images } });

      if (analysisResult.error) throw new Error(analysisResult.error.message || 'Analysis failed');
      if (analysisResult.data?.error) throw new Error(analysisResult.data.error);
      if (!analysisResult.data?.analysis) throw new Error('No analysis returned');

      setAnalysis(analysisResult.data.analysis);
    } catch (err: any) {
      console.error('Blueprint analysis error:', err);
      const msg = err?.message || 'Failed to analyze blueprint';
      setAnalysisError(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const costs = selectedCabinets.length > 0 || customLineItems.length > 0
    ? calculateCosts(selectedCabinets, location, customLineItems, delivery, installation, discount, hardware, addOns, collection, selectedFinish)
    : null;

  const canSave = step >= 3;

  return {
    user, signOut, navigate,
    step, setStep,
    fileAnalyzer,
    blueprintDataUrls, setBlueprintDataUrls,
    location, setLocation,
    analyzing, analysisError,
    analysis, setAnalysis,
    selectedCabinets, setSelectedCabinets,
    customLineItems, setCustomLineItems,
    delivery, setDelivery,
    installation, setInstallation,
    discount, setDiscount,
    hardware, setHardware,
    addOns, setAddOns,
    collection, setCollection,
    loadedQuoteId, saving,
    quoteName, setQuoteName,
    costs, canSave,
    handleSaveQuote, analyzeBlueprint,
  };
}
