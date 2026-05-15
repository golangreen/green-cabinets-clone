import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface VanityQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  additionalNotes: string;
  selectedBrand: string;
  selectedFinish: string;
  widthInches: number;
  totalPrice: number;
  isRequestingQuote: boolean;
  onCustomerNameChange: (v: string) => void;
  onCustomerEmailChange: (v: string) => void;
  onCustomerPhoneChange: (v: string) => void;
  onAdditionalNotesChange: (v: string) => void;
  onSubmit: () => void;
}

export const VanityQuoteDialog = ({
  open,
  onOpenChange,
  customerName,
  customerEmail,
  customerPhone,
  additionalNotes,
  selectedBrand,
  selectedFinish,
  widthInches,
  totalPrice,
  isRequestingQuote,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onAdditionalNotesChange,
  onSubmit,
}: VanityQuoteDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Request a Quote</DialogTitle>
        <DialogDescription>
          Fill in your contact information and we'll send you a detailed quote within 24 hours.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name *</Label>
          <Input id="customerName" value={customerName} onChange={(e) => onCustomerNameChange(e.target.value)} placeholder="John Doe" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email *</Label>
          <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => onCustomerEmailChange(e.target.value)} placeholder="john@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone (optional)</Label>
          <Input id="customerPhone" type="tel" value={customerPhone} onChange={(e) => onCustomerPhoneChange(e.target.value)} placeholder="(555) 123-4567" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
          <Textarea id="additionalNotes" value={additionalNotes} onChange={(e) => onAdditionalNotesChange(e.target.value)} placeholder="Any special requests or questions..." rows={3} />
        </div>

        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
          <p><strong>Configuration Summary:</strong></p>
          <p>Brand: {selectedBrand}</p>
          <p>Finish: {selectedFinish}</p>
          <p>Width: {widthInches.toFixed(2)}"</p>
          <p className="text-[#5C7650] font-semibold">Estimated Total: ${totalPrice.toFixed(2)}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isRequestingQuote} className="flex-1 bg-[#5C7650] hover:bg-[#5C7650]/80">
            {isRequestingQuote ? "Sending..." : "Send Quote Request"}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
