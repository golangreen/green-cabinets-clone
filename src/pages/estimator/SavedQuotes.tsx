import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Trash2, FileText, Plus, ArrowLeft, Copy, GitCompare, X } from 'lucide-react';
import { pricingData } from '@/lib/pricing';
import { fmtOpt as fmt } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CompareView, { type FullQuote } from '@/components/estimator-quotes/CompareView';
import Seo from '@/components/Seo';

interface SavedQuote {
  id: string;
  name: string;
  location: string;
  file_name: string;
  material_tier: string;
  grand_total: number | null;
  created_at: string;
  updated_at: string;
}

const SavedQuotes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);
  const [compareQuotes, setCompareQuotes] = useState<FullQuote[]>([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchQuotes();
  }, [user]);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('saved_quotes')
      .select('id, name, location, file_name, material_tier, grand_total, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) { toast.error('Failed to load quotes'); console.error(error); }
    else setQuotes(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('saved_quotes').delete().eq('id', deleteId);
    if (error) toast.error('Failed to delete quote');
    else {
      setQuotes((q) => q.filter((x) => x.id !== deleteId));
      setCompareIds((prev) => { const n = new Set(prev); n.delete(deleteId); return n; });
      toast.success('Quote deleted');
    }
    setDeleteId(null);
  };

  const handleClone = async (id: string) => {
    setCloning(id);
    try {
      const { data: original, error: fetchErr } = await supabase.from('saved_quotes').select('*').eq('id', id).single();
      if (fetchErr || !original) throw new Error('Failed to fetch quote');
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original;
      const { data: cloned, error: insertErr } = await supabase
        .from('saved_quotes')
        .insert({ ...rest, name: `${original.name} (Copy)`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select('id, name, location, file_name, material_tier, grand_total, created_at, updated_at')
        .single();
      if (insertErr || !cloned) throw new Error('Failed to clone quote');
      setQuotes((prev) => [cloned, ...prev]);
      toast.success(`Cloned: ${cloned.name}`);
    } catch (err: any) { toast.error(err.message || 'Clone failed'); }
    finally { setCloning(null); }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      else toast.info('Max 4 quotes for comparison');
      return next;
    });
  };

  const startCompare = async () => {
    if (compareIds.size < 2) { toast.info('Select at least 2 quotes to compare'); return; }
    setLoadingCompare(true);
    const { data, error } = await supabase.from('saved_quotes').select('*').in('id', Array.from(compareIds));
    if (error || !data) { toast.error('Failed to load quotes for comparison'); setLoadingCompare(false); return; }
    setCompareQuotes(data as unknown as FullQuote[]);
    setComparing(true);
    setLoadingCompare(false);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (comparing && compareQuotes.length > 0) {
    return <CompareView quotes={compareQuotes} onClose={() => { setComparing(false); setCompareQuotes([]); }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Saved Quotes — Green Cabinets NY"
        description="View, compare, and manage your saved Green Cabinets blueprint estimates and millwork quotes."
        path="/quotes"
      />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Saved Quotes</h1>
            <p className="text-sm text-muted-foreground mt-1">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all">
              <ArrowLeft size={16} /> Estimator
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
              <Plus size={16} /> New Quote
            </button>
          </div>
        </div>

        {compareIds.size > 0 && (
          <div className="mb-4 flex items-center justify-between bg-accent rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-medium text-foreground">{compareIds.size} selected for comparison</span>
            <div className="flex gap-2">
              <button onClick={() => setCompareIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
              <button onClick={startCompare} disabled={compareIds.size < 2 || loadingCompare} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-all">
                {loadingCompare ? <Loader2 size={14} className="animate-spin" /> : <GitCompare size={14} />} Compare
              </button>
            </div>
          </div>
        )}

        {quotes.length === 0 ? (
          <div className="surface-elevated rounded-3xl p-12 text-center">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground">No saved quotes yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Create a quote in the estimator, then save it for later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <div key={q.id} className={`surface-card rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all ${compareIds.has(q.id) ? 'ring-2 ring-primary' : ''}`} onClick={() => navigate(`/?load=${q.id}`)}>
                <button onClick={(e) => { e.stopPropagation(); toggleCompare(q.id); }} aria-label={compareIds.has(q.id) ? `Deselect ${q.name} from comparison` : `Select ${q.name} for comparison`} className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${compareIds.has(q.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:border-primary'}`}>
                  {compareIds.has(q.id) && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{q.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.file_name} · {pricingData[q.material_tier]?.name || q.material_tier} · {new Date(q.updated_at).toLocaleDateString()}</p>
                </div>
                <span className="text-lg font-bold text-foreground whitespace-nowrap">{fmt(q.grand_total)}</span>
                <button onClick={(e) => { e.stopPropagation(); handleClone(q.id); }} disabled={cloning === q.id} aria-label={`Duplicate ${q.name}`} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50" title="Duplicate quote">
                  {cloning === q.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(q.id); }} aria-label={`Delete ${q.name}`} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this quote?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SavedQuotes;
