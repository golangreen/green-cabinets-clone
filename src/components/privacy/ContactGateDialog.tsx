/**
 * Lightweight "I'm not a robot" gate shown before revealing phone/email.
 * No third-party keys required: it validates a trusted user gesture plus a
 * minimum interaction delay, which blocks scripted/headless harvesting.
 */
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Loader2 } from "lucide-react";
import { unlockContacts } from "./contactUnlock";

interface ContactGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
}

export default function ContactGateDialog({
  open,
  onOpenChange,
  onVerified,
}: ContactGateDialogProps) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openedAt = useRef<number>(0);

  useEffect(() => {
    if (open) {
      openedAt.current = Date.now();
      setChecking(false);
      setError(null);
    }
  }, [open]);

  const handleCheck = (event: React.MouseEvent | React.KeyboardEvent) => {
    // Untrusted (synthetic) events come from automation, not a person.
    if (!event.nativeEvent.isTrusted || Date.now() - openedAt.current < 300) {
      setError("Verification failed. Please try again.");
      return;
    }

    setError(null);
    setChecking(true);
    window.setTimeout(() => {
      unlockContacts();
      setChecking(false);
      onOpenChange(false);
      onVerified?.();
    }, 550);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Quick check
          </DialogTitle>
          <DialogDescription>
            Confirm you're a person and we'll show our phone number and email.
            This keeps our team spam-free.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <Checkbox
              checked={checking}
              disabled={checking}
              onClick={handleCheck}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCheck(e);
              }}
              aria-label="I am not a robot"
            />
            <span>I'm not a robot</span>
            {checking && (
              <Loader2
                className="ml-auto h-4 w-4 animate-spin text-primary"
                aria-hidden="true"
              />
            )}
          </label>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
