/**
 * finishComparePdf — builds the one-page "comparison summary" output for the
 * CompareDialog: a plain-text version (for clipboard / email) and a styled
 * single-page PDF (for download / printing / sending to a contractor).
 *
 * Design goals:
 *  - One US Letter page, max 4 panels side by side.
 *  - Brand-coloured header bar (Green Cabinets green #5C7650).
 *  - Each column shows: color swatch, brand, name, code, color family, finish.
 *  - Footer: showroom address + contact + the shareable URL.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MaterialPanel } from "@/types/materials";

const BRAND_GREEN: [number, number, number] = [92, 118, 80]; // #5C7650
const TEXT_DARK: [number, number, number] = [26, 26, 26];
const MUTED: [number, number, number] = [102, 102, 102];

export function buildCompareText(panels: MaterialPanel[], shareUrl: string): string {
  const header = `My Finish Selection — Green Cabinets NY`;
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const lines = panels.map((p, i) => {
    return [
      `${i + 1}. ${p.brand} — ${p.name}`,
      `   Code:         ${p.codes.join(", ")}`,
      `   Color family: ${p.category}`,
      `   Finish:       ${p.finish}`,
      `   Catalog:      ${p.detailUrl}`,
    ].join("\n");
  });
  return [
    header,
    date,
    "",
    ...lines,
    "",
    `Shareable link: ${shareUrl}`,
    "",
    "Bring these codes to our Bushwick showroom for live samples,",
    "or reply with this list and we'll quote pricing & availability.",
    "",
    "Green Cabinets NY · orders@greencabinetsny.com",
  ].join("\n");
}

/**
 * Resolves a MaterialPanel's swatch source to a data URL that jsPDF can embed.
 * Order: hi-res image (CORS permitting) → fallback hex color rectangle.
 */
async function resolveSwatchDataUrl(
  panel: MaterialPanel,
): Promise<{ kind: "image"; dataUrl: string; format: "JPEG" | "PNG" } | { kind: "color"; hex: string }> {
  if (panel.thumb) {
    try {
      const blob = await fetch(panel.thumb, { mode: "cors" }).then((r) => {
        if (!r.ok) throw new Error("bad status");
        return r.blob();
      });
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      const format = blob.type.includes("png") ? "PNG" : "JPEG";
      return { kind: "image", dataUrl, format };
    } catch {
      /* fall through */
    }
  }
  return { kind: "color", hex: panel.swatchHex ?? "#dddddd" };
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length !== 6) return [221, 221, 221];
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
}

export async function downloadComparePdf(
  panels: MaterialPanel[],
  shareUrl: string,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 612
  const pageHeight = doc.internal.pageSize.getHeight(); // 792
  const margin = 36;

  // ── Header bar ────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Green Cabinets NY", margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Finish Comparison Summary", margin, 48);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(10);
  doc.text(today, pageWidth - margin, 30, { align: "right" });
  doc.text(`${panels.length} ${panels.length === 1 ? "decor" : "decors"}`, pageWidth - margin, 46, { align: "right" });

  // ── Swatch row ────────────────────────────────────────────────────────
  const swatches = await Promise.all(panels.map(resolveSwatchDataUrl));
  const colsTop = 96;
  const gap = 12;
  const usableWidth = pageWidth - margin * 2 - gap * (panels.length - 1);
  const colWidth = usableWidth / panels.length;
  const swatchHeight = Math.min(colWidth, 150);

  panels.forEach((p, i) => {
    const x = margin + i * (colWidth + gap);
    const sw = swatches[i];

    // Outer card border
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, colsTop, colWidth, swatchHeight + 110, 4, 4, "S");

    // Swatch
    if (sw.kind === "image") {
      try {
        doc.addImage(sw.dataUrl, sw.format, x, colsTop, colWidth, swatchHeight);
      } catch {
        const [r, g, b] = hexToRgb(p.swatchHex ?? "#dddddd");
        doc.setFillColor(r, g, b);
        doc.rect(x, colsTop, colWidth, swatchHeight, "F");
      }
    } else {
      const [r, g, b] = hexToRgb(sw.hex);
      doc.setFillColor(r, g, b);
      doc.rect(x, colsTop, colWidth, swatchHeight, "F");
    }

    // Text block under swatch
    let ty = colsTop + swatchHeight + 16;
    doc.setTextColor(...BRAND_GREEN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(p.brand.toUpperCase(), x + 8, ty);

    ty += 12;
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(11);
    const nameLines = doc.splitTextToSize(p.name, colWidth - 16);
    doc.text(nameLines.slice(0, 2), x + 8, ty);

    ty += 12 * Math.min(nameLines.length, 2) + 6;
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const codeLines = doc.splitTextToSize(p.codes.join(", "), colWidth - 16);
    doc.text(codeLines.slice(0, 2), x + 8, ty);
  });

  // ── Details table below the cards ────────────────────────────────────
  autoTable(doc, {
    startY: colsTop + swatchHeight + 130,
    head: [["#", "Brand", "Name", "Code", "Color family", "Finish"]],
    body: panels.map((p, i) => [
      String(i + 1),
      p.brand,
      p.name,
      p.codes.join(", "),
      p.category,
      p.finish,
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5, textColor: TEXT_DARK },
    headStyles: { fillColor: BRAND_GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 247, 244] },
    margin: { left: margin, right: margin },
  });

  // ── Footer ────────────────────────────────────────────────────────────
  const footerY = pageHeight - 60;
  doc.setDrawColor(...BRAND_GREEN);
  doc.setLineWidth(1);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_GREEN);
  doc.text("Green Cabinets NY", margin, footerY + 14);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(8);
  doc.text("Bushwick Showroom · orders@greencabinetsny.com", margin, footerY + 26);
  doc.text("Bring these codes in to see live samples, or reply with this PDF for a quote.", margin, footerY + 38);

  doc.setTextColor(...MUTED);
  doc.setFontSize(7);
  const urlLines = doc.splitTextToSize(`Shareable link: ${shareUrl}`, pageWidth - margin * 2);
  doc.text(urlLines, margin, footerY + 50);

  const filename = `green-cabinets-finish-comparison-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
