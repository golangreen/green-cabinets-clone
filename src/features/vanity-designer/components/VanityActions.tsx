import { Button } from "@/components/ui/button";
import { Save, Download, Mail, Share2 } from "lucide-react";

interface VanityActionsProps {
  onSave: () => void;
  onExportPDF: () => void;
  onEmailQuote: () => void;
  onShare: () => void;
  isExporting: boolean;
}

export const VanityActions = ({
  onSave,
  onExportPDF,
  onEmailQuote,
  onShare,
  isExporting,
}: VanityActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={onSave} 
        className="gap-2 bg-brand-teal/20 hover:bg-brand-teal/40 border border-brand-teal/60 hover:border-brand-teal text-brand-teal shadow-2xl hover:shadow-brand-teal/50 transition-all duration-300 hover:scale-105"
      >
        <Save className="h-4 w-4" />
        Save
      </Button>
      <Button 
        variant="outline" 
        className="gap-2 hover:bg-brand-teal/20 hover:text-brand-teal hover:border-brand-teal/60 transition-all duration-300"
        onClick={onExportPDF}
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Generating..." : "Export PDF"}
      </Button>
      <Button 
        variant="outline" 
        className="gap-2 hover:bg-brand-teal/20 hover:text-brand-teal hover:border-brand-teal/60 transition-all duration-300"
        onClick={onEmailQuote}
      >
        <Mail className="h-4 w-4" />
        Email Quote
      </Button>
      <Button 
        variant="outline" 
        className="gap-2 hover:bg-brand-teal/20 hover:text-brand-teal hover:border-brand-teal/60 transition-all duration-300"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
};
