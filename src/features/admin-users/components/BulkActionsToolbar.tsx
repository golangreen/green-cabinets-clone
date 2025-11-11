import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, UserMinus } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  bulkRole: 'admin' | 'moderator' | 'user';
  onBulkRoleChange: (role: 'admin' | 'moderator' | 'user') => void;
  onBulkAdd: () => void;
  onBulkRemove: () => void;
  onClearSelection: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  bulkRole,
  onBulkRoleChange,
  onBulkAdd,
  onBulkRemove,
  onClearSelection,
}: BulkActionsToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <Badge variant="secondary" className="text-sm">
        {selectedCount} user(s) selected
      </Badge>
      <div className="flex items-center gap-2">
        <Select value={bulkRole} onValueChange={onBulkRoleChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={onBulkAdd}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Role
        </Button>
        <Button size="sm" variant="outline" onClick={onBulkRemove}>
          <UserMinus className="h-4 w-4 mr-2" />
          Remove Role
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
};
