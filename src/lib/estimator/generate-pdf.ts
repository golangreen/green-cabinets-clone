import jsPDF from 'jspdf';
import type { CostBreakdown, SelectedCabinet } from '@/lib/estimator/types';
import { pricingData, getCategoryGroup } from '@/lib/estimator/pricing';
import { fmt } from '@/lib/estimator/utils';
import { cabinetLookup } from '@/lib/estimator/catalog-data';

const GREEN = [75, 108, 92] as const;
const DARK = [30, 35, 32] as const;
const GRAY = [120, 130, 125] as const;
const LIGHT_BG = [245, 247, 246] as const;
const WHITE = [255, 255, 255] as const;

async function loadLogoAsDataUrl(variant: 'dark' | 'light' = 'dark'): Promise<string | null> {
  try {
    const resp = await fetch(`/images/green-cabinets-logo-${variant}.png`);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function generateQuotePDF(
  costs: CostBreakdown,
  location: string,
  fileName: string,
  projectNotes: string = '',
  selectedCabinets: SelectedCabinet[] = [],
  blueprintDataUrls: string[] = [],
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const locData = pricingData[location];
  const date = new Date().toLocaleDateString();
  const validUntil = new Date(Date.now() + 30 * 86400000).toLocaleDateString();

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Header — centered logo with contact info on sides ──
  const logoDataUrl = await loadLogoAsDataUrl('dark');
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setDrawColor(220, 225, 222);
  doc.line(0, 36, pageW, 36);

  if (logoDataUrl) {
    const logoW = 40;
    const logoH = 14;
    const logoX = (pageW - logoW) / 2;
    try { doc.addImage(logoDataUrl, 'PNG', logoX, 4, logoW, logoH); } catch {}
  }

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Custom Kitchen & Bathroom Millwork — Brooklyn, NY', pageW / 2, 23, { align: 'center' });

  // Left side — address
  doc.setFontSize(7);
  doc.text('10 Montieth St, Bushwick', margin, 28);
  doc.text('Brooklyn, NY 11206', margin, 32);

  // Right side — contact
  const rightX = pageW - margin;
  doc.text('orders@greencabinetsny.com', rightX, 28, { align: 'right' });
  doc.text('(718) 804-5488 | (917) 819-5538', rightX, 32, { align: 'right' });

  y = 42;

  // ── Title ──
  doc.setTextColor(...DARK);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Cost Estimate', margin, y);
  y += 10;

  // ── Project info box — 4 equal columns ──
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);

  const infoY = y + 6;
  const col = contentW / 4;
  const labels = ['Project', 'Cabinet Style', 'Date', 'Valid Until'];
  const values = [fileName, locData?.name || location, date, validUntil];
  labels.forEach((label, i) => {
    const x = margin + col * i + 5;
    doc.text(label, x, infoY);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(values[i], x, infoY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
  });
  y += 28;

  // ── Blueprint Thumbnails ──
  if (blueprintDataUrls.length > 0) {
    checkPage(70);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, y, contentW, 6, 2, 2, 'F');
    doc.setTextColor(...GREEN);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Blueprint${blueprintDataUrls.length > 1 ? 's' : ''}`, margin + 4, y + 4.5);
    y += 8;

    for (const dataUrl of blueprintDataUrls) {
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = dataUrl;
        });
        const maxW = contentW;
        const maxH = 55;
        const scale = Math.min(maxW / img.naturalWidth, maxH / (img.naturalHeight * (maxW / img.naturalWidth)));
        const imgW = Math.min(maxW, img.naturalWidth * scale * (maxW / img.naturalWidth));
        const imgH = (img.naturalHeight / img.naturalWidth) * imgW;

        checkPage(Math.min(imgH, maxH) + 6);
        doc.addImage(dataUrl, 'JPEG', margin, y, imgW, Math.min(imgH, maxH));
        y += Math.min(imgH, maxH) + 4;
      } catch {
        // Skip image if it fails to load
      }
    }

    // Legend
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const legendY = y + 1;
    // Green dot + label
    doc.setFillColor(22, 163, 74);
    doc.circle(margin + 3, legendY - 1.2, 1.8, 'F');
    doc.setTextColor(22, 163, 74);
    doc.text('✓  In catalog / selected', margin + 7, legendY);
    // Red dot + label
    doc.setFillColor(220, 38, 38);
    doc.circle(margin + 55, legendY - 1.2, 1.8, 'F');
    doc.setTextColor(220, 38, 38);
    doc.text('✗  Not in catalog / not chosen — not priced in this quote', margin + 59, legendY);
    y += 8;
  }

  // ── Section title ──
  doc.setFillColor(...GREEN);
  doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cabinet Line Items`, margin + 5, y + 6.5);
  y += 14;

  // ── Table header ──
  const c1 = margin + 3;
  const c2 = margin + 25;
  const c3 = margin + 105;
  const c4 = margin + 120;
  const c5 = margin + 145;

  doc.setFillColor(230, 235, 232);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Model', c1, y + 5);
  doc.text('Description', c2, y + 5);
  doc.text('Qty', c3, y + 5);
  doc.text('Unit Price', c4, y + 5);
  doc.text('Line Total', c5, y + 5);
  y += 9;

  // ── Table rows with category group headers ──
  let lastGroup = '';
  costs.items.forEach((item) => {
    const group = getCategoryGroup(item.model);
    if (group !== lastGroup) {
      lastGroup = group;
      checkPage(14);
      y += 2;
      doc.setFillColor(235, 240, 237);
      doc.rect(margin, y, contentW, 7, 'F');
      doc.setTextColor(...GREEN);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(group.toUpperCase(), c1, y + 5);
      y += 9;
    }
    checkPage(8);
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const finishTag = item.finishSide !== 'none'
      ? ` [${item.finishSide === 'left' ? 'Fin.L' : item.finishSide === 'right' ? 'Fin.R' : 'Fin.L+R'}]`
      : '';
    const hwTag = item.hardwareType !== 'none'
      ? ` [${item.hardwareType === 'finger-pull' ? 'F.Pull' : item.hardwareType.charAt(0).toUpperCase() + item.hardwareType.slice(1)}×${item.doors + item.drawers}]`
      : '';
    const ddTag = (item.doors + item.drawers) > 0
      ? ` (${item.doors > 0 ? item.doors + 'D' : ''}${item.doors > 0 && item.drawers > 0 ? '+' : ''}${item.drawers > 0 ? item.drawers + 'Dr' : ''})`
      : '';
    const glassTag = item.glassDoors ? ` [Glass×${item.doors}]` : '';
    const shelfTag = item.pullOutShelves > 0 ? ` [Shelf×${item.pullOutShelves}]` : '';
    doc.text(item.model + finishTag + hwTag + ddTag + glassTag + shelfTag, c1, y + 4);
    doc.text(item.description.length > 38 ? item.description.slice(0, 38) + '…' : item.description, c2, y + 4);
    doc.text(String(item.qty), c3, y + 4);
    doc.text(fmt(item.unitPrice), c4, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(item.lineTotal), c5, y + 4);
    doc.setDrawColor(220, 225, 222);
    doc.line(margin, y + 6, margin + contentW, y + 6);
    y += 8;
  });

  // ── Custom line items ──
  if (costs.customItems.length > 0) {
    checkPage(12);
    y += 2;
    doc.setFillColor(...GREEN);
    doc.roundedRect(margin, y, contentW, 7, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Custom Line Items', margin + 5, y + 5);
    y += 10;

    costs.customItems.forEach((item) => {
      checkPage(8);
      doc.setTextColor(...DARK);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Custom', c1, y + 4);
      doc.text(item.description.length > 38 ? item.description.slice(0, 38) + '…' : item.description, c2, y + 4);
      doc.text(String(item.qty), c3, y + 4);
      doc.text(fmt(item.unitPrice), c4, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(item.lineTotal), c5, y + 4);
      doc.setDrawColor(220, 225, 222);
      doc.line(margin, y + 6, margin + contentW, y + 6);
      y += 8;
    });
  }

  // ── Subtotal + adjustments (styled vs flat-rate) ──
  y += 4;
  const rX = margin + contentW - 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);

  // Style-adjusted section
  if (costs.locationMultiplier !== 1) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text(`STYLE-ADJUSTED (${costs.locationName} ×${costs.locationMultiplier})`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    y += 6;
  }

  doc.text(`Cabinet Subtotal: ${fmt(costs.subtotal)}`, rX, y, { align: 'right' });
  y += 6;
  if (costs.customSubtotal > 0) {
    doc.text(`Custom Items: +${fmt(costs.customSubtotal)}`, rX, y, { align: 'right' });
    y += 6;
  }
  if (costs.finishSideTotal > 0) {
    doc.text(`Finish-side surcharges — +${fmt(costs.finishSideTotal)}`, rX, y, { align: 'right' });
    y += 6;
  }
  if (costs.glassDoorTotal > 0) {
    doc.text(`Glass doors — +${fmt(costs.glassDoorTotal)}`, rX, y, { align: 'right' });
    y += 6;
  }
  if (costs.pullOutShelfTotal > 0) {
    doc.text(`Pull-out shelves — +${fmt(costs.pullOutShelfTotal)}`, rX, y, { align: 'right' });
    y += 6;
  }
  if (costs.addOnsTotal > 0) {
    doc.text(`Trim & panels — +${fmt(costs.addOnsTotal)}`, rX, y, { align: 'right' });
    y += 6;
  }

  // Styled subtotal line
  if (costs.locationMultiplier !== 1) {
    doc.setDrawColor(...GREEN);
    doc.line(margin + contentW * 0.5, y, margin + contentW, y);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(`Styled Subtotal: ${fmt(costs.styledSubtotal)}`, rX, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    y += 8;
  }

  // Flat-rate section
  if (costs.flatRateTotal > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text('FLAT-RATE (NO STYLE ADJUSTMENT)', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    y += 6;

    if (costs.hardwareTotal > 0) {
      doc.text(`Door/drawer hardware — +${fmt(costs.hardwareTotal)}`, rX, y, { align: 'right' });
      y += 6;
    }
    if (costs.deliveryFee > 0) {
      doc.text(`Delivery / Shipping — +${fmt(costs.deliveryFee)}`, rX, y, { align: 'right' });
      y += 6;
    }
    if (costs.installationFee > 0) {
      doc.text(`Installation labor — +${fmt(costs.installationFee)}`, rX, y, { align: 'right' });
      y += 6;
    }
  }

  if (costs.discountAmount > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text(`${costs.discountLabel || 'Discount'}: −${fmt(costs.discountAmount)}`, rX, y, { align: 'right' });
    doc.setTextColor(...GRAY);
    y += 6;
  }

  // ── Grand Total ──
  checkPage(22);
  y += 4;
  doc.setFillColor(...GREEN);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Project Cost', margin + 8, y + 11);
  doc.setFontSize(18);
  doc.text(fmt(costs.grandTotal), margin + contentW - 8, y + 12, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Cabinets only — installation separate', margin + 8, y + 16);
  y += 26;

  // ── Project Notes ──
  if (projectNotes) {
    checkPage(20);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, y, contentW, 6, 2, 2, 'F');
    doc.setTextColor(...GREEN);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Notes / Special Instructions', margin + 4, y + 4.5);
    y += 8;

    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(projectNotes, contentW - 8);
    for (const line of noteLines) {
      checkPage(5);
      doc.text(line, margin + 4, y + 3);
      y += 4.5;
    }
    y += 4;
  }

  // ── Blueprint Cabinet Checklist ──
  if (selectedCabinets.length > 0) {
    const matched = selectedCabinets.filter(c => !!cabinetLookup[c.model]);
    const unmatched = selectedCabinets.filter(c => !cabinetLookup[c.model]);

    checkPage(20);
    doc.setFillColor(...GREEN);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Blueprint Cabinet Checklist', margin + 5, y + 6.5);
    y += 14;

    // Summary badges
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(`✓ ${matched.length} in catalog`, margin + 3, y);
    if (unmatched.length > 0) {
      doc.setTextColor(220, 38, 38); // red-600
      doc.text(`✗ ${unmatched.length} not in catalog`, margin + 45, y);
    }
    y += 6;

    // Table header
    doc.setFillColor(230, 235, 232);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('#', c1, y + 5);
    doc.text('Status', margin + 10, y + 5);
    doc.text('Model', margin + 28, y + 5);
    doc.text('Qty', c3, y + 5);
    doc.text('Description', margin + 115, y + 5);
    y += 9;

    // Matched items
    matched.forEach((cab, i) => {
      checkPage(8);
      const info = cabinetLookup[cab.model];
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(String(i + 1), c1, y + 4);
      doc.text('✓', margin + 12, y + 4);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(cab.model, margin + 28, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`×${cab.qty}`, c3, y + 4);
      doc.setTextColor(...GRAY);
      const desc = info?.description || '';
      doc.text(desc.length > 30 ? desc.slice(0, 30) + '…' : desc, margin + 115, y + 4);
      doc.setDrawColor(220, 225, 222);
      doc.line(margin, y + 6, margin + contentW, y + 6);
      y += 8;
    });

    // Unmatched items
    unmatched.forEach((cab, i) => {
      checkPage(8);
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(String(matched.length + i + 1), c1, y + 4);
      doc.text('✗', margin + 12, y + 4);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(cab.model, margin + 28, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`×${cab.qty}`, c3, y + 4);
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'italic');
      doc.text('Not in catalog', margin + 115, y + 4);
      doc.setDrawColor(220, 225, 222);
      doc.line(margin, y + 6, margin + contentW, y + 6);
      y += 8;
    });

    y += 4;
  }

  // ── Footer — branded dark bar with light logo ──
  const footerLogoDataUrl = await loadLogoAsDataUrl('light');
  const footH = 26;
  const footY = pageH - footH;
  doc.setFillColor(...DARK);
  doc.rect(0, footY, pageW, footH, 'F');

  if (footerLogoDataUrl) {
    const fLogoW = 22;
    const fLogoH = 12;
    const fLogoX = (pageW - fLogoW) / 2;
    try { doc.addImage(footerLogoDataUrl, 'PNG', fLogoX, footY + 2, fLogoW, fLogoH); } catch {}
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 185);
  doc.text('(718) 484-8491  |  greencabinets@gmail.com  |  greencabinetsny.com  |  Brooklyn, NY', pageW / 2, footY + 17, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(...GRAY);
  doc.text(`© ${new Date().getFullYear()} Green Cabinets. Automated estimate — final pricing may vary. Quote valid 30 days.`, pageW / 2, footY + 22, { align: 'center' });

  doc.save(`Green-Cabinets-Quote-${Date.now()}.pdf`);
}