import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, UserMinus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserWithRoles, RoleDetail } from '../hooks/useUserManagement';

interface UserTableProps {
  users: UserWithRoles[];
  selectedUsers: Set<string>;
  onToggleUserSelection: (userId: string) => void;
  onToggleSelectAll: () => void;
  onAddRole: (userId: string, role: 'admin' | 'moderator' | 'user') => void;
  onRemoveRole: (userId: string, role: 'admin' | 'moderator' | 'user') => void;
  onExtendRole: (userId: string, role: 'admin' | 'moderator' | 'user', currentExpiration: string) => void;
  getRoleDetail: (user: UserWithRoles, role: string) => RoleDetail | undefined;
  isRoleExpiringSoon: (expiresAt: string | null) => boolean;
  searchTerm?: string;
}

export const UserTable = ({
  users,
  selectedUsers,
  onToggleUserSelection,
  onToggleSelectAll,
  onAddRole,
  onRemoveRole,
  onExtendRole,
  getRoleDetail,
  isRoleExpiringSoon,
  searchTerm,
}: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedUsers.size === users.length && users.length > 0}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all users"
              />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.user_id)}
                    onCheckedChange={() => onToggleUserSelection(user.user_id)}
                    aria-label={`Select ${user.email}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.length === 0 ? (
                      <Badge variant="outline">user</Badge>
                    ) : (
                      user.roles.map((role) => {
                        const roleDetail = getRoleDetail(user, role);
                        const isExpiring =
                          roleDetail?.expires_at && isRoleExpiringSoon(roleDetail.expires_at);

                        return (
                          <div key={role} className="flex flex-col gap-1">
                            <Badge
                              variant={role === 'admin' ? 'default' : 'secondary'}
                              className={cn(isExpiring && 'border-orange-500')}
                            >
                              {role}
                              {roleDetail?.is_temporary && (
                                <Clock className="h-3 w-3 ml-1 inline" />
                              )}
                            </Badge>
                            {roleDetail?.expires_at && (
                              <span
                                className={cn(
                                  'text-xs',
                                  isExpiring
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-muted-foreground'
                                )}
                              >
                                Expires: {format(new Date(roleDetail.expires_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end flex-wrap">
                    {!user.roles.includes('admin') ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddRole(user.user_id, 'admin')}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Admin
                      </Button>
                    ) : (
                      <>
                        {getRoleDetail(user, 'admin')?.expires_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onExtendRole(
                                user.user_id,
                                'admin',
                                getRoleDetail(user, 'admin')!.expires_at!
                              )
                            }
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Extend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveRole(user.user_id, 'admin')}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </>
                    )}
                    {!user.roles.includes('moderator') ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddRole(user.user_id, 'moderator')}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Moderator
                      </Button>
                    ) : (
                      <>
                        {getRoleDetail(user, 'moderator')?.expires_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onExtendRole(
                                user.user_id,
                                'moderator',
                                getRoleDetail(user, 'moderator')!.expires_at!
                              )
                            }
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Extend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveRole(user.user_id, 'moderator')}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
