import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/features/admin-security/hooks/useAdminCheck";
import { LoadingState } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();

  // Show loading state while checking authentication and admin status
  if (authLoading || adminLoading) {
    return <LoadingState />;
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  // Show access denied if authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You don't have permission to access this page. Admin privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = ROUTES.HOME}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
