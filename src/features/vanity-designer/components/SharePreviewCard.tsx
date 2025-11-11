import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface SharePreviewCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export const SharePreviewCard = ({ open, onOpenChange, shareUrl }: SharePreviewCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current && shareUrl) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch((error) => {
        console.error('Error generating QR code:', error);
        toast.error("Failed to generate QR code");
      });
    }
  }, [open, shareUrl]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'vanity-design-qr-code.png';
    link.href = url;
    link.click();
    
    toast.success("QR code downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Design</DialogTitle>
          <DialogDescription>
            Scan the QR code or copy the link to share your vanity design
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <canvas ref={canvasRef} />
          </div>
          
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>
          
          <div className="w-full p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground break-all">
              {shareUrl}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
