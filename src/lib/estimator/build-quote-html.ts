import type { CostBreakdown, SelectedCabinet } from '@/lib/estimator/types';
import { getCategoryGroup } from '@/lib/estimator/pricing';
import { cabinetLookup } from '@/lib/estimator/catalog-data';

export interface BuildQuoteHtmlParams {
  costs: CostBreakdown;
  locationName: string;
  locationMultiplier: number;
  fileName: string;
  customerName?: string;
  customerEmail?: string;
  projectNotes?: string;
  selectedCabinets?: SelectedCabinet[];
  blueprintImageUrls?: string[];
}

export function buildQuoteHtml({
  costs,
  locationName,
  locationMultiplier,
  fileName,
  customerName,
  customerEmail,
  projectNotes,
  selectedCabinets,
  blueprintImageUrls = [],
}: BuildQuoteHtmlParams): string {
  const date = new Date().toLocaleDateString();
  const validUntil = new Date(Date.now() + 30 * 86400000).toLocaleDateString();

  let lastGroup = '';
  const rows = costs.items
    .map((i) => {
      const group = getCategoryGroup(i.model);
      const groupRow =
        group !== lastGroup
          ? `<tr><td colspan="5" style="padding:10px 6px 4px;font-weight:bold;font-size:12px;color:#4B6C5C;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e8f5e9;">${group}</td></tr>`
          : '';
      lastGroup = group;
      const finishLabel =
        i.finishSide !== 'none'
          ? ` <span style="background:#e8f5e9;color:#4B6C5C;padding:1px 4px;border-radius:3px;font-size:11px;">${i.finishSide === 'left' ? 'Finish L' : i.finishSide === 'right' ? 'Finish R' : 'Finish L+R'}</span>`
          : '';
      const hwLabel =
        i.hardwareType !== 'none'
          ? ` <span style="background:#f3f4f6;color:#666;padding:1px 4px;border-radius:3px;font-size:11px;">${i.hardwareType === 'finger-pull' ? 'Finger Pull' : i.hardwareType}${i.doors + i.drawers > 0 ? ' ×' + (i.doors + i.drawers) : ''}</span>`
          : '';
      const ddLabel =
        i.doors + i.drawers > 0
          ? ` <span style="color:#888;font-size:10px;">(${i.doors > 0 ? i.doors + 'D' : ''}${i.doors > 0 && i.drawers > 0 ? '+' : ''}${i.drawers > 0 ? i.drawers + 'Dr' : ''})</span>`
          : '';
      return `${groupRow}<tr><td style="padding:6px;border-bottom:1px solid #eee;">${i.model}${finishLabel}${hwLabel}${ddLabel}</td><td style="padding:6px;border-bottom:1px solid #eee;">${i.description}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${i.unitPrice}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${i.lineTotal.toLocaleString()}</td></tr>`;
    })
    .join('');

  const customRows = costs.customItems
    .map(
      (i) =>
        `<tr><td style="padding:6px;border-bottom:1px solid #eee;"><em>Custom</em></td><td style="padding:6px;border-bottom:1px solid #eee;">${i.description}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${i.unitPrice}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$${i.lineTotal.toLocaleString()}</td></tr>`,
    )
    .join('');

  const logoWhiteBgUrl =
    'https://rbuezktglzudxnafespc.supabase.co/storage/v1/object/public/email-assets/green-cabinets-logo-white-bg.png';
  const logoDarkBgUrl =
    'https://rbuezktglzudxnafespc.supabase.co/storage/v1/object/public/email-assets/green-cabinets-logo-white-bg.png';

  const trimmedNotes = projectNotes?.trim() ?? '';

  return `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-bottom:none;border-radius:8px 8px 0 0;overflow:hidden;">
          <tr><td align="center" style="padding:0;">
            <img src="${logoWhiteBgUrl}" alt="Green Cabinets" width="200" style="display:block;width:200px;height:auto;" />
          </td></tr>
          <tr><td align="center" style="padding:4px 20px 14px;font-size:12px;color:#6b7280;">Custom Kitchen &amp; Bathroom Millwork — Brooklyn, NY</td></tr>
        </table>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#1E2320;margin:0 0 16px;">New Quote Request</h2>
          ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
          ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
          <p><strong>Project:</strong> ${fileName}</p>
          <p><strong>Cabinet Style:</strong> ${locationName} (${locationMultiplier}×)</p>
          <p><strong>Date:</strong> ${date} | <strong>Valid Until:</strong> ${validUntil}</p>
          ${trimmedNotes ? `<div style="margin-top:12px;padding:10px;background:#f9fafb;border-left:3px solid #4B6C5C;border-radius:4px;"><p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#4B6C5C;">Project Notes / Special Instructions</p><p style="margin:0;font-size:12px;color:#333;white-space:pre-wrap;">${trimmedNotes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p></div>` : ''}

          ${blueprintImageUrls.length > 0 ? `
            <div style="margin:16px 0;text-align:center;">
              <p style="font-size:11px;font-weight:bold;color:#4B6C5C;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Blueprint${blueprintImageUrls.length > 1 ? 's' : ''}</p>
              ${blueprintImageUrls.map((url, i) => `<img src="${url}" alt="Blueprint ${i + 1}" style="max-width:100%;max-height:300px;border:1px solid #e5e7eb;border-radius:6px;${i > 0 ? 'margin-top:8px;' : ''}" />`).join('\n              ')}
              <div style="margin-top:8px;display:flex;justify-content:center;gap:16px;font-size:11px;">
                <span style="color:#16a34a;font-weight:600;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#16a34a;margin-right:4px;vertical-align:middle;"></span>&#10003; In catalog / selected</span>
                <span style="color:#dc2626;font-weight:600;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#dc2626;margin-right:4px;vertical-align:middle;"></span>&#10007; Not in catalog / not chosen — not priced in this quote</span>
              </div>
            </div>
          ` : ''}

          <h3 style="color:#4B6C5C;border-bottom:2px solid #4B6C5C;padding-bottom:4px;">Cabinet Line Items</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="background:#f3f4f6;"><th style="text-align:left;padding:6px;">Model</th><th style="text-align:left;padding:6px;">Description</th><th style="text-align:center;padding:6px;">Qty</th><th style="text-align:right;padding:6px;">Unit</th><th style="text-align:right;padding:6px;">Total</th></tr>
            ${rows}
            ${customRows ? `<tr><td colspan="5" style="padding:8px 6px 4px;font-weight:bold;font-size:12px;color:#4B6C5C;">Custom Items</td></tr>${customRows}` : ''}
          </table>

          ${costs.locationMultiplier !== 1 ? `<p style="text-align:left;font-size:11px;font-weight:bold;color:#4B6C5C;text-transform:uppercase;letter-spacing:0.5px;margin-top:12px;">Style-Adjusted (${costs.locationName} ×${costs.locationMultiplier})</p>` : ''}
          <p style="text-align:right;margin-top:4px;"><strong>Cabinet Subtotal:</strong> $${costs.subtotal.toLocaleString()}</p>
          ${costs.customSubtotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Custom items — +$${costs.customSubtotal.toLocaleString()}</p>` : ''}
          ${costs.finishSideTotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Finish-side surcharges — +$${costs.finishSideTotal.toLocaleString()}</p>` : ''}
          ${costs.glassDoorTotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Glass doors — +$${costs.glassDoorTotal.toLocaleString()}</p>` : ''}
          ${costs.pullOutShelfTotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Pull-out shelves — +$${costs.pullOutShelfTotal.toLocaleString()}</p>` : ''}
          ${costs.addOnsTotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Trim & panels — +$${costs.addOnsTotal.toLocaleString()}</p>` : ''}
          ${costs.locationMultiplier !== 1 ? `<p style="text-align:right;font-size:12px;font-weight:bold;color:#1E2320;border-top:1px solid #4B6C5C;padding-top:4px;margin-top:4px;">Styled Subtotal: $${costs.styledSubtotal.toLocaleString()}</p>` : ''}
          ${costs.flatRateTotal > 0 ? `<p style="text-align:left;font-size:11px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-top:12px;">Flat-Rate (No Style Adjustment)</p>` : ''}
          ${costs.hardwareTotal > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Door/drawer hardware — +$${costs.hardwareTotal.toLocaleString()}</p>` : ''}
          ${costs.deliveryFee > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Delivery / Shipping — +$${costs.deliveryFee.toLocaleString()}</p>` : ''}
          ${costs.installationFee > 0 ? `<p style="text-align:right;font-size:12px;color:#666;">Installation labor — +$${costs.installationFee.toLocaleString()}</p>` : ''}
          ${costs.discountAmount > 0 ? `<p style="text-align:right;font-size:12px;color:#228B22;font-weight:bold;">${costs.discountLabel || 'Discount'} — −$${costs.discountAmount.toLocaleString()}</p>` : ''}

          ${selectedCabinets && selectedCabinets.length > 0 ? (() => {
            const matched = selectedCabinets.filter(c => !!cabinetLookup[c.model]);
            const unmatched = selectedCabinets.filter(c => !cabinetLookup[c.model]);
            const checklistRows = [
              ...matched.map((c, i) => {
                const info = cabinetLookup[c.model];
                return `<tr><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;"><span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background:#16a34a;color:white;font-size:9px;font-weight:bold;text-align:center;margin-right:4px;">${i + 1}</span><span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:3px;background:#16a34a;color:white;font-size:11px;font-weight:bold;text-align:center;">&#10003;</span></td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;font-weight:600;">${c.model}</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;text-align:center;">&times;${c.qty}</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:11px;color:#666;">${info?.description || ''}</td></tr>`;
              }),
              ...unmatched.map((c, i) => {
                return `<tr><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;"><span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background:#dc2626;color:white;font-size:9px;font-weight:bold;text-align:center;margin-right:4px;">${matched.length + i + 1}</span><span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:3px;background:#dc2626;color:white;font-size:11px;font-weight:bold;text-align:center;">&#10007;</span></td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;font-weight:600;">${c.model}</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:12px;text-align:center;">&times;${c.qty}</td><td style="padding:4px 6px;border-bottom:1px solid #eee;font-size:11px;color:#999;font-style:italic;">Not in catalog</td></tr>`;
              }),
            ].join('');
            return `
              <h3 style="color:#4B6C5C;border-bottom:2px solid #4B6C5C;padding-bottom:4px;margin-top:20px;">Blueprint Cabinet Checklist</h3>
              <div style="display:flex;gap:12px;margin-bottom:8px;">
                <span style="font-size:12px;color:#16a34a;font-weight:600;"><span style="display:inline-block;width:14px;height:14px;line-height:14px;border-radius:3px;background:#16a34a;color:white;font-size:10px;font-weight:bold;text-align:center;">&#10003;</span> ${matched.length} in catalog</span>
                ${unmatched.length > 0 ? `<span style="font-size:12px;color:#dc2626;font-weight:600;"><span style="display:inline-block;width:14px;height:14px;line-height:14px;border-radius:3px;background:#dc2626;color:white;font-size:10px;font-weight:bold;text-align:center;">&#10007;</span> ${unmatched.length} not in catalog</span>` : ''}
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr style="background:#f3f4f6;"><th style="text-align:left;padding:4px 6px;font-size:11px;">#</th><th style="text-align:left;padding:4px 6px;font-size:11px;">Model</th><th style="text-align:center;padding:4px 6px;font-size:11px;">Qty</th><th style="text-align:left;padding:4px 6px;font-size:11px;">Description</th></tr>
                ${checklistRows}
              </table>`;
          })() : ''}

          <div style="background:#4B6C5C;color:white;padding:16px;border-radius:8px;margin-top:16px;text-align:center;">
            <p style="margin:0;font-size:14px;">Total Project Cost</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:bold;">$${costs.grandTotal.toLocaleString()}</p>
          </div>

          <p style="font-size:11px;color:#888;margin-top:16px;">Automated estimate. Final pricing may vary. Quote valid 30 days.</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:0 0 8px 8px;overflow:hidden;border:1px solid #e5e7eb;border-top:none;">
          <tr><td align="center" style="padding:20px;background-color:#ffffff;">
            <img src="${logoDarkBgUrl}" alt="Green Cabinets" width="200" style="display:block;width:200px;height:auto;" />
          </td></tr>
          <tr><td align="center" style="background-color:#ffffff;padding:4px 20px;font-size:12px;color:#6b7280;">Custom Kitchen &amp; Bathroom Millwork</td></tr>
          <tr><td align="center" style="background-color:#ffffff;padding:2px 20px;font-size:12px;color:#374151;">📞 (718) 484-8491 &nbsp;|&nbsp; ✉️ <a href="mailto:greencabinets@gmail.com" style="color:#2d6a4f;text-decoration:none;">greencabinets@gmail.com</a></td></tr>
          <tr><td align="center" style="background-color:#ffffff;padding:2px 20px;font-size:12px;color:#374151;">📍 Brooklyn, NY</td></tr>
          <tr><td align="center" style="background-color:#ffffff;padding:2px 20px;font-size:12px;color:#374151;">🌐 <a href="https://www.greencabinetsny.com" style="color:#2d6a4f;text-decoration:none;">www.greencabinetsny.com</a></td></tr>
          <tr><td align="center" style="background-color:#ffffff;padding:12px 20px 20px;font-size:10px;color:#888;">© ${new Date().getFullYear()} Green Cabinets. All rights reserved.</td></tr>
        </table>
      </div>`;
}
