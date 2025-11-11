import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import type { RoleChangeAudit } from '@/types';

interface AuditLogTableProps {
  logs: RoleChangeAudit[];
  searchTerm?: string;
  roleFilter?: string;
  actionFilter?: string;
}

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'assigned':
      return 'default';
    case 'removed':
      return 'secondary';
    case 'extended':
      return 'outline';
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'default';
    case 'moderator':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const AuditLogTable = ({
  logs,
  searchTerm,
  roleFilter,
  actionFilter,
}: AuditLogTableProps) => {
  const hasFilters = searchTerm || roleFilter !== 'all' || actionFilter !== 'all';

  return (
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
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {hasFilters ? 'No audit logs found matching your filters' : 'No audit logs yet'}
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">
                  {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(log.role)}>{log.role}</Badge>
                </TableCell>
                <TableCell className="font-medium">{log.target_user_email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {log.performed_by_email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{(log.details as any)?.method || 'manual'}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
