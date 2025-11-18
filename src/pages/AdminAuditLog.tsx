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
import { Search, Download, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AuditLogEntry {
  id: string;
  target_user_email: string;
  action: string;
  role: string;
  performed_by_email: string;
  details: any;
  created_at: string;
}

const AdminAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_change_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch =
      log.target_user_email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.performed_by_email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || log.role === roleFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesRole && matchesAction;
  });

  const exportToCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Action", "Role", "Target User", "Performed By", "Method"];
    const csvData = filteredLogs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.action,
      log.role,
      log.target_user_email,
      log.performed_by_email,
      (log.details as any)?.method || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `role-audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredLogs.length} audit log entries`);
  };

  if (isLoading) {
    return <LoadingState message="Loading audit logs..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Role Change Audit Log</CardTitle>
            </div>
            <CardDescription>
              Complete history of all role assignments and removals with filtering and export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by user email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats and Export */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    Showing <strong>{filteredLogs?.length || 0}</strong> of{" "}
                    <strong>{auditLogs?.length || 0}</strong> entries
                  </span>
                  {(roleFilter !== "all" || actionFilter !== "all" || debouncedSearch) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRoleFilter("all");
                        setActionFilter("all");
                        setSearchTerm("");
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <Button onClick={exportToCSV} disabled={!filteredLogs || filteredLogs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || roleFilter !== "all" || actionFilter !== "all"
                          ? "No audit logs found matching your filters"
                          : "No audit logs yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.action === "assigned" ? "default" : "secondary"}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.role === "admin"
                                ? "default"
                                : log.role === "moderator"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {log.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.target_user_email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.performed_by_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(log.details as any)?.method || "manual"}
                          </Badge>
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

export default AdminAuditLog;
