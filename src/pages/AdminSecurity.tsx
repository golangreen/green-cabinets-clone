import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SecurityCharts } from "@/components/admin/SecurityCharts";
import { SecurityEventsTable } from "@/components/admin/SecurityEventsTable";
import { BlockedIPsTable } from "@/components/admin/BlockedIPsTable";
import { AlertHistoryTable } from "@/components/admin/AlertHistoryTable";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminSecurity = () => {
  const navigate = useNavigate();
  const { data: adminCheck, isLoading } = useAdminCheck();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Wait for admin check to complete
      if (!isLoading && !adminCheck?.isAdmin) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate, adminCheck, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Security Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor security events, manage blocked IPs, and view system alerts
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <SecurityCharts />
          <SecurityEventsTable />
          <BlockedIPsTable />
          <AlertHistoryTable />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminSecurity;
