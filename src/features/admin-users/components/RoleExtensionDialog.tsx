import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoleExtensionDialogProps {
  open: boolean;
  role: 'admin' | 'moderator' | 'user';
  currentExpiration: string;
  onClose: () => void;
  onConfirm: (newExpiresAt: string) => void;
}

export const RoleExtensionDialog = ({
  open,
  role,
  currentExpiration,
  onClose,
  onConfirm,
}: RoleExtensionDialogProps) => {
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open && currentExpiration) {
      setExpirationDate(new Date(currentExpiration));
    }
  }, [open, currentExpiration]);

  const handleClose = () => {
    setExpirationDate(undefined);
    onClose();
  };

  const handleConfirm = () => {
    if (expirationDate) {
      onConfirm(expirationDate.toISOString());
      handleClose();
    }
  };

  const daysDifference = expirationDate && currentExpiration
    ? Math.ceil(
        (expirationDate.getTime() - new Date(currentExpiration).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend {role} Role</DialogTitle>
          <DialogDescription>
            Select a new expiration date for this temporary role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Expiration</Label>
            <p className="text-sm text-muted-foreground">
              {currentExpiration && format(new Date(currentExpiration), 'PPP')}
            </p>
          </div>

          <div className="space-y-2">
            <Label>New Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !expirationDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, 'PPP') : 'Select new expiration date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  disabled={(date) =>
                    date < new Date() ||
                    (currentExpiration && date <= new Date(currentExpiration))
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {expirationDate && currentExpiration && daysDifference > 0 && (
              <p className="text-sm text-muted-foreground">
                Extension: {daysDifference} days
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !expirationDate ||
              (currentExpiration && expirationDate <= new Date(currentExpiration))
            }
          >
            <Clock className="h-4 w-4 mr-2" />
            Extend Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
