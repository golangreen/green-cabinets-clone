/**
 * Active Users Display
 * Shows list of currently active collaborators
 */

import { Users } from 'lucide-react';
import { CollaborationUser } from './useCollaboration';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ActiveUsersProps {
  users: CollaborationUser[];
}

export const ActiveUsers = ({ users }: ActiveUsersProps) => {
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase();
  };

  if (users.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          <span>{users.length} active</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Active Collaborators</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.userId} className="flex items-center gap-2">
                <Avatar className="h-8 w-8" style={{ backgroundColor: user.color }}>
                  <AvatarFallback style={{ color: '#fff' }}>
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {user.selectedElement && (
                    <p className="text-xs text-muted-foreground">
                      Editing: {user.selectedElement}
                    </p>
                  )}
                </div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
