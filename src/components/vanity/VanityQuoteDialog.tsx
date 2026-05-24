import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

// Contact info schema — kept local since it's only used here
const contactSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name must be under 100 characters"),
  customerEmail: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255, "Email must be under 255 characters"),
  customerPhone: z
    .string()
    .trim()
    .max(30, "Phone must be under 30 characters")
    .regex(/^[\d\s()+\-.]*$/, "Phone can only contain digits and ()+-. ")
    .optional()
    .or(z.literal("")),
  additionalNotes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional()
    .or(z.literal("")),
});

type ContactFieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

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
}: VanityQuoteDialogProps) => {
  const [touched, setTouched] = useState<Record<keyof ContactFieldErrors, boolean>>({
    customerName: false,
    customerEmail: false,
    customerPhone: false,
    additionalNotes: false,
  });

  const validation = useMemo(
    () =>
      contactSchema.safeParse({
        customerName,
        customerEmail,
        customerPhone,
        additionalNotes,
      }),
    [customerName, customerEmail, customerPhone, additionalNotes],
  );

  const fieldErrors: ContactFieldErrors = useMemo(() => {
    if (validation.success) return {};
    const out: ContactFieldErrors = {};
    for (const issue of validation.error.errors) {
      const key = issue.path[0] as keyof ContactFieldErrors | undefined;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }, [validation]);

  const showError = (key: keyof ContactFieldErrors) =>
    (touched[key] || isSubmitAttempted) && fieldErrors[key];

  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitAttempted(true);
    if (!validation.success || isRequestingQuote) return;
    onSubmit();
  };

  const handleOpenChange = (next: boolean) => {
    if (isRequestingQuote) return; // lock while sending
    if (!next) setIsSubmitAttempted(false);
    onOpenChange(next);
  };

  const markTouched = (key: keyof ContactFieldErrors) =>
    setTouched((t) => ({ ...t, [key]: true }));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => isRequestingQuote && e.preventDefault()}
        onEscapeKeyDown={(e) => isRequestingQuote && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
          <DialogDescription>
            Fill in your contact information and we'll send you a detailed quote within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="customerName" className={showError("customerName") ? "text-destructive" : ""}>
              Full Name *
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              onBlur={() => markTouched("customerName")}
              placeholder="John Doe"
              maxLength={100}
              required
              disabled={isRequestingQuote}
              aria-invalid={!!showError("customerName")}
              aria-describedby={showError("customerName") ? "customerName-error" : undefined}
              className={showError("customerName") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {showError("customerName") && (
              <p id="customerName-error" role="alert" className="text-xs font-medium text-destructive">
                {fieldErrors.customerName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail" className={showError("customerEmail") ? "text-destructive" : ""}>
              Email *
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => onCustomerEmailChange(e.target.value)}
              onBlur={() => markTouched("customerEmail")}
              placeholder="john@example.com"
              maxLength={255}
              required
              disabled={isRequestingQuote}
              aria-invalid={!!showError("customerEmail")}
              aria-describedby={showError("customerEmail") ? "customerEmail-error" : undefined}
              className={showError("customerEmail") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {showError("customerEmail") && (
              <p id="customerEmail-error" role="alert" className="text-xs font-medium text-destructive">
                {fieldErrors.customerEmail}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone" className={showError("customerPhone") ? "text-destructive" : ""}>
              Phone (optional)
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              onBlur={() => markTouched("customerPhone")}
              placeholder="(555) 123-4567"
              maxLength={30}
              disabled={isRequestingQuote}
              aria-invalid={!!showError("customerPhone")}
              aria-describedby={showError("customerPhone") ? "customerPhone-error" : undefined}
              className={showError("customerPhone") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {showError("customerPhone") && (
              <p id="customerPhone-error" role="alert" className="text-xs font-medium text-destructive">
                {fieldErrors.customerPhone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes" className={showError("additionalNotes") ? "text-destructive" : ""}>
              Additional Notes (optional)
            </Label>
            <Textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => onAdditionalNotesChange(e.target.value)}
              onBlur={() => markTouched("additionalNotes")}
              placeholder="Any special requests or questions..."
              rows={3}
              maxLength={1000}
              disabled={isRequestingQuote}
              aria-invalid={!!showError("additionalNotes")}
              aria-describedby={showError("additionalNotes") ? "additionalNotes-error" : undefined}
              className={showError("additionalNotes") ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <div className="flex justify-between text-xs">
              {showError("additionalNotes") ? (
                <p id="additionalNotes-error" role="alert" className="font-medium text-destructive">
                  {fieldErrors.additionalNotes}
                </p>
              ) : <span />}
              <span className="text-muted-foreground">{additionalNotes.length}/1000</span>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p><strong>Configuration Summary:</strong></p>
            <p>Brand: {selectedBrand}</p>
            <p>Finish: {selectedFinish}</p>
            <p>Width: {widthInches.toFixed(2)}"</p>
            <p className="text-accent font-semibold">Estimated Total: ${totalPrice.toFixed(2)}</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isRequestingQuote}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRequestingQuote || !validation.success}
              aria-busy={isRequestingQuote}
              className="flex-1 bg-[#5C7650] hover:bg-[#5C7650]/80"
            >
              {isRequestingQuote ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                "Send Quote Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
