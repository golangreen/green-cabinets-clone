import React, { useState } from 'react';
import { Download, Send, AlertTriangle, Loader2, ShoppingBag } from 'lucide-react';
import type { Analysis, SelectedCabinet, CostBreakdown, DiscountConfig } from '@/lib/estimator/types';
import { pricingData } from '@/lib/estimator/pricing';
import { fmt } from '@/lib/estimator/utils';
import { buildQuoteHtml } from '@/lib/estimator/build-quote-html';
import { generateQuotePDF } from '@/lib/estimator/generate-pdf';
import { toast } from 'sonner';
import { callEdgeFunction } from '@/lib/estimator/call-edge-function';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import QuoteLineItems from './QuoteLineItems';
import QuoteCostSummary from './QuoteCostSummary';
import DiscountSection from './DiscountSection';

interface QuoteStepProps {
  costs: CostBreakdown;
  location: string;
  fileName: string;
  analysis: Analysis | null;
  selectedCabinets: SelectedCabinet[];
  discount: DiscountConfig;
  setDiscount: React.Dispatch<React.SetStateAction<DiscountConfig>>;
  blueprintDataUrls?: string[];
  onBack: () => void;
  onOrder: () => void;
}

const QuoteStep: React.FC<QuoteStepProps> = ({ costs, location, fileName, selectedCabinets, discount, setDiscount, blueprintDataUrls = [], onBack, onOrder }) => {
  const locData = pricingData[location];
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [sendToCustomer, setSendToCustomer] = useState(true);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      await generateQuotePDF(costs, location, fileName, projectNotes.trim(), selectedCabinets, blueprintDataUrls);
      toast.success('PDF quote downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF.');
    } finally { setGenerating(false); }
  };

  const handleSendQuote = async () => {
    setSending(true);
    try {
      const quoteHtml = buildQuoteHtml({
        costs, locationName: locData?.name || location, locationMultiplier: costs.locationMultiplier,
        fileName, customerName: customerName.trim() || undefined, customerEmail: customerEmail.trim() || undefined,
        projectNotes: projectNotes.trim() || undefined, selectedCabinets, blueprintImageUrls: blueprintDataUrls,
      });
      const data = await callEdgeFunction('send-quote', {
        quoteHtml,
        customerEmail: customerEmail.trim() || undefined,
        customerName: customerName.trim() || undefined,
        subject: `Quote Request: ${fileName} — $${costs.grandTotal.toLocaleString()}`,
        sendToCustomer,
      });
      if (data?.error) throw new Error(data.error);
      const msg = sendToCustomer && customerEmail.trim()
        ? "Quote sent to Green Cabinets and a copy to your email!"
        : "Quote sent to Green Cabinets! They'll contact you within 24 hours.";
      toast.success(msg);
    } catch (err: any) {
      console.error('Send quote error:', err);
      toast.error(err?.message || 'Failed to send quote. Please try again.');
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Your Quote</h2>
        <p className="text-muted-foreground mt-1 text-sm">Cabinet line items — {locData?.name || 'Base'} style</p>
      </div>

      {/* Project Info */}
      <div className="bg-accent rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-sm">
          <div><p className="text-muted-foreground">Project</p><p className="font-semibold text-foreground truncate">{fileName}</p></div>
          <div><p className="text-muted-foreground">Cabinet Style</p><p className="font-semibold text-foreground">{locData?.name}</p></div>
          <div><p className="text-muted-foreground">Date</p><p className="font-semibold text-foreground">{new Date().toLocaleDateString()}</p></div>
          <div><p className="text-muted-foreground">Valid Until</p><p className="font-semibold text-foreground">{new Date(Date.now() + 30 * 86400000).toLocaleDateString()}</p></div>
        </div>
      </div>

      <QuoteLineItems costs={costs} />
      <QuoteCostSummary costs={costs} />
      <DiscountSection discount={discount} setDiscount={setDiscount} costs={costs} />

      {/* Grand Total */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-5 sm:p-6">
        <div className="flex justify-between items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold">Total Project Cost</h3>
            <p className="text-xs sm:text-sm opacity-80 mt-0.5">
              {costs.installationFee > 0 ? 'Cabinets + installation' : 'Cabinets only — installation separate'}
            </p>
          </div>
          <p className="text-2xl sm:text-4xl font-bold shrink-0">{fmt(costs.grandTotal)}</p>
        </div>
      </div>

      {/* Place Order CTA */}
      <button
        onClick={onOrder}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all min-h-[56px] active:scale-[0.98] shadow-lg shadow-primary/20"
      >
        <ShoppingBag size={20} />
        Place Order — {fmt(costs.grandTotal)}
      </button>

      {/* Customer Info */}
      <div className="bg-accent rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Your Contact Info</h3>
        <p className="text-xs text-muted-foreground">Required to send quote — so Green Cabinets can follow up with you</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="text" name="name" autoComplete="name" placeholder="Your name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <div>
            <input type="email" name="email" autoComplete="email" placeholder="Your email *" value={customerEmail} onChange={(e) => { setCustomerEmail(e.target.value); setEmailError(''); }} maxLength={255} className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary ${emailError ? 'border-destructive' : 'border-border'}`} />
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </div>
        </div>
        <textarea placeholder="Project notes or special instructions (optional)" value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} maxLength={1000} rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        {projectNotes.length > 0 && <p className="text-xs text-muted-foreground text-right">{projectNotes.length}/1,000</p>}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendToCustomer}
            onChange={(e) => setSendToCustomer(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
          />
          <span className="text-sm text-foreground">Send me a copy of the quote</span>
        </label>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={handleDownloadPDF} disabled={generating} className="w-full flex items-center justify-center gap-2 surface-card py-3.5 sm:py-4 rounded-xl font-semibold text-foreground hover:bg-accent disabled:opacity-60 transition-all min-h-[48px] active:scale-[0.98]">
          {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Download size={18} /> Download PDF Quote</>}
        </button>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <button
            onClick={() => {
              const email = customerEmail.trim();
              if (!email) { setEmailError('Email is required to send a quote'); return; }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address'); return; }
              setEmailError(''); setConfirmOpen(true);
            }}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 sm:py-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition-all min-h-[48px] active:scale-[0.98]"
          >
            {sending ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send to Green Cabinets</>}
          </button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send quote to Green Cabinets?</AlertDialogTitle>
              <AlertDialogDescription>
                This will email your quote ({fmt(costs.grandTotal)}) to Green Cabinets NY.
                {sendToCustomer && customerEmail && ` A copy will also be sent to ${customerEmail}.`}
                {' '}They typically respond within 24 hours.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendQuote}>Send Quote</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <button onClick={onBack} className="w-full bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold hover:opacity-80 transition-all min-h-[48px] active:scale-[0.98]">
        ← Back to Cabinet Selection
      </button>

      <div className="bg-warning-soft border-l-4 border-warning p-4 rounded-xl flex gap-3">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-foreground" />
        <p className="text-sm text-foreground">
          <strong>Note:</strong> Automated estimate based on Green Cabinets pricing. Final pricing may vary after on-site measurement. Quote valid for 30 days.
        </p>
      </div>
    </div>
  );
};

export default QuoteStep;
