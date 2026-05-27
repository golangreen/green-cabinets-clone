import React, { useState } from 'react';
import { X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { generateComparisonPDF } from '@/lib/generate-comparison-pdf';
import { pricingData, calculateCosts } from '@/lib/pricing';
import { fmtOpt as fmt } from '@/lib/utils';

export interface FullQuote {
  id: string;
  name: string;
  location: string;
  file_name: string;
  material_tier: string;
  grand_total: number | null;
  created_at: string;
  updated_at: string;
  selected_cabinets: any[];
  custom_line_items: any[];
  delivery: any;
  installation: any;
  discount: any;
  hardware: any;
  add_ons: any;
  analysis: any;
}

interface CompareViewProps {
  quotes: FullQuote[];
  onClose: () => void;
}

const CompareSection: React.FC<{
  title: string;
  id: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ title, id, expanded, onToggle, children }) => (
  <div className="mt-4">
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-4 py-3 surface-card rounded-xl hover:bg-accent transition-colors"
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
    </button>
    {expanded && (
      <div className="mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
        {children}
      </div>
    )}
  </div>
);

const CompareRow: React.FC<{
  label: string;
  cols: number;
  children: React.ReactNode;
}> = ({ label, cols, children }) => (
  <div
    className="grid gap-3 items-center px-4 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
    style={{ gridTemplateColumns: `160px repeat(${cols}, 1fr)` }}
  >
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </div>
);

const CompareView: React.FC<CompareViewProps> = ({ quotes, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['totals']));

  const toggle = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const quoteCosts = quotes.map((q) => {
    try {
      return calculateCosts(
        q.selected_cabinets || [],
        q.location || '',
        q.custom_line_items || [],
        q.delivery || { option: 'none', flatRate: 250, perItemRate: 15 },
        q.installation || { enabled: false, ratePerCabinet: 85, complexityMultiplier: 1.0 },
        q.discount || { enabled: false, type: 'percentage', value: 0, label: '' },
        q.hardware || { type: 'none', applyAll: true, perCabinet: {} },
        q.add_ons || [],
      );
    } catch { return null; }
  });

  const totals = quotes.map((q) => q.grand_total ?? Infinity);
  const lowestTotal = Math.min(...totals);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compare Quotes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comparing {quotes.length} quotes side by side
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => await generateComparisonPDF(quotes)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
            >
              <Download size={16} /> Export PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
            >
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Quote headers */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${quotes.length}, 1fr)` }}>
              <div />
              {quotes.map((q) => (
                <div key={q.id} className="surface-card rounded-2xl p-4 text-center">
                  <h3 className="font-bold text-foreground text-sm truncate">{q.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{q.file_name}</p>
                  <p className={`text-2xl font-bold mt-2 ${q.grand_total === lowestTotal ? 'text-primary' : 'text-foreground'}`}>
                    {fmt(q.grand_total)}
                  </p>
                  {q.grand_total === lowestTotal && (
                    <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      Lowest
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Totals section */}
            <CompareSection title="Cost Breakdown" id="totals" expanded={expandedSections.has('totals')} onToggle={toggle}>
              <CompareRow label="Cabinet Style" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground font-medium">
                    {pricingData[q.location]?.name || q.location || '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Style Multiplier" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {pricingData[q.location]?.multiplier ? `×${pricingData[q.location].multiplier}` : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Cabinet Count" cols={quotes.length}>
                {quotes.map((q) => {
                  const count = (q.selected_cabinets as any[])?.reduce((s: number, c: any) => s + (c.qty || 0), 0) || 0;
                  return <span key={q.id} className="text-sm text-foreground">{count}</span>;
                })}
              </CompareRow>
              <CompareRow label="Custom Items" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {(q.custom_line_items as any[])?.length || 0}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Styled Subtotal" cols={quotes.length}>
                {quotes.map((q, i) => (
                  <span key={q.id} className="text-sm text-foreground font-medium">
                    {quoteCosts[i] ? fmt(quoteCosts[i]!.styledSubtotal) : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Hardware" cols={quotes.length}>
                {quotes.map((q, i) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {quoteCosts[i] ? fmt(quoteCosts[i]!.hardwareTotal) : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Delivery" cols={quotes.length}>
                {quotes.map((q, i) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {quoteCosts[i] ? fmt(quoteCosts[i]!.deliveryFee) : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Installation" cols={quotes.length}>
                {quotes.map((q, i) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {quoteCosts[i] ? fmt(quoteCosts[i]!.installationFee) : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Flat-rate Total" cols={quotes.length}>
                {quotes.map((q, i) => (
                  <span key={q.id} className="text-sm text-foreground font-medium">
                    {quoteCosts[i] ? fmt(quoteCosts[i]!.flatRateTotal) : '—'}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Discount" cols={quotes.length}>
                {quotes.map((q) => {
                  const d = q.discount as any;
                  if (!d?.enabled || !d?.value) return <span key={q.id} className="text-sm text-muted-foreground">None</span>;
                  return (
                    <span key={q.id} className="text-sm text-primary font-medium">
                      {d.type === 'percentage' ? `${d.value}%` : fmt(d.value)}
                      {d.label ? ` (${d.label})` : ''}
                    </span>
                  );
                })}
              </CompareRow>
            </CompareSection>

            {/* Rooms section */}
            <CompareSection title="Room Details" id="rooms" expanded={expandedSections.has('rooms')} onToggle={toggle}>
              <CompareRow label="Kitchens" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {(q.analysis as any)?.kitchens?.length || 0}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Bathrooms" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {(q.analysis as any)?.bathrooms?.length || 0}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Closets" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {(q.analysis as any)?.closets?.length || 0}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Total Sq Ft" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {(q.analysis as any)?.totalSquareFootage?.toLocaleString() || '—'}
                  </span>
                ))}
              </CompareRow>
            </CompareSection>

            {/* Dates */}
            <CompareSection title="Timeline" id="dates" expanded={expandedSections.has('dates')} onToggle={toggle}>
              <CompareRow label="Created" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                ))}
              </CompareRow>
              <CompareRow label="Updated" cols={quotes.length}>
                {quotes.map((q) => (
                  <span key={q.id} className="text-sm text-foreground">
                    {new Date(q.updated_at).toLocaleDateString()}
                  </span>
                ))}
              </CompareRow>
            </CompareSection>

            {/* Difference summary */}
            {quotes.length === 2 && quotes[0].grand_total != null && quotes[1].grand_total != null && (
              <div className="mt-6 surface-card rounded-2xl p-5 text-center">
                <p className="text-sm text-muted-foreground">Price Difference</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {fmt(Math.abs(quotes[0].grand_total - quotes[1].grand_total))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quotes[0].grand_total < quotes[1].grand_total
                    ? `${quotes[0].name} is cheaper`
                    : quotes[0].grand_total > quotes[1].grand_total
                    ? `${quotes[1].name} is cheaper`
                    : 'Both quotes are the same price'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareView;
