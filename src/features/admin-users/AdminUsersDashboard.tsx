import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Shield } from 'lucide-react';
import { useUserManagement } from './hooks/useUserManagement';
import { BulkActionsToolbar } from './components/BulkActionsToolbar';
import { RoleAssignmentDialog } from './components/RoleAssignmentDialog';
import { RoleExtensionDialog } from './components/RoleExtensionDialog';
import { UserTable } from './components/UserTable';

interface RoleDialog {
  open: boolean;
  userId: string;
  role: 'admin' | 'moderator' | 'user';
}

interface ExtendDialog {
  open: boolean;
  userId: string;
  role: 'admin' | 'moderator' | 'user';
  currentExpiration: string;
}

export const AdminUsersDashboard = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedUsers,
    setSelectedUsers,
    bulkRole,
    setBulkRole,
    debouncedSearch,
    users,
    addRole,
    removeRole,
    bulkAddRole,
    bulkRemoveRole,
    extendRole,
    toggleUserSelection,
    toggleSelectAll,
    getRoleDetail,
    isRoleExpiringSoon,
  } = useUserManagement();

  const [roleDialog, setRoleDialog] = useState<RoleDialog>({
    open: false,
    userId: '',
    role: 'user',
  });
  const [extendDialog, setExtendDialog] = useState<ExtendDialog>({
    open: false,
    userId: '',
    role: 'user',
    currentExpiration: '',
  });

  const openRoleDialog = (userId: string, role: 'admin' | 'moderator' | 'user') => {
    setRoleDialog({ open: true, userId, role });
  };

  const closeRoleDialog = () => {
    setRoleDialog({ open: false, userId: '', role: 'user' });
  };

  const openExtendDialog = (
    userId: string,
    role: 'admin' | 'moderator' | 'user',
    currentExpiration: string
  ) => {
    setExtendDialog({ open: true, userId, role, currentExpiration });
  };

  const closeExtendDialog = () => {
    setExtendDialog({ open: false, userId: '', role: 'user', currentExpiration: '' });
  };

  const handleConfirmAddRole = (expiresAt?: string) => {
    addRole({
      userId: roleDialog.userId,
      role: roleDialog.role,
      expiresAt,
    });
  };

  const handleConfirmExtendRole = (newExpiresAt: string) => {
    extendRole({
      userId: extendDialog.userId,
      role: extendDialog.role,
      newExpiresAt,
    });
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'moderator' | 'user') => {
    removeRole({ userId, role });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>User Management</CardTitle>
          </div>
          <CardDescription>Manage user roles and permissions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <BulkActionsToolbar
              selectedCount={selectedUsers.size}
              bulkRole={bulkRole}
              onBulkRoleChange={setBulkRole}
              onBulkAdd={bulkAddRole}
              onBulkRemove={bulkRemoveRole}
              onClearSelection={() => setSelectedUsers(new Set())}
            />

            {debouncedSearch && (
              <p className="text-sm text-muted-foreground">
                Found {users?.length || 0} user(s)
              </p>
            )}
          </div>

          <UserTable
            users={users || []}
            selectedUsers={selectedUsers}
            onToggleUserSelection={toggleUserSelection}
            onToggleSelectAll={() => toggleSelectAll(users || [])}
            onAddRole={openRoleDialog}
            onRemoveRole={handleRemoveRole}
            onExtendRole={openExtendDialog}
            getRoleDetail={getRoleDetail}
            isRoleExpiringSoon={isRoleExpiringSoon}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>

      <RoleAssignmentDialog
        open={roleDialog.open}
        role={roleDialog.role}
        onClose={closeRoleDialog}
        onConfirm={handleConfirmAddRole}
      />

      <RoleExtensionDialog
        open={extendDialog.open}
        role={extendDialog.role}
        currentExpiration={extendDialog.currentExpiration}
        onClose={closeExtendDialog}
        onConfirm={handleConfirmExtendRole}
      />
    </div>
  );
};
