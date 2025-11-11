import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingState from "@/components/LoadingState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, UserMinus, Shield, CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  user_id: string;
  email: string;
  created_at: string;
  roles: string[];
}

interface RoleAssignDialog {
  open: boolean;
  userId: string;
  role: "admin" | "moderator" | "user";
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<"admin" | "moderator" | "user">("moderator");
  const [roleDialog, setRoleDialog] = useState<RoleAssignDialog>({ open: false, userId: "", role: "user" });
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [isTemporary, setIsTemporary] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users_with_roles");
      if (error) throw error;
      return data as User[];
    },
  });

  const openRoleDialog = (userId: string, role: "admin" | "moderator" | "user") => {
    setRoleDialog({ open: true, userId, role });
    setExpirationDate(undefined);
    setIsTemporary(false);
  };

  const closeRoleDialog = () => {
    setRoleDialog({ open: false, userId: "", role: "user" });
    setExpirationDate(undefined);
    setIsTemporary(false);
  };

  const confirmAddRole = async () => {
    try {
      const targetUser = users?.find(u => u.user_id === roleDialog.userId);
      
      const { error } = await supabase.rpc("add_user_role", {
        target_user_id: roleDialog.userId,
        target_role: roleDialog.role,
        expiration_date: isTemporary && expirationDate ? expirationDate.toISOString() : null,
      });
      if (error) throw error;

      // Send notification email
      if (targetUser?.email) {
        const { data: { session } } = await supabase.auth.getSession();
        const performerEmail = session?.user?.email || 'System Administrator';

        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              userEmail: targetUser.email,
              action: 'assigned',
              role: roleDialog.role,
              performedBy: performerEmail
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }

      toast.success(`${roleDialog.role} role assigned successfully`);
      closeRoleDialog();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign role");
    }
  };

  const addRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const targetUser = users?.find(u => u.user_id === userId);
      
      const { error } = await supabase.rpc("add_user_role", {
        target_user_id: userId,
        target_role: role,
      });
      if (error) throw error;

      // Send notification email
      if (targetUser?.email) {
        const { data: { session } } = await supabase.auth.getSession();
        const performerEmail = session?.user?.email || 'System Administrator';

        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              userEmail: targetUser.email,
              action: 'assigned',
              role,
              performedBy: performerEmail
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }

      toast.success(`${role} role assigned successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign role");
    }
  };

  const removeRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const targetUser = users?.find(u => u.user_id === userId);
      
      const { error } = await supabase.rpc("remove_user_role", {
        target_user_id: userId,
        target_role: role,
      });
      if (error) throw error;

      // Send notification email
      if (targetUser?.email) {
        const { data: { session } } = await supabase.auth.getSession();
        const performerEmail = session?.user?.email || 'System Administrator';

        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              userEmail: targetUser.email,
              action: 'removed',
              role,
              performedBy: performerEmail
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }

      toast.success(`${role} role removed successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove role");
    }
  };

  const bulkAddRole = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      const { error, data } = await supabase.rpc("bulk_add_user_role", {
        target_user_ids: Array.from(selectedUsers),
        target_role: bulkRole,
      });
      if (error) throw error;

      // Send notification emails
      const { data: { session } } = await supabase.auth.getSession();
      const performerEmail = session?.user?.email || 'System Administrator';

      const emailPromises = Array.from(selectedUsers).map(userId => {
        const targetUser = users?.find(u => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return supabase.functions.invoke('send-role-notification', {
          body: {
            userEmail: targetUser.email,
            action: 'assigned',
            role: bulkRole,
            performedBy: performerEmail
          }
        }).catch(err => console.error('Failed to send notification:', err));
      });

      await Promise.allSettled(emailPromises);

      const message = (data as any)?.message || "Roles assigned successfully";
      toast.success(message);
      setSelectedUsers(new Set());
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign roles");
    }
  };

  const bulkRemoveRole = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      const { error, data } = await supabase.rpc("bulk_remove_user_role", {
        target_user_ids: Array.from(selectedUsers),
        target_role: bulkRole,
      });
      if (error) throw error;

      // Send notification emails
      const { data: { session } } = await supabase.auth.getSession();
      const performerEmail = session?.user?.email || 'System Administrator';

      const emailPromises = Array.from(selectedUsers).map(userId => {
        const targetUser = users?.find(u => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return supabase.functions.invoke('send-role-notification', {
          body: {
            userEmail: targetUser.email,
            action: 'removed',
            role: bulkRole,
            performedBy: performerEmail
          }
        }).catch(err => console.error('Failed to send notification:', err));
      });

      await Promise.allSettled(emailPromises);

      const message = (data as any)?.message || "Roles removed successfully";
      toast.success(message);
      setSelectedUsers(new Set());
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove roles");
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers?.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers?.map((u) => u.user_id) || []));
    }
  };

  const filteredUsers = users?.filter((user) =>
    user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Manage user roles and permissions across the platform
            </CardDescription>
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
              
              {/* Bulk Actions Toolbar */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Badge variant="secondary" className="text-sm">
                    {selectedUsers.size} user(s) selected
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Select
                      value={bulkRole}
                      onValueChange={(value: "admin" | "moderator" | "user") => setBulkRole(value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={bulkAddRole}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Role
                    </Button>
                    <Button size="sm" variant="outline" onClick={bulkRemoveRole}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Role
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedUsers(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}

              {debouncedSearch && (
                <p className="text-sm text-muted-foreground">
                  Found {filteredUsers?.length || 0} user(s)
                </p>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers?.length && filteredUsers?.length > 0}
                        onCheckedChange={toggleSelectAll}
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
                  {filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No users found matching your search" : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.user_id)}
                            onCheckedChange={() => toggleUserSelection(user.user_id)}
                            aria-label={`Select ${user.email}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.length === 0 ? (
                              <Badge variant="outline">user</Badge>
                            ) : (
                              user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant={role === "admin" ? "default" : "secondary"}
                                >
                                  {role}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                             {!user.roles.includes("admin") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRoleDialog(user.user_id, "admin")}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add Admin
                              </Button>
                            )}
                            {user.roles.includes("admin") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeRole(user.user_id, "admin")}
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Remove Admin
                              </Button>
                            )}
                            {!user.roles.includes("moderator") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRoleDialog(user.user_id, "moderator")}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add Moderator
                              </Button>
                            )}
                            {user.roles.includes("moderator") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeRole(user.user_id, "moderator")}
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Remove Moderator
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => !open && closeRoleDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {roleDialog.role} Role</DialogTitle>
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
                        "w-full justify-start text-left font-normal",
                        !expirationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate ? format(expirationDate, "PPP") : "Select expiration date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={setExpirationDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {expirationDate && (
                  <p className="text-sm text-muted-foreground">
                    Role will expire on {format(expirationDate, "PPP")} and be automatically removed
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRoleDialog}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAddRole}
              disabled={isTemporary && !expirationDate}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
