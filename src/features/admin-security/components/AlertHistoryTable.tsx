import { useAlertHistory } from '../hooks/useAlertHistory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { format } from "date-fns";

export const AlertHistoryTable = () => {
  const { data: alerts, isLoading } = useAlertHistory();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading alert history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent At</TableHead>
                <TableHead>Alert Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No alerts sent yet
                  </TableCell>
                </TableRow>
              ) : (
                alerts?.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(alert.sent_at), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>{alert.alert_type}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {JSON.stringify(alert.details)}
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
