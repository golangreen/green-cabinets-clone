import jsPDF from 'jspdf';
import { pricingData, calculateCosts } from '@/lib/pricing';
import { fmtOpt as fmt } from '@/lib/utils';

const GREEN = [75, 108, 92] as const;
const DARK = [30, 35, 32] as const;
const GRAY = [120, 130, 125] as const;
const LIGHT_BG = [245, 247, 246] as const;
const WHITE = [255, 255, 255] as const;

async function loadLogoAsDataUrl(): Promise<string | null> {
  try {
    const resp = await fetch('/images/green-cabinets-logo-light.png');
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

interface CompareQuote {
  id: string;
  name: string;
  file_name: string;
  location: string;
  grand_total: number | null;
  created_at: string;
  updated_at: string;
  selected_cabinets: any[];
  custom_line_items: any[];
  delivery: any;
  installation: any;
  discount: any;
  analysis: any;
}

export async function generateComparisonPDF(quotes: CompareQuote[]) {
  const doc = new jsPDF({ orientation: quotes.length > 2 ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Header bar ──
  const logoDataUrl = await loadLogoAsDataUrl();
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 30, 'F');

  const textLeft = logoDataUrl ? margin + 16 : margin;
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', margin, 2, 13, 13); } catch {}
  }

  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GREEN CABINETS', textLeft, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Custom Kitchen & Bathroom Millwork', textLeft, 19);
  doc.text('10 Montieth St, Bushwick, Brooklyn, NY 11206', textLeft, 24);
  const rightX = pageW - margin;
  doc.text('orders@greencabinetsny.com', rightX, 13, { align: 'right' });
  doc.text('Golan: (718) 804-5488  |  Andy: (917) 819-5538', rightX, 19, { align: 'right' });
  y = 36;

  // ── Title ──
  doc.setTextColor(...DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Quote Comparison', margin, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`${quotes.length} quotes  •  Generated ${new Date().toLocaleDateString()}`, margin, y + 6);
  y += 14;

  // Layout columns
  const labelW = 44;
  const colW = (contentW - labelW) / quotes.length;
  const colX = (i: number) => margin + labelW + colW * i;

  // ── Quote header cards ──
  const totals = quotes.map(q => q.grand_total ?? Infinity);
  const lowestTotal = Math.min(...totals);

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  quotes.forEach((q, i) => {
    const x = colX(i) + 3;
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const name = q.name.length > 20 ? q.name.slice(0, 20) + '…' : q.name;
    doc.text(name, x, y + 7);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(q.file_name.length > 22 ? q.file_name.slice(0, 22) + '…' : q.file_name, x, y + 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(q.grand_total === lowestTotal ? GREEN[0] : DARK[0], q.grand_total === lowestTotal ? GREEN[1] : DARK[1], q.grand_total === lowestTotal ? GREEN[2] : DARK[2]);
    doc.text(fmt(q.grand_total), x, y + 19);
    if (q.grand_total === lowestTotal) {
      const tw = doc.getTextWidth(fmt(q.grand_total));
      doc.setFontSize(6);
      doc.setTextColor(...GREEN);
      doc.text(' ★ Lowest', x + tw + 1, y + 19);
    }
  });
  y += 28;

  // ── Helper: draw a section ──
  const checkPage = (needed: number) => {
    if (y + needed > pageH - 16) {
      doc.addPage();
      y = margin;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPage(12);
    doc.setFillColor(...GREEN);
    doc.roundedRect(margin, y, contentW, 7, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, y + 5);
    y += 10;
  };

  const drawRow = (label: string, values: string[], highlight = false) => {
    checkPage(7);
    if (highlight) {
      doc.setFillColor(240, 245, 242);
      doc.rect(margin, y, contentW, 6, 'F');
    }
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 3, y + 4);
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    values.forEach((v, i) => {
      doc.text(v, colX(i) + 3, y + 4);
    });
    doc.setDrawColor(230, 235, 232);
    doc.line(margin, y + 6, margin + contentW, y + 6);
    y += 7;
  };

  // Compute costs for each quote
  const quoteCosts = quotes.map((q) => {
    try {
      return calculateCosts(
        q.selected_cabinets || [],
        q.location || '',
        q.custom_line_items || [],
        q.delivery || { option: 'none', flatRate: 250, perItemRate: 15 },
        q.installation || { enabled: false, ratePerCabinet: 85, complexityMultiplier: 1.0 },
        q.discount || { enabled: false, type: 'percentage', value: 0, label: '' },
        (q as any).hardware || { type: 'none', applyAll: true, perCabinet: {} },
        (q as any).add_ons || [],
      );
    } catch { return null; }
  });

  // ── Cost Breakdown ──
  drawSectionHeader('Cost Breakdown');
  drawRow('Cabinet Style', quotes.map(q => pricingData[q.location]?.name || q.location || '—'));
  drawRow('Style Multiplier', quotes.map(q => pricingData[q.location]?.multiplier ? `×${pricingData[q.location].multiplier}` : '—'), true);
  drawRow('Cabinet Count', quotes.map(q => {
    const count = (q.selected_cabinets as any[])?.reduce((s: number, c: any) => s + (c.qty || 0), 0) || 0;
    return String(count);
  }));
  drawRow('Custom Items', quotes.map(q => String((q.custom_line_items as any[])?.length || 0)), true);
  drawRow('Styled Subtotal', quoteCosts.map(c => c ? fmt(c.styledSubtotal) : '—'));
  drawRow('Hardware', quoteCosts.map(c => c ? fmt(c.hardwareTotal) : '—'), true);
  drawRow('Delivery', quoteCosts.map(c => c ? fmt(c.deliveryFee) : '—'));
  drawRow('Installation', quoteCosts.map(c => c ? fmt(c.installationFee) : '—'), true);
  drawRow('Flat-rate Total', quoteCosts.map(c => c ? fmt(c.flatRateTotal) : '—'));
  drawRow('Discount', quotes.map(q => {
    const d = q.discount as any;
    if (!d?.enabled || !d?.value) return 'None';
    const val = d.type === 'percentage' ? `${d.value}%` : fmt(d.value);
    return d.label ? `${val} (${d.label})` : val;
  }), true);
  drawRow('Grand Total', quotes.map(q => fmt(q.grand_total)), true);

  // ── Room Details ──
  drawSectionHeader('Room Details');
  drawRow('Kitchens', quotes.map(q => String((q.analysis as any)?.kitchens?.length || 0)));
  drawRow('Bathrooms', quotes.map(q => String((q.analysis as any)?.bathrooms?.length || 0)), true);
  drawRow('Closets', quotes.map(q => String((q.analysis as any)?.closets?.length || 0)));
  drawRow('Total Sq Ft', quotes.map(q => (q.analysis as any)?.totalSquareFootage?.toLocaleString() || '—'), true);

  // ── Timeline ──
  drawSectionHeader('Timeline');
  drawRow('Created', quotes.map(q => new Date(q.created_at).toLocaleDateString()));
  drawRow('Updated', quotes.map(q => new Date(q.updated_at).toLocaleDateString()), true);

  // ── Price difference (2 quotes) ──
  if (quotes.length === 2 && quotes[0].grand_total != null && quotes[1].grand_total != null) {
    y += 4;
    checkPage(18);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Price Difference:', margin + contentW / 2 - 20, y + 6);
    doc.setTextColor(...DARK);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const diff = Math.abs(quotes[0].grand_total - quotes[1].grand_total);
    doc.text(fmt(diff), margin + contentW / 2 + 15, y + 6);
    const cheaper = quotes[0].grand_total < quotes[1].grand_total ? quotes[0].name : quotes[0].grand_total > quotes[1].grand_total ? quotes[1].name : null;
    if (cheaper) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(`${cheaper} is cheaper`, margin + contentW / 2, y + 12, { align: 'center' });
    }
    y += 18;
  }

  // ── Footer ──
  const footY = pageH - 10;
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'italic');
  doc.text('Automated comparison based on Green Cabinets pricing. Final pricing may vary.', pageW / 2, footY, { align: 'center' });
  doc.text('greencabinetsny.com', pageW / 2, footY + 4, { align: 'center' });

  doc.save(`Green-Cabinets-Comparison-${Date.now()}.pdf`);
}
