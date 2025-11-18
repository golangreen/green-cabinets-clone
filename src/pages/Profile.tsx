import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Calendar, Shield, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface UserRole {
  role: string;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setRoles(data || []);
      } catch (err: any) {
        console.error('Error fetching user roles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              View your account information and assigned roles
            </p>
          </div>

          <div className="grid gap-6">
            {/* Account Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email Address
                    </p>
                    <p className="text-base font-medium">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                {/* Account Created */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Account Created
                    </p>
                    <p className="text-base font-medium">
                      {user?.created_at
                        ? format(new Date(user.created_at), 'MMMM dd, yyyy')
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* User ID */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      User ID
                    </p>
                    <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block break-all">
                      {user?.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assigned Roles
                </CardTitle>
                <CardDescription>
                  Your current permissions and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load roles: {error}
                    </AlertDescription>
                  </Alert>
                ) : roles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {roles.map((roleData, index) => (
                        <Badge
                          key={index}
                          variant={getRoleBadgeVariant(roleData.role)}
                          className="text-sm px-3 py-1"
                        >
                          {roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1)}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {roles.map((roleData, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground flex items-center justify-between"
                        >
                          <span className="font-medium">
                            {roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1)}
                          </span>
                          <span className="text-xs">
                            Assigned {format(new Date(roleData.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No roles assigned yet. Contact an administrator if you need specific
                      permissions.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Need help?</p>
                    <p className="text-sm text-muted-foreground">
                      If you need to update your information or have questions about your roles,
                      please contact our support team.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
