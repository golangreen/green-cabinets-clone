import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ban, Unlock, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const BlockedIPsTable = () => {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockHours, setBlockHours] = useState("24");
  
  const queryClient = useQueryClient();

  const { data: blockedIPs, isLoading } = useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const unblockMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      const { data, error } = await supabase.rpc("unblock_ip", {
        target_ip: ipAddress,
        unblock_reason: "Manual unblock from admin dashboard",
        performed_by_user: "admin",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP address unblocked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to unblock IP: ${error.message}`);
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("manual_block_ip", {
        target_ip: newIP,
        block_reason: blockReason,
        block_duration_hours: parseInt(blockHours),
        performed_by_user: "admin",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP address blocked successfully");
      setIsBlockDialogOpen(false);
      setNewIP("");
      setBlockReason("");
      setBlockHours("24");
    },
    onError: (error) => {
      toast.error(`Failed to block IP: ${error.message}`);
    },
  });

  const handleUnblock = (ipAddress: string) => {
    unblockMutation.mutate(ipAddress);
  };

  const handleBlock = () => {
    if (!newIP || !blockReason) {
      toast.error("Please fill in all fields");
      return;
    }
    blockMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading blocked IPs...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Blocked IP Addresses
        </CardTitle>
        <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Block IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block IP Address</DialogTitle>
              <DialogDescription>
                Manually block an IP address from accessing your application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP Address</Label>
                <Input
                  id="ip-address"
                  placeholder="192.168.1.1"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Reason for blocking this IP"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={blockHours}
                  onChange={(e) => setBlockHours(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBlock} disabled={blockMutation.isPending}>
                {blockMutation.isPending ? "Blocking..." : "Block IP"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Blocked Until</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedIPs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No blocked IPs
                  </TableCell>
                </TableRow>
              ) : (
                blockedIPs?.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono text-sm">{ip.ip_address}</TableCell>
                    <TableCell className="max-w-xs truncate">{ip.reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ip.violation_count}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(ip.blocked_until), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ip.auto_blocked ? "secondary" : "default"}>
                        {ip.auto_blocked ? "Auto" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(ip.ip_address)}
                        disabled={unblockMutation.isPending}
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
