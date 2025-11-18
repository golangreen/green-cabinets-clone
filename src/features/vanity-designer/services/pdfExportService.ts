import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { logger } from '@/lib/logger';

interface VanityConfigForPDF {
  brand: string;
  finish: string;
  width: number;
  height: number;
  depth: number;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  includeRoom: boolean;
  roomLength: string;
  roomWidth: string;
  floorType: string;
  state: string;
}

interface PricingForPDF {
  basePrice: number;
  wallPrice: number;
  floorPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
}

export const generateVanityQuotePDF = async (
  config: VanityConfigForPDF,
  pricing: PricingForPDF,
  previewElement: HTMLElement | null
): Promise<jsPDF> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFillColor(34, 89, 48); // Primary green color
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Green Cabinets', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Custom Vanity Quote', pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;

  // Capture 3D Preview
  if (previewElement) {
    try {
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8f9fa'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    } catch (error) {
      logger.error('Error capturing preview', error, { component: 'pdfExportService' });
    }
  }

  // Configuration Details
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Configuration Details', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const configDetails = [
    { label: 'Brand', value: config.brand },
    { label: 'Finish', value: config.finish },
    { label: 'Dimensions', value: `${config.width}" W × ${config.height}" H × ${config.depth}" D` },
    { label: 'Door Style', value: config.doorStyle },
    { label: 'Number of Drawers', value: config.numDrawers.toString() },
    { label: 'Handle Style', value: config.handleStyle },
  ];

  if (config.includeRoom) {
    configDetails.push(
      { label: 'Room Dimensions', value: `${config.roomLength}' × ${config.roomWidth}'` },
      { label: 'Floor Type', value: config.floorType }
    );
  }

  configDetails.push({ label: 'Location', value: config.state || 'Not specified' });

  configDetails.forEach(detail => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${detail.label}:`, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(detail.value, 80, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Pricing Breakdown
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 50, 'F');

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Price Breakdown', 25, yPosition + 5);
  yPosition += 15;

  pdf.setFontSize(11);
  const pricingDetails = [
    { label: 'Vanity Base Price', value: pricing.basePrice },
  ];

  if (pricing.wallPrice > 0) {
    pricingDetails.push({ label: 'Wall Finishing', value: pricing.wallPrice });
  }
  if (pricing.floorPrice > 0) {
    pricingDetails.push({ label: 'Flooring', value: pricing.floorPrice });
  }

  pricingDetails.forEach(detail => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(detail.label, 25, yPosition);
    pdf.text(`$${detail.value.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
    yPosition += 7;
  });

  // Total
  yPosition += 5;
  pdf.setDrawColor(0, 0, 0);
  pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
  yPosition += 5;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 89, 48);
  pdf.text('Total Estimate', 25, yPosition);
  pdf.text(`$${pricing.totalPrice.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });

  // Footer
  yPosition = pageHeight - 20;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('This is an estimate only. Final pricing may vary based on specific requirements.', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });
  pdf.text('Green Cabinets | (914) 241-7336 | greencabinetsny@gmail.com', pageWidth / 2, yPosition + 10, { align: 'center' });

  // Save PDF
  const filename = `vanity-quote-${Date.now()}.pdf`;
  pdf.save(filename);
  
  // Return the PDF document for email attachment
  return pdf;
};
