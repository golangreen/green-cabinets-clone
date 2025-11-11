import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { CalendarIcon, Clock, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoleAssignmentDialogProps {
  open: boolean;
  role: 'admin' | 'moderator' | 'user';
  onClose: () => void;
  onConfirm: (expiresAt?: string) => void;
}

export const RoleAssignmentDialog = ({
  open,
  role,
  onClose,
  onConfirm,
}: RoleAssignmentDialogProps) => {
  const [isTemporary, setIsTemporary] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);

  const handleClose = () => {
    setIsTemporary(false);
    setExpirationDate(undefined);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(isTemporary && expirationDate ? expirationDate.toISOString() : undefined);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {role} Role</DialogTitle>
          <DialogDescription>
            Configure role assignment for the selected user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="temporary"
              checked={isTemporary}
              onCheckedChange={(checked) => setIsTemporary(checked as boolean)}
            />
            <Label htmlFor="temporary" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Temporary Role (with expiration)
            </Label>
          </div>

          {isTemporary && (
            <div className="space-y-2">
              <Label>Expiration Date</Label>
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
                    {expirationDate ? format(expirationDate, 'PPP') : 'Select expiration date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {expirationDate && (
                <p className="text-sm text-muted-foreground">
                  Role will expire on {format(expirationDate, 'PPP')} and be automatically removed
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isTemporary && !expirationDate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
