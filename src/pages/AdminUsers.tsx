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
import { Search, UserPlus, UserMinus, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface User {
  user_id: string;
  email: string;
  created_at: string;
  roles: string[];
}

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_users_with_roles");
      if (error) throw error;
      return data as User[];
    },
  });

  const addRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const { error } = await supabase.rpc("add_user_role", {
        target_user_id: userId,
        target_role: role,
      });
      if (error) throw error;
      toast.success(`${role} role assigned successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign role");
    }
  };

  const removeRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const { error } = await supabase.rpc("remove_user_role", {
        target_user_id: userId,
        target_role: role,
      });
      if (error) throw error;
      toast.success(`${role} role removed successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove role");
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
            <div className="mb-6">
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
              {debouncedSearch && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {filteredUsers?.length || 0} user(s)
                </p>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No users found matching your search" : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user) => (
                      <TableRow key={user.user_id}>
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
                                onClick={() => addRole(user.user_id, "admin")}
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
                                onClick={() => addRole(user.user_id, "moderator")}
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
    </div>
  );
};

export default AdminUsers;
