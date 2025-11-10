import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Ban, Unlock, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const BlockedIPsTable = () => {
  const queryClient = useQueryClient();
  const [blockIpDialog, setBlockIpDialog] = useState(false);
  const [newBlockData, setNewBlockData] = useState({
    ip: '',
    reason: '',
    hours: 24,
  });

  const { data: blockedIps, isLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const unblockMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      const { data, error } = await supabase.rpc('unblock_ip', {
        target_ip: ipAddress,
        unblock_reason: 'Manual unblock from admin dashboard',
        performed_by_user: 'admin'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP unblocked successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to unblock IP: ${error.message}`);
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (data: { ip: string; reason: string; hours: number }) => {
      const { data: result, error } = await supabase.rpc('manual_block_ip', {
        target_ip: data.ip,
        block_reason: data.reason,
        block_duration_hours: data.hours,
        performed_by_user: 'admin'
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP blocked successfully');
      setBlockIpDialog(false);
      setNewBlockData({ ip: '', reason: '', hours: 24 });
    },
    onError: (error: any) => {
      toast.error(`Failed to block IP: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const activeBlocks = blockedIps?.filter(
    (ip) => new Date(ip.blocked_until) > new Date()
  );
  const expiredBlocks = blockedIps?.filter(
    (ip) => new Date(ip.blocked_until) <= new Date()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {activeBlocks?.length || 0} active blocks
          </p>
        </div>
        <Dialog open={blockIpDialog} onOpenChange={setBlockIpDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Ban className="mr-2 h-4 w-4" />
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.1"
                  value={newBlockData.ip}
                  onChange={(e) =>
                    setNewBlockData({ ...newBlockData, ip: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Suspicious activity detected..."
                  value={newBlockData.reason}
                  onChange={(e) =>
                    setNewBlockData({ ...newBlockData, reason: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="hours">Duration (hours)</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={720}
                  value={newBlockData.hours}
                  onChange={(e) =>
                    setNewBlockData({
                      ...newBlockData,
                      hours: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBlockIpDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => blockMutation.mutate(newBlockData)}
                disabled={!newBlockData.ip || !newBlockData.reason}
              >
                <Shield className="mr-2 h-4 w-4" />
                Block IP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Blocked Until</TableHead>
              <TableHead>Violations</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeBlocks && activeBlocks.length > 0 ? (
              activeBlocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-mono text-sm">
                    {block.ip_address}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {block.reason}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(block.blocked_until), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{block.violation_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={block.auto_blocked ? 'default' : 'secondary'}>
                      {block.auto_blocked ? 'Auto' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unblockMutation.mutate(block.ip_address)}
                      disabled={unblockMutation.isPending}
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No active blocks
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {expiredBlocks && expiredBlocks.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Show {expiredBlocks.length} expired blocks
          </summary>
          <div className="mt-2 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expired</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredBlocks.map((block) => (
                  <TableRow key={block.id} className="opacity-60">
                    <TableCell className="font-mono text-sm">
                      {block.ip_address}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {block.reason}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(block.blocked_until), 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </details>
      )}
    </div>
  );
};
