import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export const SecurityEventsTable = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Function</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Severity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events && events.length > 0 ? (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="text-muted-foreground">
                  {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                </TableCell>
                <TableCell className="font-medium">
                  {event.event_type.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {event.function_name}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {event.client_ip}
                </TableCell>
                <TableCell>
                  <Badge variant={getSeverityColor(event.severity) as any}>
                    {event.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No security events found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
